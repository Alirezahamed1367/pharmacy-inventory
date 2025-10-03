# RLS Security Plan (Phase Draft)

هدف: محدودسازی دسترسی بر اساس نقش (superadmin/admin کامل، مدیر هر انبار فقط داده‌های همان انبار) و جلوگیری از دستکاری موجودی خارج از حوزه کاربر.

## نقش‌ها
- `admin` (شامل superadmin): دسترسی کامل خواندن/نوشتن.
- `manager`: فقط انبارهایی که `warehouses.manager_user_id = auth.uid()`.
- (کاربران عادی احتمالی آینده) : فقط خواندن محدود (در حال حاضر تعریف نشده).

## جداول و سیاست‌ها
| جدول | سیاست خواندن | سیاست نوشتن | توضیح |
|------|---------------|--------------|-------|
| warehouses | admin: همه; manager: ردیف‌هایی که manager_user_id = auth.uid() | admin: همه; manager: فقط update ردیف خودش (مثلاً یادداشت آینده) | ایجاد انبار فقط admin |
| inventory | admin: همه; manager: فقط رکوردهای warehouse متعلق به او | admin: همه; manager: فقط update quantity در سناریوهای مجاز (از طریق receipt/transfer) | حذف مستقیم ممنوع |
| receipts | admin: همه; manager: فقط رسیدهایی که destination_warehouse_id در انبارهای اوست | admin: ایجاد/تکمیل; manager: ایجاد/تکمیل فقط برای انبار خودش | وضعیت pending -> completed |
| receipt_items | پیرو parent receipt | پیرو parent receipt |  |
| transfers | admin: همه; manager: فقط اگر source یا destination انبار خودش باشد (حداقل source) | ایجاد: مبدا باید انبار خودش باشد. تکمیل: اگر مقصد انبار خودش باشد. |  |
| transfer_items | پیرو parent transfer | پیرو parent transfer |  |
| drugs | همه کاربران ثبت شده (read) | فقط admin |  |
| drug_lots | read: مرتبط با drugs قابل مشاهده | فقط admin یا از مسیر receipt ایجاد lot | Receipt مسیر کنترل شده |
| users | فقط admin | فقط admin |  |

## توابع کمکی پیشنهادی
```sql
create or replace function is_admin() returns boolean language sql stable as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create or replace function is_manager() returns boolean language sql stable as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'manager');
$$;
```

## نمونه سیاست‌ها (نمونه اولیه)
```sql
-- Warehouses Read
create policy wh_read_admin on public.warehouses for select using ( is_admin() );
create policy wh_read_manager on public.warehouses for select using ( is_manager() and manager_user_id = auth.uid() );

-- Inventory Read
create policy inv_read_admin on public.inventory for select using ( is_admin() );
create policy inv_read_manager on public.inventory for select using (
  is_manager() and warehouse_id in (
    select id from public.warehouses where manager_user_id = auth.uid()
  )
);

-- Inventory Update (manager limited)
create policy inv_update_admin on public.inventory for update using ( is_admin() ) with check (true);
create policy inv_update_manager on public.inventory for update using (
  is_manager() and warehouse_id in (
    select id from public.warehouses where manager_user_id = auth.uid()
  )
) with check (
  warehouse_id in (select id from public.warehouses where manager_user_id = auth.uid())
);
```

## ترتیب اعمال
1. Migration فعال‌سازی RLS و ایجاد توابع + سیاست‌ها.
2. اعتبارسنجی فرانت: در بارگذاری صفحات، محدودیت را با پاسخ‌ها تست می‌کنیم.
3. Logging: حداقل ثبت رویداد شکست سیاست (از طریق pg audit یا log level) در آینده.
4. مرحله بعد: تفکیک role superadmin جداگانه در صورت نیاز.

## ملاحظات
- عملیات انتقال/رسید از لایه API (Supabase client) انجام می‌شود؛ با داشتن سیاست‌های دقیق نیازی به منطق extra در FE نیست.
- مسیر ایجاد lot در `createReceipt` برای manager باز است؛ سیاست drug_lots باید insert را یا فقط admin یا شرط receipt context بپذیرد. (مرحله بعد: wrapper function برای ساخت lot + receipt).
- حذف رکوردهای inventory/receipts/transfers فعلاً نمی‌خواهیم (پایداری audit). می‌توانیم سیاست delete تعریف نکنیم.

## فاز بعد
- افزودن ستون audit (changed_by) با trigger.
- تابع محافظ برای جلوگیری از افزایش منفی quantity.

```sql
create or replace function prevent_negative_inventory() returns trigger language plpgsql as $$
begin
  if new.quantity < 0 then
    raise exception 'Inventory cannot be negative';
  end if;
  return new;
end;$$;

create trigger trg_no_negative_inventory before insert or update on public.inventory
for each row execute function prevent_negative_inventory();
```

این سند مبنا برای migration RLS است.
