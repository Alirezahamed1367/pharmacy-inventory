# مهاجرت به PocketBase

این سند مراحل و توضیحات لازم برای استفاده از PocketBase به عنوان بک‌اند جایگزین را ارائه می‌کند.

## اهداف
- استقرار بسیار ساده (یک باینری)، مناسب محیط‌های با محدودیت دسترسی.
- کاهش پیچیدگی RLS و تکیه بر Rule ها و Role های خود PocketBase.
- استفاده از SQLite داخلی برای حالت های سبک + امکان مهاجرت آتی به Postgres خارجی با لایه Fastify در صورت نیاز.

## راه‌اندازی خودکار کالکشن‌ها (پیشنهادی)
اسکریپت `npm run pb:init` به صورت خودکار کالکشن‌های اصلی را می‌سازد و فیلدهای `role` و `is_active` را به کالکشن auth اضافه می‌کند.

### مراحل:
1. اجرای PocketBase:
```bash
./pocketbase serve
```
2. (فقط اولین بار) در UI یک ادمین بساز (ایمیل و رمز).
3. در PowerShell/ترمینال:
```powershell
$env:PB_URL='http://127.0.0.1:8090'
$env:PB_ADMIN_EMAIL='admin@example.com'
$env:PB_ADMIN_PASSWORD='YourAdminPassword'
npm run pb:init
```
4. بعد از پیام `[DONE] Initialization complete.` صفحه Collections را Refresh کن.

برای کسانی که می‌خواهند حالت دستی داشته باشند هنوز می‌توانند از فایل `pocketbase_schema.json` (فرمت آرایه‌ای) استفاده کنند.

## متغیرهای محیطی Frontend
در فایل `.env` (یا تنظیمات Cloudflare Pages / Netlify):
```
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=https://your-pocketbase-domain
```
(اگر Fastify می‌خواهید:) `VITE_BACKEND_MODE=fastify` و `VITE_API_URL=https://your-fastify-api`

## احراز هویت
- کالکشن `users` از نوع auth است.
- فیلد `role` مقادیر: `super_admin`, `admin`, `manager`.
- بعد از وارد کردن Schema یک کاربر سوپراَدْمین دستی بسازید و رمز قوی تعیین کنید.

## منطق انبار / موجودی
نسخه فعلی آداپتر PocketBase فقط CRUD پایه را فراهم می‌کند.
### عملیات تکمیلی (Future Work)
- تکمیل رسید (Receipt Complete): اعمال تغییر موجودی (inbound) به صورت اتمیک. راهکار پیشنهادی:
  - ایجاد یک Action (Go hook) یا Cloud Function (در لایه Fastify) برای قفل خوشه ای و ثبت رکوردهای inventory.
- تکمیل انتقال (Transfer Complete): کاهش منبع و افزایش مقصد در یک تراکنش شبیه‌سازی شده.

## استراتژی Hybrid
در صورت نیاز به تراکنش های پیچیده:
- نگه داشتن Fastify بعنوان لایه Orchestrator: Frontend -> Fastify -> PocketBase (CRUD + consistency layer).
- یا استفاده از External SQLite/Postgres و PocketBase صرفاً برای auth + فایل ها.

## آپلود تصاویر
فعلاً آپلود مستقیم فایل در فیلد `image` رکورد دارو (drugs) توصیه شده؛ آداپتر نمونه آپلود deferred را برمی‌گرداند و باید پس از ایجاد رکورد دارو، با فرم‌دیتا update شود.
Example:
```js
const formData = new FormData();
formData.append('image', file);
await pb.collection('drugs').update(drugId, formData);
```

## گام‌های مهاجرت داده (اختیاری)
1. استخراج داده فعلی از Postgres (جداول drugs, warehouses, drug_lots, inventory ...)
2. نگاشت ستون‌ها به فیلدهای PocketBase (شناسه‌ها را حفظ یا map کنید)
3. وارد کردن دسته‌ای (Batch) با اسکریپت Node که از Admin API استفاده می‌کند.

## مسیر بعدی
- تکمیل `backendProvider` در صفحات UI (جایگزینی مستقیم import از `apiClient`).
- توسعه Hook یا Action برای اعمال تراکنش موجودی هنگام تکمیل رسید/انتقال.
- مستند کردن محدودیت‌های کنونی در README.

---
طراحی و توسعه نرم‌افزار توسط علیرضا حامد در پاییز 1404
