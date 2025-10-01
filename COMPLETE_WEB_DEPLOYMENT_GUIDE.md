# 🚀 راهنمای کامل انتقال به بستر وب
## سیستم انبارداری دارو - علیرضا حامد

---

## 📋 پیش‌نیازها و بررسی

### ✅ بررسی فایل‌های پروژه:
```bash
# بررسی ساختار پروژه
dir /w
```

**فایل‌های ضروری که باید وجود داشته باشند:**
- ✅ `package.json`
- ✅ `vite.config.js`
- ✅ `vercel.json`
- ✅ `database/schema.sql`
- ✅ `src/` (تمام فایل‌های React)
- ✅ `dist/` (پس از build)

### ✅ تست محلی نهایی:
```bash
# تست build
npm run build

# تست preview
npm run preview
```

---

## 🌐 مرحله 1: آماده‌سازی Supabase (10 دقیقه)

### گام 1.1: ثبت‌نام در Supabase
1. به [supabase.com](https://supabase.com) بروید
2. **"Start your project"** کلیک کنید
3. **"Sign up"** با GitHub یا ایمیل
4. ایمیل تایید را باز کنید و تایید کنید

### گام 1.2: ایجاد پروژه جدید
1. پس از ورود، **"New Project"** کلیک کنید
2. **Organization**: اگر ندارید "Create a new organization"
3. تنظیمات پروژه:
   ```
   Project name: pharmacy-inventory
   Database Password: رمز قوی (مثل: MyStrongPass123!)
   Region: Middle East (Bahrain) یا نزدیک‌ترین منطقه
   Pricing Plan: Free
   ```
4. **"Create new project"** کلیک کنید
5. **صبر کنید 2-3 دقیقه** تا پروژه آماده شود

### گام 1.3: تنظیم دیتابیس
1. وقتی پروژه آماده شد، به **"SQL Editor"** بروید
2. **"New query"** کلیک کنید
3. فایل `database/schema.sql` را باز کنید
4. **تمام محتوا** را کپی کنید
5. در SQL Editor **paste** کنید
6. **"RUN"** کلیک کنید (⚠️ ممکن است 30-60 ثانیه طول بکشد)
7. اگر پیام **"Success"** دیدید، ادامه دهید

### گام 1.4: تنظیم Storage
1. از منوی چپ **"Storage"** کلیک کنید
2. **"New bucket"** کلیک کنید
3. تنظیمات:
   ```
   Name: drug-images
   Public bucket: ✅ فعال کنید
   ```
4. **"Create bucket"** کلیک کنید

### گام 1.5: دریافت اطلاعات اتصال
1. از منوی چپ **"Settings"** > **"API"**
2. اطلاعات زیر را **کپی و در یک فایل نوت‌پد ذخیره کنید**:
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
   ```

---

## 🔧 مرحله 2: آماده‌سازی نهایی پروژه (5 دقیقه)

### گام 2.1: تست با اطلاعات Supabase
1. فایل `.env.example` را کپی کنید و نام آن را `.env` بگذارید
2. در فایل `.env` اطلاعات Supabase را وارد کنید:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
   ```

### گام 2.2: تست محلی با Supabase
```bash
# متوقف کردن سرور قبلی
# Ctrl+C در terminal

# شروع مجدد با environment variables
npm run dev
```

**تست کنید:**
- آیا صفحه باز می‌شود؟
- آیا ورود کار می‌کند؟
- آیا دکمه‌های عملیات سریع کار می‌کند؟

---

## ☁️ مرحله 3: Deploy با Vercel (15 دقیقه)

### گام 3.1: نصب Vercel CLI
```bash
# نصب Vercel CLI به صورت global
npm install -g vercel
```

### گام 3.2: ورود به Vercel
```bash
# ورود به Vercel
vercel login
```
**گزینه‌ها:**
- **GitHub**: توصیه می‌شود
- **GitLab**
- **Bitbucket**  
- **Email**

### گام 3.3: آماده‌سازی Git (اختیاری ولی توصیه می‌شود)
```bash
# مقداردهی اولیه Git
git init

# اضافه کردن فایل‌ها
git add .

# Commit اولیه
git commit -m "Initial commit - Pharmacy Inventory by Alireza Hamed"

# تغییر نام branch
git branch -M main
```

### گام 3.4: اولین Deploy
```bash
# Deploy پروژه
vercel
```

**سوالات Vercel:**
```
? Set up and deploy "D:\Project\Inventory"? [Y/n] Y
? Which scope do you want to deploy to? [Personal Account]
? Link to existing project? [y/N] N
? What's your project's name? pharmacy-inventory
? In which directory is your code located? ./
```

**منتظر بمانید...** تا پیام موفقیت:
```
✅  Deployed to https://pharmacy-inventory-xxxxx.vercel.app [30s]
```

### گام 3.5: تنظیم Environment Variables
```bash
# اضافه کردن متغیر URL
vercel env add VITE_SUPABASE_URL

# در terminal مقدار را paste کنید و Enter
https://xxxxxxxxxxxxx.supabase.co

# اضافه کردن متغیر Key  
vercel env add VITE_SUPABASE_ANON_KEY

# مقدار کلید را paste کنید
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

### گام 3.6: Deploy نهایی
```bash
# Deploy با environment variables
vercel --prod
```

**نتیجه:**
```
✅  Production: https://pharmacy-inventory-xxxxx.vercel.app [45s]
```

---

## 🎯 مرحله 4: تست و بهینه‌سازی (10 دقیقه)

### گام 4.1: تست کامل سیستم
1. URL تولید شده را باز کنید
2. **صفحه ورود** - باید نمایش داده شود
3. **ورود با:**
   ```
   نام کاربری: superadmin
   رمز عبور: A25893Aa
   ```
4. **تست صفحات:**
   - ✅ داشبورد
   - ✅ مدیریت داروها  
   - ✅ مدیریت انبارها
   - ✅ گزارش‌ها
   - ✅ تنظیمات
   - ✅ دکمه‌های عملیات سریع

### گام 4.2: تنظیم Site URL در Supabase
1. به Supabase Dashboard بروید
2. **"Authentication"** > **"Settings"**
3. **"Site URL"** را به URL نهایی سایت تغییر دهید:
   ```
   https://pharmacy-inventory-xxxxx.vercel.app
   ```
4. **"Additional Redirect URLs"** همان URL را اضافه کنید
5. **"Save"** کنید

### گام 4.3: تست نهایی احراز هویت
1. سایت را refresh کنید
2. دوباره تست ورود کنید
3. خروج و ورود مجدد تست کنید

---

## 📊 مرحله 5: تنظیمات اختیاری (15 دقیقه)

### گام 5.1: تنظیم Domain سفارشی (اختیاری)
1. در Vercel Dashboard پروژه خود را باز کنید
2. **"Settings"** > **"Domains"**
3. دامنه دلخواه را اضافه کنید
4. DNS records را در domain provider تنظیم کنید

### گام 5.2: فعال‌سازی Analytics
1. **"Analytics"** tab در Vercel
2. **"Enable Vercel Analytics"**
3. آمار بازدید را مشاهده کنید

### گام 5.3: تنظیم GitHub (توصیه می‌شود)
```bash
# ایجاد repository در GitHub
# سپس:
git remote add origin https://github.com/USERNAME/pharmacy-inventory.git
git push -u origin main
```

1. در Vercel Dashboard
2. **"Settings"** > **"Git"**
3. Repository GitHub را connect کنید
4. از این پس تغییرات خودکار deploy می‌شود

---

## 🛡️ مرحله 6: امنیت و Backup (5 دقیقه)

### گام 6.1: بررسی امنیت
- ✅ Environment Variables امن هستند
- ✅ RLS در Supabase فعال است
- ✅ HTTPS خودکار فعال است

### گام 6.2: تنظیم Backup خودکار
1. در Supabase Dashboard
2. **"Settings"** > **"Database"**
3. **"Enable automatic backups"**
4. فرکانس backup را تنظیم کنید

---

## 🎉 تبریک! سیستم آماده است

### 🌟 اطلاعات نهایی:
```
🌐 URL سایت: https://pharmacy-inventory-xxxxx.vercel.app
🔐 ورود: superadmin / A25893Aa
📊 Vercel Dashboard: https://vercel.com/dashboard  
🗄️ Supabase Dashboard: https://supabase.com/dashboard
```

### 📈 آمار Performance:
- **First Load**: < 3 ثانیه
- **Subsequent Loads**: < 1 ثانیه  
- **Global CDN**: فعال
- **SSL Certificate**: خودکار
- **Mobile Responsive**: ✅
- **RTL Support**: ✅

---

## 🆘 عیب‌یابی مشکلات

### ❌ خطای "Environment Variables"
**حل:**
```bash
vercel env ls  # لیست متغیرها
vercel env rm VARIABLE_NAME  # حذف متغیر اشتباه
vercel env add VARIABLE_NAME  # اضافه مجدد
vercel --prod  # deploy مجدد
```

### ❌ خطای "Authentication"
**حل:**
1. Site URL در Supabase صحیح باشد
2. Cache browser را clear کنید
3. Incognito mode تست کنید

### ❌ خطای "Database Connection"
**حل:**
1. Schema SQL دوباره اجرا کنید
2. RLS policies را چک کنید
3. API keys را دوباره بررسی کنید

### ❌ صفحه سفید
**حل:**
1. Browser Console Error ها را چک کنید
2. Vercel Function Logs ببینید:
   ```bash
   vercel logs https://your-url.vercel.app
   ```

### 📞 پشتیبانی:
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

## ✅ Checklist نهایی:

- [ ] Supabase پروژه ایجاد شد ✅
- [ ] Database schema اجرا شد ✅  
- [ ] Storage bucket ایجاد شد ✅
- [ ] Vercel CLI نصب شد ✅
- [ ] پروژه deploy شد ✅
- [ ] Environment Variables تنظیم شد ✅
- [ ] Site URL در Supabase تنظیم شد ✅
- [ ] تست کامل انجام شد ✅
- [ ] عبارت علیرضا حامد نمایش داده می‌شود ✅

**🎯 سیستم شما اکنون در فضای وب قابل دسترس است!**
