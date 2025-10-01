# راهنمای کامل انتشار سیستم مدیریت انبار دارو در وب
## Complete Web Deployment Guide for Pharmacy Inventory Management System

### مرحله ۱: آماده‌سازی پروژه برای انتشار
#### Project Preparation for Deployment

**1.1 بررسی نهایی پروژه**
- ✅ تمامی فایل‌ها بررسی شده‌اند
- ✅ Build production با موفقیت انجام شده
- ✅ فایل‌های تنظیمات deployment آماده شده‌اند
- ✅ متغیرهای محیطی تعریف شده‌اند

**1.2 فایل‌های مهم پروژه:**
```
📁 Project Structure:
├── 📁 src/                    # کدهای برنامه
├── 📁 public/                 # فایل‌های عمومی
├── 📁 database/               # Schema دیتابیس
├── 📄 package.json            # تنظیمات npm
├── 📄 vite.config.js          # تنظیمات Vite
├── 📄 vercel.json             # تنظیمات Vercel
├── 📄 netlify.toml            # تنظیمات Netlify
├── 📄 firebase.json           # تنظیمات Firebase
├── 📄 .env.example            # نمونه متغیرهای محیطی
└── 📄 .gitignore              # فایل‌های نادیده گرفته شده
```

---

## مرحله ۲: راه‌اندازی دیتابیس Supabase
### Step 2: Setting up Supabase Database

**2.1 ایجاد حساب Supabase:**
1. به سایت https://supabase.com بروید
2. روی "Start your project" کلیک کنید
3. با GitHub، Google یا ایمیل ثبت‌نام کنید
4. یک پروژه جدید ایجاد کنید:
   - **Project Name:** `pharmacy-inventory-system`
   - **Organization:** انتخاب کنید
   - **Database Password:** یک رمز قوی وارد کنید
   - **Region:** نزدیک‌ترین منطقه را انتخاب کنید

**2.2 تنظیم دیتابیس:**
1. در پنل Supabase، به بخش "SQL Editor" بروید
2. محتویات فایل `database/schema.sql` را کپی کنید
3. در SQL Editor paste کنید و Run کنید

**2.3 دریافت اطلاعات اتصال:**
1. به بخش "Settings > API" بروید
2. اطلاعات زیر را کپی کنید:
   - **Project URL:** `https://xxxxxx.supabase.co`
   - **Anon Key:** `eyJhbGciOi...`

---

## مرحله ۳: انتشار در Vercel (پیشنهادی)
### Step 3: Deployment on Vercel (Recommended)

**3.1 آماده‌سازی:**
```bash
# نصب Vercel CLI (اختیاری)
npm install -g vercel

# یا استفاده از npx
npx vercel --version
```

**3.2 انتشار از طریق GitHub:**
1. کد پروژه را در GitHub بارگذاری کنید:
```bash
git init
git add .
git commit -m "Initial commit - Pharmacy Inventory System"
git branch -M main
git remote add origin https://github.com/yourusername/pharmacy-inventory.git
git push -u origin main
```

2. به https://vercel.com بروید و با GitHub وارد شوید
3. "Import Project" را کلیک کنید
4. Repository خود را انتخاب کنید
5. تنظیمات زیر را اعمال کنید:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

**3.3 تنظیم Environment Variables:**
در بخش Environment Variables:
- `VITE_SUPABASE_URL` = URL پروژه Supabase
- `VITE_SUPABASE_ANON_KEY` = Anon Key پروژه Supabase

**3.4 Deploy:**
1. "Deploy" را کلیک کنید
2. منتظر تکمیل فرایند باشید
3. لینک نهایی پروژه را دریافت کنید

---

## مرحله ۴: انتشار در Netlify
### Step 4: Deployment on Netlify

**4.1 انتشار از طریق GitHub:**
1. به https://netlify.com بروید
2. "Sites > Add new site > Import an existing project" کلیک کنید
3. GitHub را انتخاب کنید و repository را متصل کنید
4. تنظیمات Build:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

**4.2 تنظیم Environment Variables:**
1. Site settings > Environment variables
2. متغیرهای زیر را اضافه کنید:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**4.3 Domain تنظیمات:**
- Site settings > Domain management
- نام دلخواه برای سایت انتخاب کنید

---

## مرحله ۵: انتشار در Firebase Hosting
### Step 5: Deployment on Firebase Hosting

**5.1 نصب Firebase CLI:**
```bash
npm install -g firebase-tools
```

**5.2 راه‌اندازی Firebase:**
```bash
# ورود به Firebase
firebase login

# راه‌اندازی پروژه
firebase init hosting

# انتخاب تنظیمات:
# - Public directory: dist
# - Single-page app: Yes
# - Automatic builds: No
```

**5.3 Build و Deploy:**
```bash
# ساخت پروژه
npm run build

# انتشار
firebase deploy
```

---

## مرحله ۶: انتشار در GitHub Pages
### Step 6: Deployment on GitHub Pages

**6.1 نصب gh-pages:**
```bash
npm install --save-dev gh-pages
```

**6.2 اضافه کردن scripts به package.json:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**6.3 تنظیم vite.config.js:**
```javascript
export default defineConfig({
  base: '/repository-name/',
  // سایر تنظیمات...
})
```

**6.4 Deploy:**
```bash
npm run deploy
```

---

## مرحله ۷: تست نهایی و رفع مشکلات
### Step 7: Final Testing and Troubleshooting

**7.1 موارد بررسی:**
- [ ] سایت در مرورگرهای مختلف کار می‌کند
- [ ] Responsive design صحیح است
- [ ] فونت فارسی درست لود می‌شود
- [ ] Navigation و routing کار می‌کند
- [ ] اتصال به Supabase برقرار است

**7.2 مشکلات متداول:**

**❌ Build Error:**
```bash
# پاک کردن cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

**❌ Environment Variables:**
- مطمئن شوید متغیرها با `VITE_` شروع می‌شوند
- در deployment platform تنظیم شده‌اند

**❌ Routing 404:**
- Rewrite rules در تنظیمات deployment
- Single Page Application redirects

---

## مرحله ۸: بهینه‌سازی و مانیتورینگ
### Step 8: Optimization and Monitoring

**8.1 Performance:**
- Lighthouse audit انجام دهید
- Image optimization
- Code splitting بررسی کنید

**8.2 SEO:**
```html
<!-- در index.html -->
<meta name="description" content="سیستم مدیریت انبار دارو - طراحی و توسعه توسط علیرضا حامد">
<meta name="keywords" content="دارو, انبار, مدیریت, داروخانه">
<meta property="og:title" content="سیستم مدیریت انبار دارو">
```

**8.3 Analytics (اختیاری):**
- Google Analytics
- Vercel Analytics
- Firebase Analytics

---

## لینک‌های مفید:
### Useful Links:

📚 **مستندات:**
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Material UI](https://mui.com/)
- [Supabase Docs](https://supabase.com/docs)

🚀 **Deployment Platforms:**
- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [Firebase](https://firebase.google.com/)
- [GitHub Pages](https://pages.github.com/)

---

## نکات مهم:
### Important Notes:

⚠️ **Security:**
- هرگز private keys را در کد commit نکنید
- Environment variables را از .env.example کپی کنید
- HTTPS استفاده کنید

📱 **Mobile Compatibility:**
- PWA قابلیت‌ها (آینده)
- Responsive design تست شود
- Touch interactions

🔄 **Updates:**
- Automatic deployments از GitHub
- Version control منظم
- Backup دیتابیس

---

**👨‍💻 طراحی و توسعه:** علیرضا حامد - پاییز ۱۴۰۳
**🌐 Ready for Production Deployment**

این راهنما تمامی مراحل انتشار پروژه سیستم مدیریت انبار دارو را پوشش می‌دهد. در صورت نیاز به کمک بیشتر، مستندات هر platform را مطالعه کنید.
