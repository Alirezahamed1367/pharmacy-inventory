# سیستم انبارداری دارو 💊

وب اپلیکیشن حرفه‌ای و مدرن برای مدیریت انبار دارو با قابلیت‌های پیشرفته

## 🚀 ویژگی‌های اصلی

### 🔐 مدیریت کاربران و احراز هویت
- سیستم ورود ایمن با نام کاربری و رمز عبور
- نقش‌های مختلف کاربران (سوپر ادمین، ادمین، مسئول انبار)
- سوپر ادمین پیش‌فرض: `superadmin` / `A25893Aa`

### 💊 مدیریت داروها
- ثبت اطلاعات کامل داروها (نام، توضیحات، دوز، تاریخ انقضا)
- آپلود تصویر داروها در فضای ابری
- ردیابی تاریخ انقضا و هشدار داروهای منقضی
- جستجو و فیلتر پیشرفته

### 🏭 مدیریت انبارها
- تعریف نامحدود انبار
- نمایش ظرفیت و وضعیت موجودی هر انبار
- انتقال داروها بین انبارها (رسید و حواله)
- ثبت کامل تاریخچه انتقالات

### 📊 گزارش‌گیری پیشرفته
- گزارش موجودی انبارها
- گزارش داروهای نزدیک به انقضا
- گزارش انتقالات با فیلترهای مختلف
- خروجی گزارشات در فرمت‌های مختلف

### ⚙️ تنظیمات سیستم
- مدیریت کاربران و سطوح دسترسی
- تنظیمات اعلان‌ها و هشدارها
- تنظیمات امنیتی و پشتیبان‌گیری
- تنظیمات نمایش و شخصی‌سازی

## 🛠 تکنولوژی‌های استفاده شده

- **Frontend**: React 18 + Vite
- **UI Framework**: Material UI v5
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router v6
- **Styling**: Emotion + Material UI theming
- **Language**: Persian (RTL support)
- **Font**: Vazirmatn (Persian font)

## 📦 نصب و راه‌اندازی

### پیش‌نیازها
```bash
Node.js >= 16
npm یا yarn
حساب کاربری Supabase
```

### 1. کلون کردن پروژه
```bash
git clone https://github.com/Alirezahamed1367/pharmacy-inventory.git
cd pharmacy-inventory
```

### 2. نصب وابستگی‌ها
```bash
npm install
```

### 3. تنظیم متغیرهای محیطی
```bash
# کپی کردن فایل نمونه
cp .env.example .env

# ویرایش فایل .env و وارد کردن اطلاعات Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. راه‌اندازی پایگاه داده
1. وارد Supabase Dashboard شوید
2. فایل `database/schema.sql` را در SQL Editor اجرا کنید
3. Storage bucket با نام `drug-images` ایجاد کنید

### 5. اجرای پروژه
```bash
# حالت توسعه
npm run dev

# ساخت برای production
npm run build
```

### 🚧 اجرای سریع محلی (Quickstart)
1. فایل `.env.example` را به `.env` کپی و مقادیر Supabase را وارد کنید.
2. اطمینان از وجود bucket با نام `drug-images`.
3. اجرای دستور:
   ```bash
   npm run dev
   ```
4. اگر RLS فعال است و هنوز Supabase Auth کامل ندارید:
   - ابتدا Migration های پایه را اعمال کنید.
   - در صورت مشکل درج دارو، Migration `2025_10_03_adjust_drugs_policies.sql` را اجرا کنید.
5. برای بررسی سلامت اولیه:
   ```bash
   npm run smoke
   ```
6. پیش از اعمال Migration فاز 2 (NOT NULL lots):
   ```bash
   npm run audit:lots
   ```

## 🚀 استقرار (Deployment)

### استقرار روی Vercel

#### روش اول: از طریق GitHub (توصیه شده)
1. پروژه را به GitHub push کنید
2. وارد [Vercel Dashboard](https://vercel.com) شوید
3. روی "New Project" کلیک کنید
4. مخزن GitHub را انتخاب کنید
5. متغیرهای محیطی را در تنظیمات Vercel وارد کنید:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
6. Deploy کنید

#### روش دوم: از طریق CLI
```bash
# نصب Vercel CLI
npm i -g vercel

# وارد شدن به حساب
vercel login

# استقرار
vercel --prod
```

### تنظیمات مهم برای Vercel:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x

### استقرار روی Netlify
1. وارد [Netlify Dashboard](https://netlify.com) شوید
2. "New site from Git" را انتخاب کنید
3. مخزن GitHub را متصل کنید
4. تنظیمات build:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. متغیرهای محیطی را در Environment variables اضافه کنید

## 🗄️ پایگاه داده

### ساختار جداول:
- `drug_categories` - دسته‌بندی داروها
- `users` - کاربران سیستم
- `warehouses` - انبارها
- `drugs` - اطلاعات داروها
- `warehouse_inventory` - موجودی انبارها
- `drug_movements` - تاریخچه انتقالات
- `system_settings` - تنظیمات سیستم
- `activity_logs` - لاگ فعالیت‌ها
npm >= 8
```

### مراحل نصب
```bash
# کلون کردن پروژه
git clone [repository-url]
cd inventory

# نصب پکیج‌ها
npm install

# راه‌اندازی سرور توسعه
npm run dev
```

### تنظیمات Supabase
1. اکانت Supabase ایجاد کنید
2. پروژه جدید ایجاد کنید
3. فایل `src/services/supabase.js` را ویرایش کنید:
```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

## 🎯 نحوه استفاده

### ورود به سیستم
- برای تست: نام کاربری `superadmin` و رمز عبور `A25893Aa`
- پس از ورود، می‌توانید کاربران جدید تعریف کنید

### افزودن دارو
1. به بخش "مدیریت داروها" بروید
2. کلیک بر روی "افزودن داروی جدید"
3. اطلاعات دارو را وارد کنید
4. تصویر دارو را آپلود کنید

### انتقال بین انبارها
1. به بخش "مدیریت انبارها" بروید
2. کلیک بر روی "انتقال بین انبارها"
3. انبار مبدا، مقصد و دارو را انتخاب کنید
4. تعداد و توضیحات را وارد کنید

## 📱 ویژگی‌های طراحی

- **ریسپانسیو**: سازگار با موبایل، تبلت و دسکتاپ
- **RTL**: پشتیبانی کامل از راست‌چین فارسی
- **مدرن**: طراحی Material Design 3
- **دارک مود**: آماده برای اضافه کردن تم تیره
- **چاپ**: بهینه‌سازی شده برای چاپ گزارشات

## 🔧 دستورات مفید

```bash
# راه‌اندازی سرور توسعه
npm run dev

# ساخت نسخه تولید
npm run build

# پیش‌نمایش نسخه تولید
npm run preview

# بررسی کیفیت کد
npm run lint

# اسکریپت‌های کیفیت و اعتبارسنجی (Lots & Performance)
npm run smoke          # بررسی اجزای پایه پروژه
npm run audit:lots     # اطمینان از نبود NULL در lot_id پیش از Migration فاز 2
npm run perf:images    # تست تاخیر آپلود و هدرهای کش تصویر (Supabase Storage)
```

## 📁 ساختار پروژه

```
src/
├── components/          # کامپوننت‌های قابل استفاده مجدد
│   └── Layout.jsx       # قالب اصلی برنامه
├── pages/               # صفحات اصلی
│   ├── Dashboard.jsx    # داشبورد اصلی
│   ├── DrugManagement.jsx    # مدیریت داروها
│   ├── WarehouseManagement.jsx  # مدیریت انبارها
│   ├── Reports.jsx      # گزارشات
│   ├── Settings.jsx     # تنظیمات
│   └── LoginPage.jsx    # صفحه ورود
├── services/            # سرویس‌ها
│   └── supabase.js      # تنظیمات Supabase
├── hooks/               # Hook‌های سفارشی
└── utils/               # توابع کمکی
```

## 🚀 استقرار (Deploy)

### Vercel (توصیه شده)
1. اکانت Vercel ایجاد کنید
2. پروژه را به GitHub آپلود کنید
3. پروژه را در Vercel وصل کنید
4. متغیرهای محیطی Supabase را تنظیم کنید

### Netlify
1. `npm run build` اجرا کنید
2. پوشه `dist` را در Netlify آپلود کنید
3. تنظیمات environment variables را انجام دهید

## 👨‍💻 توسعه‌دهنده

**علیرضا حامد**  
پاییز 1404  

این پروژه با عشق و دقت برای مدیریت بهینه انبارهای دارویی طراحی و توسعه یافته است.

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

---

💡 **نکته**: برای راهنمایی بیشتر و حل مشکلات، به بخش Issues در GitHub مراجعه کنید.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---
## ✨ فاز 2 Lots (اجباری کردن lot_id)

پس از اجرای کامل مهاجرت اولیه و پوشش‌دهی همه رکوردها با `lot_id`, مرحله دوم شامل اجباری کردن این ستون است.

### مراحل پیشنهادی:
1. اجرای اسکریپت اعتبارسنجی:
   ```bash
   npm run audit:lots
   ```
   اگر خروجی FAILED بود، ابتدا مشکل را رفع کنید.
2. اعمال Migration جدید: فایل `database/migrations/2025_10_03_enforce_lot_not_null.sql` را در Supabase SQL اجرا کنید.
3. اجرای Smoke Test برای اطمینان:
   ```bash
   npm run smoke
   ```
4. تست عملیات رسید و حواله با ایجاد/تکمیل نمونه.

### رفع خطای احتمالی Migration
اگر Migration پیام خطا درباره وجود NULL داد:
- مجدد `audit:lots` را اجرا و رکوردهای مشکل‌دار را با یک `UPDATE` مناسب lot_id دار کنید.
- سپس دوباره Migration را اجرا نمایید.

### اسکریپت عملکردی تصاویر
برای مشاهده میانگین زمان آپلود:
```bash
npm run perf:images
```
خروجی شامل میانگین میلی‌ثانیه و Sample headers برای کنترل Cache خواهد بود؛ در صورت نیاز می‌توانید تعداد تکرار را تغییر دهید:
```bash
node ./scripts/perfImageTest.mjs 5
```

