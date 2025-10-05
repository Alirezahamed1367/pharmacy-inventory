# 🤖 راهنمای استقرار خودکار کامل (بدون خطا)
# Complete Automated Deployment Guide (Error-free)

## 🎯 هدف: استقرار با حداقل کار دستی و حداکثر اتوماسیون

### ⏱️ زمان کل: 15-20 دقیقه
### 🔧 نیاز به کار دستی: فقط 3 کلیک و 2 فرم

---

## 📋 مرحله 0: بررسی آمادگی (2 دقیقه)

### چک کردن ابزارهای نصب شده:
```powershell
# بررسی Node.js
node --version
# باید v18+ باشد

# بررسی npm
npm --version

# بررسی Git
git --version

# اگر هر کدام نیست:
# Node.js: https://nodejs.org (نسخه LTS)
# Git: https://git-scm.com
```

✅ **اگر همه موجود بود، ادامه بده.**

---

## 📋 مرحله 1: آماده‌سازی خودکار (3 دقیقه)

### 1.1 اجرای اسکریپت آماده‌سازی:
```powershell
# در پوشه پروژه:
.\deploy-iran.ps1 -Action prepare
```

**این کار انجام می‌دهد:**
- نصب خودکار dependencies
- ایجاد فایل `.env.local` با تنظیمات پیش‌فرض
- تنظیم حالت PocketBase

### 1.2 Build خودکار:
```powershell
.\deploy-iran.ps1 -Action build
```

**نتیجه مورد انتظار:**
```
✅ Build موفق
```

---

## 📋 مرحله 2: ثبت‌نام خودکار (5 دقیقه)

### 2.1 ثبت‌نام Fly.io (Backend):
```powershell
# نصب خودکار Fly CLI
iwr https://fly.io/install.ps1 -useb | iex

# بعد از نصب، ترمینال جدید باز کن و:
fly auth signup
```

📝 **کار دستی**: فقط ایمیل و رمز وارد کن (30 ثانیه)

### 2.2 ثبت‌نام Cloudflare (Frontend):
- برو به: https://pages.cloudflare.com
- Sign up with GitHub (1 کلیک)

📝 **کار دستی**: فقط اجازه دسترسی GitHub بده (1 کلیک)

---

## 📋 مرحله 3: آپلود کد به GitHub (2 دقیقه)

### 3.1 آماده‌سازی Git:
```powershell
# اگر git init نشده:
git init

# اضافه کردن همه فایل‌ها:
git add .

# کامیت با پیام مناسب:
git commit -m "🚀 Deploy: Pharmacy Inventory System by Alireza Hamed - Fall 1404"

# ست کردن branch اصلی:
git branch -M main
```

### 3.2 اتصال به GitHub:
```powershell
# جایگزین [YOUR-USERNAME] با نام کاربری GitHub:
git remote add origin https://github.com/[YOUR-USERNAME]/pharmacy-inventory.git

# آپلود:
git push -u origin main
```

📝 **کار دستی**: 
- ایجاد repository جدید در GitHub (2 کلیک)
- نام repository: `pharmacy-inventory`

---

## 📋 مرحله 4: استقرار Backend خودکار (3 دقیقه)

### 4.1 آماده‌سازی Backend:
```powershell
.\deploy-iran.ps1 -Action backend
```

**این فایل‌ها ایجاد می‌شود:**
- `Dockerfile.pocketbase`
- `fly.toml`

### 4.2 Deploy خودکار Backend:
```powershell
# Launch app
fly launch --name pharmacy-inventory-pb --region fra --yes

# ایجاد Volume برای دیتابیس
fly volumes create pb_data --region fra --size 1

# Deploy نهایی
fly deploy
```

**نتیجه مورد انتظار:**
```
==> Monitoring deployment
...
Visit your newly deployed app at https://pharmacy-inventory-pb.fly.dev/
```

✅ **URL backend را کپی کن:** `https://pharmacy-inventory-pb.fly.dev`

---

## 📋 مرحله 5: استقرار Frontend خودکار (3 دقیقه)

### 5.1 آماده‌سازی Frontend:
```powershell
.\deploy-iran.ps1 -Action frontend
```

### 5.2 Deploy در Cloudflare Pages:
1. برو به: https://pages.cloudflare.com/projects
2. **Create a project** → **Connect to Git**
3. انتخاب repository: `pharmacy-inventory`
4. **Begin setup**

### 5.3 تنظیمات Build (خودکار):
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

### 5.4 Environment Variables:
```
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=https://pharmacy-inventory-pb.fly.dev
VITE_APP_NAME=سیستم مدیریت انبار دارو
```

5. **Save and Deploy**

**نتیجه مورد انتظار:**
```
✅ Success! Your site is live at:
https://pharmacy-inventory.pages.dev
```

---

## 📋 مرحله 6: تنظیم نهایی خودکار (2 دقیقه)

### 6.1 تست اتصال:
```powershell
# تست Backend
Invoke-WebRequest https://pharmacy-inventory-pb.fly.dev/api/health

# تست Frontend  
Invoke-WebRequest https://pharmacy-inventory.pages.dev
```

### 6.2 تنظیم کالکشن‌های دیتابیس:

**گزینه A: خودکار (اگر auth کار کرد):**
```powershell
# تنظیم URL جدید
$env:VITE_PB_URL = 'https://pharmacy-inventory-pb.fly.dev'
$env:PB_URL = 'https://pharmacy-inventory-pb.fly.dev'

# اجرای اسکریپت
npm run pb:init
```

**گزینه B: دستی (اگر خودکار کار نکرد):**
1. برو به: `https://pharmacy-inventory-pb.fly.dev/_/`
2. ساخت اولین ادمین
3. Collections را طبق لیست زیر بساز

---

## 📋 مرحله 7: تست نهایی (1 دقیقه)

### 7.1 تست کامل سیستم:
```powershell
.\deploy-iran.ps1 -Action test
```

### 7.2 تست دستی سایت:
1. باز کردن: `https://pharmacy-inventory.pages.dev`
2. ثبت‌نام کاربر جدید
3. اضافه کردن یک دارو
4. ایجاد انبار
5. انتقال دارو

✅ **اگر همه کار کرد، تبریک! 🎉**

---

## 🔧 اسکریپت کامل یکجا (برای عجله‌ای‌ها)

```powershell
# ⚡ اجرای تمام مراحل خودکار:
.\deploy-iran.ps1 -Action all

# یا مرحله‌به‌مرحله:
.\deploy-iran.ps1 -Action prepare
.\deploy-iran.ps1 -Action build  
.\deploy-iran.ps1 -Action backend
.\deploy-iran.ps1 -Action frontend
.\deploy-iran.ps1 -Action test
```

---

## 🆘 عیب‌یابی سریع

### اگر Build ناموفق:
```powershell
# پاک کردن cache
npm cache clean --force
rm -rf node_modules
npm install
npm run build
```

### اگر Fly.io ناموفق:
```powershell
# چک کردن اتصال
fly status
fly logs

# دوباره deploy
fly deploy --force
```

### اگر Cloudflare ناموفق:
- چک Environment Variables
- Build logs را در Dashboard ببین
- مجدداً Deploy کن

---

## ✅ چک‌لیست موفقیت

- [ ] Node.js نصب شده (v18+)
- [ ] Git نصب شده  
- [ ] کد در GitHub آپلود شده
- [ ] Fly.io account ساخته شده
- [ ] Cloudflare account ساخته شده
- [ ] Backend deploy شده (Fly.io)
- [ ] Frontend deploy شده (Cloudflare)
- [ ] Environment variables تنظیم شده
- [ ] Database collections ساخته شده
- [ ] سایت از ایران قابل دسترسی
- [ ] تمام قابلیت‌ها کار می‌کند

---

## 🎯 URL های نهایی

**Frontend (سایت اصلی):**
`https://pharmacy-inventory.pages.dev`

**Backend API:**
`https://pharmacy-inventory-pb.fly.dev`

**Admin Dashboard:**
`https://pharmacy-inventory-pb.fly.dev/_/`

---

## 🏆 تبریک! 

سیستم مدیریت انبار دارو شما با موفقیت در فضای ابری مستقر شد:

✅ **رایگان** - بدون هیچ هزینه‌ای  
✅ **سریع** - CDN جهانی  
✅ **امن** - HTTPS و security headers  
✅ **از ایران دسترسی** - بدون فیلتر  
✅ **خودکار** - Auto-deploy از Git  
✅ **مقیاس‌پذیر** - رشد خودکار  

**طراحی و توسعه: علیرضا حامد - پاییز 1404** 🍂