# راهنمای گام‌به‌گام بهینه‌سازی و یکپارچگی «قرارداد داده» (Data Contract)

طراحی و توسعه: علیرضا حامد – پاییز ۱۴۰۴

این سند، نقشه‌ی راه عملی برای اطمینان از «ثبات، صحت، کارایی و تکامل‌پذیری» قرارداد داده (Data Contract) در سیستم مدیریت موجودی داروخانه است. تمرکز اصلی: سادگی، قابلیت ممیزی، و جلوگیری از واگرایی داده بین کلاینت و پایگاه داده.

---
## 1. تعاریف پایه
| اصطلاح | معنی | مثال در پروژه |
|--------|------|---------------|
| Data Contract | توافق صریح دربارهٔ ساختار، معانی، نوع و محدودیت فیلدها | جدول `drugs` با فیلدهای (name, package_type, expire_date) و قاعده UNIQUE |
| Invariant (ناوردایی) | قاعده‌ای که همیشه باید برقرار باشد | موجودی هیچ‌گاه منفی نمی‌شود |
| Versioning | مدیریت تکامل بدون شکستن کلاینت | تغییر schema → افزایش metadata نسخه |

---
## 2. مدل دامنه (Domain Model)
موجودیت‌ها:
- Users (نقش‌ها: admin, manager)
- Warehouses
- Drugs (هر ردیف = واریانت یکتا: name + package_type + expire_date)
- Inventory (موجودی واقعی هر واریانت در هر انبار + batch اختیاری)
- Receipts / Receipt Items (ورود رسمی کالا)
- Transfers / Transfer Items (انتقال بین انبارها + مغایرت)
- Suppliers

روابط کلیدی:
- inventory.drug_id → drugs.id
- inventory.warehouse_id → warehouses.id
- receipt_items.receipt_id → receipts.id
- transfer_items.inventory_id → inventory.id (ردیف منشأ انتقال)

---
## 3. قرارداد داده (Specification)
### 3.1 نام‌گذاری
- snake_case در دیتابیس / camelCase در فرانت در صورت نیاز (فعلاً JS خام → همان snake_case نگه داشته می‌شود)
- فیلدهای زمانی: created_at, updated_at, completed_at
### 3.2 انواع (Types)
- UUID برای شناسه‌ها (مزیت: غیر قابل حدس + مهاجرت آسان)
- DATE فقط برای expire_date در جدول drugs (انقضا در inventory تکرار نمی‌شود → جلوگیری از ناسازگاری)
- INTEGER برای quantity (با CHECK ≥ 0)
### 3.3 ناوردایی‌ها (Invariants)
- (name, package_type, expire_date) یکتا در `drugs`
- (drug_id, warehouse_id, batch_number) یکتا در `inventory`
- quantity ≥ 0 همیشه (رسید / حواله تنها مسیر تغییر)
- transfer.status ∈ {in_transit, completed, discrepancy}
- receipt.status ∈ {pending, completed}
### 3.4 قوانین عملیات
| عملیات | منبع حقیقت | مسیر مجاز | رد حالت غیرمجاز |
|--------|------------|-----------|------------------|
| افزودن موجودی | receipts.complete | receipt_items → inventory upsert | ویرایش مستقیم جدول inventory |
| انتقال انبار | transfers.create / complete | کاهش مبدا، افزودن مقصد | درج مستقیم در inventory مقصد |
| اصلاح مغایرت | completeTransfer با quantity_received | ثبت status discrepancy | دستکاری دستی رکورد transfer_items |

---
## 4. نسخه‌بندی (Evolution & Versioning)
پیشنهاد: افزودن جدول `system_metadata (key TEXT PRIMARY KEY, value TEXT)` و نگهداری `schema_version`.
نمونه به‌روزرسانی:
```sql
INSERT INTO system_metadata(key,value) VALUES('schema_version','2.0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```
اصول:
1. اضافه کردن فیلد جدید → NULLable + انتشار کلاینت جدید → بعد اجباری‌سازی.
2. تغییر نوع فیلد → مرحله‌ی Migration با ستون جدید + انتقال داده + حذف قدیمی.
3. حذف فیلد → Deprecation اعلان + حداقل ۱ چرخه انتشار.

---
## 5. اعتبارسنجی (Validation Strategy)
لایه‌ها:
1. UI: جلوگیری از ارسال ناقص (مثال: نام دارو + تاریخ انقضا الزامی)
2. Service Layer (supabase.js): بازگرداندن پیام خطای معنادار:
```javascript
if (!name || !expire_date) return { error: { message: 'نام و تاریخ انقضا الزامی هستند' } }
```
3. پایگاه داده: CHECK و UNIQUE (آخرین خط دفاع)

چک لیست اعتبارسنجی:
- ورود دارو تکراری؟ → خطای منحصر بفرد بودن
- تعداد منفی؟ → رد در انتقال / رسید
- انتقال به همان انبار؟ → CHECK منطقی در createTransfer

---
## 6. مدیریت خطا (Error Handling)
فرمت پیشنهادی پاسخ در Service:
```json
{ "data": <any|null>, "error": { "message": "..." } }
```
نمایش در UI: Alert فارسی + امکان Retry.

---
## 7. بهینه‌سازی پایگاه داده (DB Optimization)
### 7.1 ایندکس‌های پیشنهادی
```sql
-- جستجوی سریع بر اساس تاریخ انقضا
CREATE INDEX IF NOT EXISTS idx_drugs_expire_date ON drugs(expire_date);

-- گزارش‌دهی سریع بر اساس انبار
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);

-- ترکیبی برای کوئری پرتکرار (دارو + انبار)
CREATE INDEX IF NOT EXISTS idx_inventory_drug_warehouse ON inventory(drug_id, warehouse_id);

-- وضعیت‌ها برای فیلتر لیست‌ها
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
```
### 7.2 کاهش Round Trip
- گروه‌بندی SELECT ها: استفاده از `getInventoryDetailed()` بجای چندین فراخوانی مجزا.
- فقط فیلدهای لازم را انتخاب کنید؛ در صورت رشد پروژه، Projection هدفمند.

---
## 8. الگوی فراخوانی API / Service Layer
الگوی فعلی: توابع ماژول `supabase.js`.
بهبود پیشنهادی: اضافه کردن Wrapper خطا + Logging سطح debug.
مثال Wrapper:
```javascript
async function wrap(name, fn) {
  try { return await fn() } catch (e) { return { data: null, error: { message: `${name} failed: ${e.message}` } } }
}
```

---
## 9. مدیریت مهاجرت (Migrations)
چرخه پیشنهادی:
1. نوشتن فایل SQL جداگانه (`/database/migrations/2025_10_02_add_indexes.sql`)
2. اجرای محلی و روی محیط تست
3. به‌روزرسانی نسخه در system_metadata
4. ثبت در CHANGELOG مختصر

---
## 10. تست (Testing Strategy)
### انواع تست:
- Unit: توابع محاسبه diffDays / دسته‌بندی انقضا
- Integration: سناریو Receipt → Inventory
- Workflow: createTransfer → completeTransfer (Case: discrepancy)

### سناریوهای کلیدی
| سناریو | گام‌ها | انتظار |
|--------|--------|--------|
| ورود رسید | createReceipt + completeReceipt | افزایش موجودی یا ایجاد رکورد جدید |
| انتقال عادی | createTransfer (کاهش مبدا) + completeTransfer (افزایش مقصد) | status=completed |
| انتقال با مغایرت | quantity_received ≠ quantity_sent | status=discrepancy |
| انقضا | داروی با expire_date گذشته | در لیست expired |

---
## 11. مانیتورینگ و لاگ
فعلاً: Console logging.
پیشنهاد آینده: لاگ ساخت‌یافته (JSON) + جدولی برای رخدادهای حساس (audit_log).

---
## 12. امنیت و RBAC
- فعلاً RLS غیرفعال (مرحله توسعه). مرحله بعد: فعال‌سازی RLS + Policies:
```sql
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY sel_inventory_admin ON inventory FOR SELECT USING (true);
```
- ذخیره نکردن رمز عبور خام (در schema فعلی password_hash موجود است → اطمینان از bcrypt سمت بک‌اند).

---
## 13. بهینه‌سازی شبکه / واکنش‌پذیری
- فشرده‌سازی تصاویر (Implemented WebP <= ~300KB)
- تقسیم بار درخواست‌ها (Lazy load Reports)
- Debounce جستجوی دارو (در صورت افزایش حجم)

---
## 14. مدیریت تصاویر
Pipeline فعلی:
1. Resize با Canvas
2. WebP با کیفیت تطبیقی
3. نمایش متریک (originalKB / finalKB / ratio)
پیشنهاد بعدی: کش CDN یا Storage Transform.

---
## 15. پشتیبان‌گیری و Disaster Recovery
✔ اسکریپت توسعه داده شده (`backup_system.py`):
- نسخه + hash + متادیتا
- فشرده‌سازی (zip / tar.gz)
- قابلیت افزودن مقصد (GitHub / Email)

چک لیست روزانه:
| مورد | وضعیت |
|------|--------|
| تولید فایل | ✅ |
| بررسی هش | ✅ |
| تست بازیابی | (حداقل هفتگی) |

---
## 16. چک لیست انتشار (Release Checklist)
- [ ] Migrations اجرا شده
- [ ] نسخه schema به‌روز
- [ ] تست سناریوهای Receipt/Transfer پاس
- [ ] گزارش انقضا صحت‌سنجی شد
- [ ] بکاپ آخر < 24h
- [ ] خطاهای مرورگر بدون Exception حل نشده
- [ ] اندازه باندل (در صورت افزودن کتابخانه) بررسی

---
## 17. نقشه بهبودهای آینده
| اولویت | مورد | توضیح |
|--------|------|-------|
| بالا | RLS + Policies | ایزوله‌سازی دسترسی در Supabase |
| بالا | تست خودکار | افزودن vitest / jest برای محاسبات و Service mock |
| متوسط | TypeScript Migration | کاهش باگ قرارداد داده |
| متوسط | Audit Log | رهگیری فعالیت حساس (حذف دارو، مغایرت) |
| پایین | گزارش‌گیری پیشرفته | Pivot انبار / انقضا / موجودی برای BI |

---
## 18. نمونه کد بهبود یافته (Grouping + Expiry Classification)
```javascript
// دسته‌بندی یکباره پس از fetch
function classifyExpiry(items) {
  const today = new Date();
  return items.map(it => {
    if (!it.expire_date) return { ...it, expiry_status: 'unknown' };
    const d = new Date(it.expire_date);
    const diff = Math.ceil((d - today) / 86400000);
    let status = 'healthy';
    if (diff < 0) status = 'expired';
    else if (diff <= 30) status = 'soon';
    else if (diff <= 90) status = 'mid';
    return { ...it, diffDays: diff, expiry_status: status };
  });
}
```

---
## 19. چک لیست روزمره توسعه‌دهنده (Dev Daily Checklist)
- [ ] اجرای lint (در صورت اضافه‌شدن)
- [ ] بررسی لاگ خطا در کنسول مرورگر
- [ ] مرور اندازه Requests شبکه (Network → Largest Payload)
- [ ] صحت تاریخ‌های انقضا (UTC vs Local) – استفاده از DATE بدون TZ ✔

---
## 20. خلاصه
با جداسازی «اطلاعات ثابت (drugs)» از «تحرکات موجودی (receipts/transfers)» و تحمیل مسیرهای رسمی برای تغییر موجودی، Data Contract شما قابل اعتماد و پایدار باقی می‌ماند. این سند را به‌روزرسانی کنید هر زمان که:
- فیلد جدیدی افزوده می‌شود
- رفتار فرآیند ورود/انتقال تغییر می‌کند
- سیاست امنیتی جدیدی اعمال می‌گردد

موفق باشید 🌱
