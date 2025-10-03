# 🚀 راهنمای کامل استقرار (Supabase + Vercel)

نسخه: 1.0 (Clean Rewrite)  
طراحی و توسعه نرم‌افزار توسط علیرضا حامد در پاییز 1404

> این فایل نسخه تمیز شدهٔ راهنمای استقرار است. فایل قدیمی `DEPLOYMENT.md` آسیب‌دیده باقی مانده تا بعداً در صورت نیاز آرشیو یا حذف شود.

---
## فهرست
1. معماری اجمالی
2. پیش‌نیازها
3. راه‌اندازی Supabase (DB + Index + Storage)
4. آماده‌سازی محیط محلی
5. تست محلی (Checklists)
6. استقرار روی Vercel (GitHub & CLI)
7. چک‌لیست پس از انتشار Production
8. بکاپ و بازیابی
9. امنیت و سخت‌سازی (Hardening)
10. اسکریپت‌های پیشنهادی
11. خطاهای متداول
12. نقشه بهبود آینده (Roadmap)

---
## 1. معماری اجمالی
| لایه | تکنولوژی | توضیح |
|------|----------|-------|
| UI | React + Vite + MUI (RTL) | مدیریت انبار و گزارش‌ها |
| Service Layer | `supabase.js` | CRUD + Workflow ها |
| DB | Supabase PostgreSQL | مدل انبارداری ساده |
| Storage | Supabase Storage (`drug-images`) | تصاویر بهینه (WebP) |
| Workflows | Receipts / Transfers | تنها مسیر مجاز تغییر موجودی |
| Auth ابتدایی | users table + bcrypt | نقش‌ها: admin / manager |

### ناوردایی‌ها
- موجودی منفی ممنوع.
- تغییر موجودی فقط از Receipt یا Transfer.
- واریانت دارو: (name, package_type, expire_date) یکتا.
- ترکیب (drug_id, warehouse_id, batch_number) در `inventory` یکتا.

---
## 2. پیش‌نیازها
| مورد | نسخه پیشنهادی |
|------|---------------|
| Node.js | >=18 |
| npm | >=9 |
| Python | (اختیاری) برای بکاپ |
| Git | فعال |
| Supabase Account | لازم |
| Vercel Account | لازم |

---
## 3. راه‌اندازی Supabase
### 3.1 ایجاد پروژه
1. https://supabase.com → New Project
2. نام: `pharmacy-inventory`
3. Region نزدیک + رمز قوی
4. Settings → API → کپی: Project URL + anon key

### 3.2 اجرای Schema
- SQL Editor → محتوای `database/schema.sql` → Run
- پیام موفقیت بررسی شود.

### 3.3 ایندکس‌ها
فایل: `database/migrations/2025_10_02_add_indexes.sql`

### 3.4 Storage Bucket
1. Storage → Create Bucket → `drug-images`
2. Public = ON

### 3.5 Policies (در صورت فعال بودن RLS Storage)
```sql
CREATE POLICY "Enable upload for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'drug-images');
CREATE POLICY "Give users access to view images" ON storage.objects
FOR SELECT USING (bucket_id = 'drug-images');
CREATE POLICY "Enable delete for authenticated users" ON storage.objects
FOR DELETE USING (bucket_id = 'drug-images');
```

---
## 4. آماده‌سازی محیط محلی
```bash
git clone https://github.com/<YOUR-USERNAME>/pharmacy-inventory.git
cd pharmacy-inventory
npm install
```
`.env.local`:
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```
اجرای توسعه:
```bash
npm run dev
```
ورود:
```
superadmin / A25893Aa
```
Build محلی:
```bash
npm run build
npm run preview
```

---
## 5. تست محلی
### 5.1 Smoke
| تست | انتظار |
|-----|--------|
| ورود | موفق |
| افزودن دارو | بدون خطا |
| جلوگیری از تکرار واریانت | خطای مناسب |
| آپلود تصویر | نمایش و حجم مناسب |

### 5.2 گردش موجودی
| سناریو | انتظار |
|--------|--------|
| Receipt → complete | افزایش موجودی |
| Transfer → complete | کسر مبدا + افزایش مقصد |
| Transfer discrepancy | status=discrepancy |

### 5.3 گزارش انقضا
- Expired (diffDays < 0)
- ≤30 روز
- 31–90 روز

---
## 6. استقرار روی Vercel
### روش GitHub
```bash
git init
git add .
git commit -m "deploy: initial"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/pharmacy-inventory.git
git push -u origin main
```
سپس در Vercel:
1. New Project → Import
2. تنظیمات Build:
   - Framework: Vite
   - Build Command: npm run build
   - Output: dist
3. Environment Vars:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
4. Deploy

### روش CLI
```bash
npm i -g vercel
vercel login
vercel
overcel env add VITE_SUPABASE_URL
overcel env add VITE_SUPABASE_ANON_KEY
overcel --prod
```

---
## 7. چک‌لیست Production
| مورد | وضعیت |
|------|--------|
| ورود | ✅ |
| دارو جدید | ✅ |
| جلوگیری از تکرار | ✅ |
| Receipt کامل | ✅ |
| Transfer کامل | ✅ |
| مغایرت Transfer | ✅ |
| گزارش انقضا | ✅ |
| Console Errors | صفر |

---
## 8. بکاپ و بازیابی
اجرای دستی:
```bash
python backup_system.py
```
Cron نمونه (روزانه 02:00):
```
0 2 * * * /usr/bin/python3 /path/to/backup_system.py >> /var/log/pharmacy_backup.log 2>&1
```
تست بازیابی حداقل ماهانه.

---
## 9. امنیت و Hardening
| حوزه | اقدام |
|------|-------|
| Passwords | bcrypt (ورود ایمن) |
| RLS | فعال‌سازی مرحله‌ای |
| Audit Log | آینده (ایجاد جدول رویداد) |
| Expiry Alerts | ایمیل/پیامک زمان‌بندی |
| Least Privilege | عدم استفاده از service key در Front |

---
## 10. اسکریپت‌های پیشنهادی
| فایل | هدف |
|------|-----|
| backup_system.py | بکاپ دیتابیس |
| smokeCheck.mjs | تست واردکننده/توابع اصلی (در حال افزودن) |
| notify_expiry.mjs | (آینده) هشدار انقضا |

---
## 11. خطاهای متداول
| خطا | علت | راه‌حل |
|-----|------|--------|
| UNIQUE violation drugs | واریانت تکراری | تغییر expire_date یا package_type |
| تصویر 404 | Bucket Private | Public یا signed URL |
| موجودی نامعتبر | دستکاری مستقیم | فقط Receipt/Transfer |
| Build Fail | نسخه Node | تنظیم Node 18 |
| ورود ناموفق | hash mismatch | بررسی password_hash |

---
## 12. Roadmap
- فعال‌سازی RLS روی inventory / receipts / transfers
- TypeScript Migration
- تست Vitest برای expiry و workflows
- Audit Log + Sentry
- Pivot Reports (BI سبک)
- سیستم هشدار انقضا

---
پایان نسخه تمیز. 🌱
