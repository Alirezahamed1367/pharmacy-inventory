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
