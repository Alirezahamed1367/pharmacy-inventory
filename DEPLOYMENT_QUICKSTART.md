# 🇮🇷 راهنمای استقرار خودکار برای ایران
# Auto Deployment Guide for Iran Access

## 🚀 راه‌اندازی یک‌کلیکه

```bash
# اجرای کامل (تمام مراحل)
chmod +x deploy-iran.sh
./deploy-iran.sh

# یا مرحله به مرحله:
./deploy-iran.sh prepare    # آماده‌سازی پروژه
./deploy-iran.sh build      # build کردن
./deploy-iran.sh backend    # آماده‌سازی backend
./deploy-iran.sh frontend   # آماده‌سازی frontend
```

## 📋 مراحل دستی (اگر اسکریپت کار نکرد)

### 1. آماده‌سازی محیط
```bash
# نصب dependencies
npm install

# ایجاد environment file
echo "VITE_BACKEND_MODE=pocketbase" > .env.local
echo "VITE_PB_URL=https://your-app.fly.dev" >> .env.local
```

### 2. استقرار Backend (PocketBase on Fly.io)

#### 2.1 نصب Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Linux/Mac
curl -L https://fly.io/install.sh | sh
```

#### 2.2 ثبت‌نام و login
```bash
fly auth signup    # اولین بار
fly auth login     # بارهای بعد
```

#### 2.3 Launch پروژه
```bash
# ایجاد app جدید
fly launch --name pharmacy-inventory-pb

# ایجاد volume برای دیتابیس
fly volumes create pb_data --region fra --size 1

# deploy
fly deploy
```

### 3. استقرار Frontend (Cloudflare Pages)

#### 3.1 آپلود کد به GitHub
```bash
git init
git add .
git commit -m "Initial commit - Pharmacy Inventory by Alireza Hamed"
git branch -M main
git remote add origin https://github.com/[USERNAME]/pharmacy-inventory.git
git push -u origin main
```

#### 3.2 تنظیم Cloudflare Pages
1. برو به [pages.cloudflare.com](https://pages.cloudflare.com)
2. Create a project → Connect to Git
3. انتخاب repository
4. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Environment variables:
   ```
   VITE_BACKEND_MODE=pocketbase
   VITE_PB_URL=https://pharmacy-inventory-pb.fly.dev
   ```
6. Save and Deploy

## 🎯 گزینه‌های دیگر

### Railway + Cloudflare Pages
```bash
# 1. Push به GitHub
git push

# 2. ثبت‌نام در railway.app
# 3. New Project → Deploy from GitHub
# 4. Environment Variables:
#    PORT=8090
#    (اگر Fastify: DATABASE_URL)
```

### Render + Netlify
```bash
# 1. ثبت‌نام در render.com
# 2. New Web Service → Connect repository
# 3. تنظیمات:
#    Environment: Node
#    Build Command: npm install
#    Start Command: ./pocketbase serve --http=0.0.0.0:$PORT
```

## 🔧 تنظیمات تکمیلی

### Domain سفارشی
```bash
# Cloudflare Pages
# Dashboard → Custom domains → Add domain

# یا با CLI
wrangler pages domain add your-domain.com
```

### SSL/HTTPS
- Cloudflare: خودکار فعال
- Fly.io: خودکار فعال
- Railway: خودکار فعال

### CDN و کش
```javascript
// Headers for better caching
// در _headers فایل Netlify/Cloudflare:
/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate
```

## 🧪 تست deployment

### تست خودکار
```bash
# در اسکریپت موجود است:
./deploy-iran.sh test
```

### تست دستی
```bash
# Backend health
curl https://your-app.fly.dev/api/health

# Frontend
curl -I https://your-app.pages.dev

# از ایران
# باز کردن در مرورگر و تست تمام قابلیت‌ها
```

## 🔍 مانیتورینگ

### Logs
```bash
# Fly.io logs
fly logs

# Cloudflare Pages
# Dashboard → انتخاب project → Functions
```

### Analytics
- Cloudflare: خودکار در dashboard
- Fly.io: Metrics در dashboard
- Custom: Google Analytics اضافه کن

## 🆘 عیب‌یابی

### مشکلات رایج

1. **Build ناموفق**:
```bash
# چک کردن dependencies
npm install

# محلی build کن
npm run build

# لاگ‌ها را چک کن
```

2. **Environment variables**:
```bash
# چک کردن متغیرها
echo $VITE_BACKEND_MODE
echo $VITE_PB_URL

# تنظیم مجدد در platform
```

3. **CORS خطا**:
```javascript
// در backend تنظیم CORS
app.register(cors, { 
  origin: ['https://your-domain.pages.dev', 'https://your-domain.com']
})
```

4. **Database اتصال**:
```bash
# چک health endpoint
curl https://your-backend/api/health

# چک دیتابیس
# در PocketBase Dashboard
```

### ابزارهای debug
```bash
# Network connectivity
ping your-domain.pages.dev

# DNS lookup
nslookup your-domain.pages.dev

# SSL certificate
openssl s_client -connect your-domain:443 -servername your-domain
```

## 📞 پشتیبانی

### منابع کمک
- **Cloudflare Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs)
- **PocketBase Docs**: [pocketbase.io/docs](https://pocketbase.io/docs)

### تماس با توسعه‌دهنده
- **نام**: علیرضا حامد
- **سال توسعه**: پاییز 1404
- **Repository**: GitHub repository این پروژه

---

## ✅ Checklist نهایی

- [ ] کد در GitHub آپلود شده
- [ ] Backend در Fly.io یا Railway deploy شده
- [ ] Frontend در Cloudflare Pages deploy شده
- [ ] Environment variables تنظیم شده
- [ ] Domain سفارشی اتصال داده شده (اختیاری)
- [ ] SSL فعال است
- [ ] از ایران قابل دسترسی است
- [ ] تمام قابلیت‌ها تست شده
- [ ] Monitoring فعال است

**🎉 تبریک! سیستم شما آماده استفاده است 🎉**