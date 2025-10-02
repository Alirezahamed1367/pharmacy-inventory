# 🚀 راهنمای کامل استقرار پروژه# 🚀 راهنمای Deployment - سیستم انبارداری دارو



## مرحله ۱: آماده‌سازی Supabase## مراحل بارگذاری روی Vercel



### 1.1 ایجاد پروژه Supabase### 1. آماده‌سازی اولیه

1. وارد [Supabase Dashboard](https://supabase.com/dashboard) شوید

2. روی "New project" کلیک کنید```bash

3. نام پروژه: `pharmacy-inventory`# نصب Vercel CLI

4. منطقه: نزدیک‌ترین منطقه به شماnpm i -g vercel

5. رمز عبور دیتابیس قوی انتخاب کنید

# تست build محلی

### 1.2 اجرای Schemanpm run build

1. در Supabase Dashboard به بخش "SQL Editor" برویدnpm run preview

2. محتویات فایل `database/schema.sql` را کپی کنید```

3. در SQL Editor paste کنید

4. روی "Run" کلیک کنید### 2. تنظیم Supabase

5. تأیید کنید که پیام موفقیت نمایش داده می‌شود

#### الف) ایجاد پروژه Supabase:

### 1.3 تنظیم Storage1. به [supabase.com](https://supabase.com) بروید

1. به بخش "Storage" بروید2. "New Project" کلیک کنید

2. روی "Create bucket" کلیک کنید3. نام پروژه: `pharmacy-inventory`

3. نام bucket: `drug-images`4. رمز عبور قوی انتخاب کنید

4. "Public bucket" را فعال کنید

5. روی "Create bucket" کلیک کنید#### ب) اجرای اسکریپت دیتابیس:

1. به SQL Editor بروید

### 1.4 تنظیم Policies2. محتوای فایل `database/schema.sql` را کپی کنید

در بخش Storage > Policies این policies را اضافه کنید:3. اسکریپت را اجرا کنید



```sql#### ج) تنظیم Storage:

-- سیاست آپلود1. به Storage بروید

CREATE POLICY "Enable upload for authenticated users" ON storage.objects2. Bucket جدید با نام `drug-images` ایجاد کنید

FOR INSERT WITH CHECK (bucket_id = 'drug-images');3. آن را Public قرار دهید



-- سیاست مشاهده### 3. دریافت اطلاعات Supabase

CREATE POLICY "Give users access to view images" ON storage.objects

FOR SELECT USING (bucket_id = 'drug-images');```

Project URL: https://[PROJECT-REF].supabase.co

-- سیاست حذفAnon Key: [YOUR-ANON-KEY]

CREATE POLICY "Enable delete for authenticated users" ON storage.objects```

FOR DELETE USING (bucket_id = 'drug-images');

```### 4. Deploy به Vercel



### 1.5 دریافت اطلاعات اتصال#### روش 1: CLI

1. به بخش "Settings" > "API" بروید```bash

2. `Project URL` و `anon public` key را کپی کنید# در پوشه پروژه

vercel

---

# تنظیم environment variables

## مرحله ۲: استقرار روی Vercelvercel env add VITE_SUPABASE_URL

vercel env add VITE_SUPABASE_ANON_KEY

### 2.1 راه‌اندازی Vercel از طریق GitHub

# deploy نهایی

1. **وارد Vercel شوید**:vercel --prod

   - برو به [vercel.com](https://vercel.com)```

   - با حساب GitHub وارد شو

#### روش 2: GitHub

2. **ایجاد پروژه جدید**:```bash

   - روی "New Project" کلیک کن# آپلود به GitHub

   - مخزن `pharmacy-inventory` را انتخاب کنgit init

   - روی "Import" کلیک کنgit add .

git commit -m "Initial commit - Pharmacy Inventory System by Alireza Hamed"

3. **تنظیمات پروژه**:git branch -M main

   ```git remote add origin https://github.com/[USERNAME]/pharmacy-inventory.git

   Framework Preset: Vitegit push -u origin main

   Root Directory: ./```

   Build Command: npm run build

   Output Directory: distسپس در Vercel:

   Install Command: npm install1. "Import Git Repository"

   ```2. Environment Variables را تنظیم کنید:

   - `VITE_SUPABASE_URL`

4. **متغیرهای محیطی**:   - `VITE_SUPABASE_ANON_KEY`

   در بخش "Environment Variables":3. Deploy کلیک کنید

   ```

   VITE_SUPABASE_URL = https://your-project.supabase.co### 5. تست نهایی

   VITE_SUPABASE_ANON_KEY = your-anon-key-here

   ```پس از deploy موفق:

1. URL سایت را باز کنید

5. **Deploy**:2. با `superadmin` / `A25893Aa` وارد شوید

   - روی "Deploy" کلیک کن3. تمام صفحات را تست کنید

   - صبر کن تا build کامل شه

### 6. تنظیمات اختیاری

### 2.2 تنظیمات بعد از Deploy

#### Domain سفارشی:

1. **Domain تنظیم کن**:1. در Vercel Dashboard

   - در تنظیمات پروژه به "Domains" برو2. Settings > Domains

   - دامنه دلخواه اضافه کن3. دامنه دلخواه را اضافه کنید



2. **Auto-deploy فعال کن**:#### Analytics:

   - هر push به main branch خودکار deploy می‌شه1. در Vercel Dashboard  

2. Analytics را فعال کنید

---

---

## مرحله ۳: تست نهایی

## 📊 مانیتورینگ و نگهداری

### 3.1 بررسی عملکرد

1. سایت deploy شده رو باز کن- **Logs**: در Vercel Dashboard > Functions

2. با کاربر `superadmin` / `A25893Aa` وارد شو- **Performance**: در Vercel Analytics

3. تست کن:- **Database**: در Supabase Dashboard

   - ✅ اضافه کردن دارو- **Backup**: خودکار توسط Supabase

   - ✅ آپلود عکس

   - ✅ ایجاد انبار---

   - ✅ انتقال دارو بین انبارها

   - ✅ مشاهده گزارشات## 🔧 عیب‌یابی



### 3.2 تست عملکرد Storage### مشکلات رایج:

1. یک دارو با عکس اضافه کن1. **Environment Variables نامعتبر**: در Vercel Settings بررسی کنید

2. بررسی کن عکس نمایش داده می‌شه2. **CORS Error**: تنظیمات Supabase Authentication را بررسی کنید  

3. در Supabase Storage چک کن فایل آپلود شده3. **Build Error**: `npm run build` محلی تست کنید



### 3.3 تست Database### لاگ‌های مفید:

1. چند دارو اضافه کن```bash

2. بررسی کن در Supabase Table Editor داده‌ها موجوده# Build logs

3. تست کن فیلترها و جستجو درست کار می‌کنهvercel logs [deployment-url]



---# Function logs  

vercel logs --follow

## مرحله ۴: مانیتورینگ و نگهداری```



### 4.1 مانیتورینگ Vercel---

- در Vercel Dashboard بخش "Analytics" رو چک کن

- Function logs رو برای عیب‌یابی بررسی کن**🎯 پس از تکمیل این مراحل، سیستم شما آماده استفاده در فضای وب خواهد بود!**


### 4.2 مانیتورینگ Supabase
- در Supabase Dashboard بخش "Logs" رو نگاه کن
- Database performance رو چک کن

### 4.3 Backup
- Database backup خودکار فعال کن
- اگر نیاز به backup دستی داری از "Database" > "Backups" استفاده کن

---

## 🔧 عیب‌یابی رایج

### خطای Build در Vercel
```bash
# بررسی کن Node.js version درسته
Node.js: 18.x

# چک کن dependencies نصب شده
npm install

# بررسی Environment Variables
VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY
```

### خطای اتصال به Database
```bash
# چک کن Supabase credentials درسته
# بررسی کن schema اجرا شده
# تأیید کن RLS policies تنظیم شده
```

### خطای آپلود عکس
```bash
# چک کن Storage bucket ایجاد شده
# بررسی کن Public access فعاله
# تأیید کن Storage policies درسته
```

---

## 📞 پشتیبانی

- **پروژه**: [GitHub Repository](https://github.com/Alirezahamed1367/pharmacy-inventory)
- **مستندات Vercel**: [docs.vercel.com](https://vercel.com/docs)
- **مستندات Supabase**: [supabase.com/docs](https://supabase.com/docs)

---

**طراحی و توسعه توسط علیرضا حامد - پاییز ۱۴۰۴** 🏆