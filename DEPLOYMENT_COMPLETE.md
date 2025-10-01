# 🎯 راهنمای کامل Deployment
## سیستم انبارداری دارو - علیرضا حامد

### ✅ وضعیت پروژه: **آماده برای انتشار**

---

## 🚀 مرحله 1: آماده‌سازی Supabase

### ایجاد پروژه Supabase:
1. به [supabase.com](https://supabase.com) بروید
2. **Sign up** کنید (رایگان)
3. **New Project** کلیک کنید
4. تنظیمات:
   - **Name**: `pharmacy-inventory`
   - **Organization**: Personal یا سازمان شما
   - **Database Password**: رمز قوی (حفظ کنید!)
   - **Region**: نزدیک‌ترین منطقه

### تنظیم دیتابیس:
1. پس از ایجاد پروژه، به **SQL Editor** بروید
2. **New Query** کلیک کنید
3. محتوای فایل `database/schema.sql` را کپی و paste کنید
4. **RUN** کلیک کنید
5. صبر کنید تا تمام جداول ایجاد شود

### تنظیم Storage:
1. به **Storage** بروید
2. **New Bucket** کلیک کنید
3. نام: `drug-images`
4. **Public bucket** را فعال کنید
5. **Create bucket**

### دریافت اطلاعات اتصال:
1. به **Settings > API** بروید
2. اطلاعات زیر را کپی کنید:
   ```
   Project URL: https://[PROJECT-ID].supabase.co
   Anon public key: [LONG-KEY-STRING]
   ```

---

## 🌐 مرحله 2: Deployment با Vercel

### روش 1: Deploy مستقیم (سریع‌تر)

1. **نصب Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login به Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy پروژه:**
   ```bash
   vercel
   ```
   
   سوالات را پاسخ دهید:
   - **Set up and deploy**: Yes
   - **Which scope**: Personal Account
   - **Link to existing project**: No
   - **Project name**: pharmacy-inventory
   - **Directory**: ./

4. **تنظیم Environment Variables:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   # مقدار: URL پروژه Supabase شما
   
   vercel env add VITE_SUPABASE_ANON_KEY  
   # مقدار: Anon key از Supabase
   ```

5. **Deploy نهایی:**
   ```bash
   vercel --prod
   ```

### روش 2: از طریق GitHub (توصیه شده)

1. **آپلود به GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Pharmacy Inventory System by Alireza Hamed - Fall 1404"
   git branch -M main
   # جایگزین USERNAME و REPOSITORY با اطلاعات خود
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

2. **اتصال GitHub به Vercel:**
   - به [vercel.com](https://vercel.com) بروید
   - **Import Git Repository**
   - Repository خود را انتخاب کنید
   - **Deploy** کلیک کنید

3. **تنظیم Environment Variables در Vercel Dashboard:**
   - **Settings > Environment Variables**
   - اضافه کنید:
     - `VITE_SUPABASE_URL` = URL پروژه Supabase
     - `VITE_SUPABASE_ANON_KEY` = Anon key از Supabase
   - **Save** و **Redeploy**

---

## 🔧 مرحله 3: تست و راه‌اندازی

### تست سیستم:
1. **URL سایت** را باز کنید (از Vercel dashboard)
2. **ورود با اطلاعات تست:**
   - سوپر ادمین: `superadmin` / `A25893Aa`
   - مدیر: `admin1` / `123456`
   - کارمند: `operator1` / `123456`

### بررسی قابلیت‌ها:
- ✅ صفحه ورود
- ✅ داشبورد
- ✅ مدیریت داروها  
- ✅ مدیریت انبارها
- ✅ گزارش‌گیری
- ✅ تنظیمات
- ✅ عبارت کپی‌رایت علیرضا حامد

---

## 🔐 مرحله 4: امنیت و بهینه‌سازی

### تنظیمات Supabase Authentication:
1. **Authentication > Settings**
2. **Site URL**: URL نهایی سایت شما
3. **Redirect URLs**: همان URL نهایی
4. **Enable email confirmations**: غیرفعال برای تست

### تنظیمات RLS (Row Level Security):
- همه‌چیز از قبل در اسکریپت تنظیم شده
- کاربران فقط به داده‌های مجاز دسترسی دارند

### بهینه‌سازی Performance:
- ✅ Code splitting انجام شده
- ✅ Minification فعال است  
- ✅ Gzip compression توسط Vercel
- ✅ CDN جهانی Vercel

---

## 📊 مرحله 5: مانیتورینگ

### Vercel Analytics:
- در Dashboard فعال کنید
- آمار بازدیدکنندگان را ببینید

### Supabase Analytics:  
- تعداد users و API calls
- Database performance
- Storage usage

---

## 🆘 عیب‌یابی مشکلات رایج

### خطای "Invalid Supabase URL":
- Environment Variables را دوباره چک کنید
- Redeploy کنید

### خطای CORS:
- Site URL در Supabase Authentication را تنظیم کنید

### صفحه سفید:
- Console browser را چک کنید
- Vercel Function Logs را ببینید

### خطای Database:
- SQL Schema را دوباره اجرا کنید
- Table permissions را چک کنید

---

## 🎉 تبریک! 

**سیستم انبارداری دارو شما آماده است!**

### اطلاعات نهایی:
- **نسخه**: 1.0.0
- **توسعه‌دهنده**: علیرضا حامد  
- **زمان توسعه**: پاییز 1404
- **تکنولوژی**: React + Supabase + Vercel
- **امنیت**: RLS + Environment Variables
- **Performance**: Optimized & Fast

### لینک‌های مفید:
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **Domain Management**: Vercel Settings
- **SSL Certificate**: خودکار توسط Vercel

---

**💡 نکته: تمام فایل‌های پروژه در پوشه فعلی آماده است. فقط مراحل بالا را دنبال کنید!**
