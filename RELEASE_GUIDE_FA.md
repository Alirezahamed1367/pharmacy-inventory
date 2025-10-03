# راهنمای انتشار و استقرار نهایی سیستم مدیریت انبار دارو

این سند گام‌به‌گام فرآیند آماده‌سازی، استقرار و تست نسخه Production را توضیح می‌دهد.

## 1. راهبرد استقرار
الگوی انتخاب‌شده: یک مخزن GitHub + Vercel (Preview برای هر PR) + یک پروژه Supabase (در فاز اول). در مرحله بعد می‌توان پروژه Supabase دوم برای Staging ایجاد کرد.

## 2. پیش‌نیازها
- حساب GitHub
- حساب Vercel
- حساب Supabase
- Node.js 20+
- دسترسی اجرا SQL در Supabase

## 3. متغیرهای محیطی (Env)
در ریشه پروژه فایل `.env.local` بسازید (یا در Vercel → Settings → Environment Variables تعریف کنید):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

فایل نمونه: `.env.example`.

## 4. راه‌اندازی Supabase
1. ایجاد پروژه جدید در Supabase (Region نزدیک).
2. وارد بخش SQL Editor شوید.
3. محتوای `database/schema.sql` را اجرا کنید.
4. تمام فایل‌های پوشه `database/migrations` را به ترتیب زمان اجرا کنید (مهاجرت اخیر: `2025_10_03_add_supplier_per_item_and_document_date.sql`).
5. در Storage یک Bucket به نام `drug-images` بسازید (Public).
6. (اختیاری) CORS برای دامنه Vercel را اضافه کنید.
7. در جدول `users` رکورد superadmin طبق seed موجود است (نام کاربری: `superadmin`).
8. چند تامین‌کننده و انبار نمونه اضافه کنید:
```sql
insert into public.suppliers (name) values ('تامین‌کننده الف'),('شرکت بهداشت‌گستر');
insert into public.warehouses (name, location) values ('انبار مرکزی','تهران'),('انبار غرب','کرج');
```

## 5. آماده‌سازی مخزن GitHub
1. مخزن ایجاد کنید (private یا public).
2. کل پروژه لوکال را push کنید (`main` به عنوان شاخه اصلی).
3. Branch Protection (اختیاری): نیاز به PR review قبل از merge.
4. Tag نسخه اولیه: `v1.0.0` بعد از اولین استقرار موفق.

## 6. اتصال به Vercel
1. New Project → Import from GitHub → انتخاب مخزن.
2. Framework: Vite (Auto detect).
3. Build Command: `npm run build` – Output: `dist`.
4. Env Vars: مقداردهی همان دو متغیر.
5. Deploy.
6. دامنه Production ثبت و در صورت نیاز دامنه سفارشی وصل شود.

## 7. Smoke Test بعد از Deploy
روی سرور (محیط Vercel) اتوماتیک Build شده است. به URL Production بروید:
1. ورود با `superadmin / A25893Aa`.
2. ساخت یک دارو (نام نمونه + تاریخ انقضا آینده + تصویر کوچک).
3. ایجاد رسید با یک آیتم (انبار مقصد = انبار مرکزی). تکمیل رسید.
4. بررسی Dashboard (آمار + فعالیت اخیر).
5. ایجاد حواله انتقال بین دو انبار (در صورت موجودی) و تکمیل.
6. بررسی تب «گزارش حرکات» – رکوردها دیده شوند.
7. آپلود تصویر و مشاهده URL (Network 200 و نمایش در جدول داروها).

## 8. اجرای اسکریپت Smoke محلی (اختیاری)
```
node scripts/smokeCheck.mjs
```
موارد حیاتی (env و توابع) باید PASS برگردانند.

## 9. چک‌لیست امنیت و سخت‌سازی
- فعال‌سازی RLS بعد از نهایی شدن (فعلاً غیرفعال برای توسعه).
- افزودن سیاست‌ها: فقط نقش‌های مجاز بتوانند درج/ویرایش.
- بررسی Public Bucket: اگر نیاز به محدودیت داشت، لینک‌های امضاشده (signed URLs).
- سیاست رمز عبور: حداقل 8 کاراکتر، پیچیدگی (در UI enforce).
- Rate Limiting: در آینده با edge function یا Reverse Proxy.
- Audit Log: جدول ساده برای درج رخدادهای حساس (ثبت/حذف دارو، تکمیل رسید/حواله).

## 10. انتشار نسخه (Release)
1. پس از عبور از تست‌ها: ایجاد Tag در GitHub:
```
git tag v1.0.0
git push origin v1.0.0
```
2. در بخش Releases توضیحات تغییرات.
3. بعد از هر بهبود مهم: افزایش نسخه (Semantic Versioning: MAJOR.MINOR.PATCH).

## 11. سناریوهای تست دستی (پس از هر انتشار)
1. Login / Logout.
2. تغییر رمز عبور (کاربر تست).
3. ایجاد 3 دارو با تاریخ‌های مختلف (Expired, 0–30, 31–90 روز) → مشاهده در گزارش.
4. رسید با 2 آیتم و دو تامین‌کننده متفاوت → تکمیل → بررسی موجودی.
5. حواله بین انبارها → مغایرت (یک آیتم را با تعداد متفاوت دریافت کنید) → وضعیت discrepancy.
6. آپلود تصویر + حذف و جایگزینی.
7. گزارش حرکات: ترتیب زمانی صحیح.
8. گزارش موجودی: فیلتر نام دارو.

## 12. برنامه نگهداری / پشتیبان‌گیری
- استفاده از اسکریپت `backup_system.py` (تنظیم کران روی سرور مستقل یا GitHub Action روزانه با Supabase dump → Secure Storage).
- نگهداری حداقل 7 نسخه روزانه + 4 نسخه هفتگی.

## 13. گسترش آتی (Backlog پیشنهادی)
- Dark Mode.
- اعلان خودکار داروهای نزدیک انقضا (Scheduled Function).
- RLS + JWT Auth کاملاً ایزوله.
- گزارش PDF.
- Dashboard Real-time (کانال‌های Supabase Realtime).

موفق باشید 🌱
