# 🚀 راهنمای Deployment - سیستم انبارداری دارو

## مراحل بارگذاری روی Vercel

### 1. آماده‌سازی اولیه

```bash
# نصب Vercel CLI
npm i -g vercel

# تست build محلی
npm run build
npm run preview
```

### 2. تنظیم Supabase

#### الف) ایجاد پروژه Supabase:
1. به [supabase.com](https://supabase.com) بروید
2. "New Project" کلیک کنید
3. نام پروژه: `pharmacy-inventory`
4. رمز عبور قوی انتخاب کنید

#### ب) اجرای اسکریپت دیتابیس:
1. به SQL Editor بروید
2. محتوای فایل `database/schema.sql` را کپی کنید
3. اسکریپت را اجرا کنید

#### ج) تنظیم Storage:
1. به Storage بروید
2. Bucket جدید با نام `drug-images` ایجاد کنید
3. آن را Public قرار دهید

### 3. دریافت اطلاعات Supabase

```
Project URL: https://[PROJECT-REF].supabase.co
Anon Key: [YOUR-ANON-KEY]
```

### 4. Deploy به Vercel

#### روش 1: CLI
```bash
# در پوشه پروژه
vercel

# تنظیم environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# deploy نهایی
vercel --prod
```

#### روش 2: GitHub
```bash
# آپلود به GitHub
git init
git add .
git commit -m "Initial commit - Pharmacy Inventory System by Alireza Hamed"
git branch -M main
git remote add origin https://github.com/[USERNAME]/pharmacy-inventory.git
git push -u origin main
```

سپس در Vercel:
1. "Import Git Repository"
2. Environment Variables را تنظیم کنید:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy کلیک کنید

### 5. تست نهایی

پس از deploy موفق:
1. URL سایت را باز کنید
2. با `superadmin` / `A25893Aa` وارد شوید
3. تمام صفحات را تست کنید

### 6. تنظیمات اختیاری

#### Domain سفارشی:
1. در Vercel Dashboard
2. Settings > Domains
3. دامنه دلخواه را اضافه کنید

#### Analytics:
1. در Vercel Dashboard  
2. Analytics را فعال کنید

---

## 📊 مانیتورینگ و نگهداری

- **Logs**: در Vercel Dashboard > Functions
- **Performance**: در Vercel Analytics
- **Database**: در Supabase Dashboard
- **Backup**: خودکار توسط Supabase

---

## 🔧 عیب‌یابی

### مشکلات رایج:
1. **Environment Variables نامعتبر**: در Vercel Settings بررسی کنید
2. **CORS Error**: تنظیمات Supabase Authentication را بررسی کنید  
3. **Build Error**: `npm run build` محلی تست کنید

### لاگ‌های مفید:
```bash
# Build logs
vercel logs [deployment-url]

# Function logs  
vercel logs --follow
```

---

**🎯 پس از تکمیل این مراحل، سیستم شما آماده استفاده در فضای وب خواهد بود!**
