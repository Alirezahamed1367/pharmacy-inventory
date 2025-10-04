# نقشه راه Auth و RLS نهایی

هدف: انتقال از احراز هویت سفارشی لوکال به Supabase Auth + RLS امن.

## مرحله 1: آماده‌سازی داده
1. افزودن ستون (در صورت نیاز) `auth_user_id UUID` به جدول `users` (یا جایگزینی id فعلی با auth.uid()).
2. همگام‌سازی کاربران فعلی: ایجاد حساب auth برای superadmin.

## مرحله 2: پیاده‌سازی ورود جدید
- جایگزینی متد فعلی signIn در frontend با:
```js
await supabase.auth.signInWithPassword({ email, password })
```
- پس از ورود: فراخوانی پروفایل: `select role, full_name from users where id = auth.uid()`

## مرحله 3: بازگرداندن RLS
- اجرای اسکریپت حذف سیاست‌های باز:
```sql
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
-- حذف سیاست های باز قبلی
DROP POLICY IF EXISTS drugs_all_open ON public.drugs;
DROP POLICY IF EXISTS drugs_insert_open ON public.drugs;
DROP POLICY IF EXISTS drugs_update_open ON public.drugs;
DROP POLICY IF EXISTS drugs_delete_open ON public.drugs;
```
- بازسازی سیاست محدود:
```sql
CREATE POLICY drugs_select_all ON public.drugs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY drugs_insert_admin_manager ON public.drugs FOR INSERT WITH CHECK (is_admin() OR is_manager());
CREATE POLICY drugs_update_admin ON public.drugs FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY drugs_delete_admin ON public.drugs FOR DELETE USING (is_admin());
```
- مشابه برای بقیه جداول (warehouses, inventory, receipts ...)

## مرحله 4: تست نقش ها
1. ورود با admin → درج / ویرایش دارو OK.
2. ورود با manager → درج دارو OK (طبق سیاست فعلی) یا اگر نمی‌خواهید، حذف شرط manager.
3. ورود با کاربر غیرنقش → فقط مشاهده.

## مرحله 5: سخت‌سازی اضافه
- تنظیم Storage policy: محدود کردن حذف فایل‌ها به admin.
- فعال‌سازی Logflare/pgAudit.
- افزودن نرخ محدودسازی (Rate Limiting) در لایه Front اگر لازم است.

## مرحله 6: مستندات
- به‌روزرسانی README و RUNBOOK_FAST با بخش «Secure Mode». 

## چک لیست نهایی
- [ ] همه جداول حساس RLS فعال
- [ ] هیچ سیاست `WITH CHECK (true)` باقی نمانده
- [ ] تست درج/ویرایش/حذف با نقش های مختلف
- [ ] auditLots پاس شده و lot_id NOT NULL اعمال شده
- [ ] Backup خودکار Supabase (PITR) فعال

---
پاییز 1404
