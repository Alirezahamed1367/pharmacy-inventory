# 🇮🇷 راهنمای استقرار برای ایران (رایگان + بدون فیلتر)

## 🎯 راهکار توصیه‌شده: PocketBase + Cloudflare Pages

### چرا این راهکار؟
- ✅ **رایگان**: هیچ هزینه‌ای ندارد
- ✅ **دسترسی از ایران**: Cloudflare از ایران کار می‌کند
- ✅ **بدون فیلتر**: مشکل تحریم ندارد
- ✅ **خودکار**: deployment کاملاً اتوماتیک
- ✅ **سریع**: CDN جهانی Cloudflare
- ✅ **پایدار**: کم‌ترین مشکل فنی

---

## 📋 مرحله 1: آماده‌سازی PocketBase

### 1.1 تنظیم متغیرهای محیطی
فایل `.env.local` بسازید:
```
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=https://your-app.fly.dev
```

### 1.2 کالکشن‌های دیتابیس
دو روش:
- **اتوماتیک**: اسکریپت `npm run pb:init` (اگر auth درست شد)
- **دستی**: طبق راهنمای قبلی که دادم

---

## 📋 مرحله 2: استقرار Backend (PocketBase)

### گزینه A: Fly.io (توصیه)
1. ثبت‌نام در [fly.io](https://fly.io)
2. نصب Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

3. ایجاد فایل `fly.toml`:
```toml
app = "pharmacy-inventory-pb"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile.pocketbase"

[http_service]
  internal_port = 8090
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[mounts]
  source = "pb_data"
  destination = "/app/pb_data"
```

### گزینه B: Railway (آسان‌تر)
1. ثبت‌نام در [railway.app](https://railway.app)
2. "Deploy from GitHub" → انتخاب repo
3. Environment Variables:
   - `PORT=8090`
4. Auto-deploy فعال

---

## 📋 مرحله 3: استقرار Frontend (Cloudflare Pages)

### 3.1 آماده‌سازی کد
```bash
# تنظیم environment برای production
echo "VITE_BACKEND_MODE=pocketbase" > .env.local
echo "VITE_PB_URL=https://your-pocketbase-url" >> .env.local

# build تست
npm run build
```

### 3.2 استقرار در Cloudflare Pages
1. ثبت‌نام در [pages.cloudflare.com](https://pages.cloudflare.com)
2. "Create a project" → "Connect to Git"
3. انتخاب repository GitHub
4. تنظیمات Build:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Build output**: `dist`
5. Environment Variables:
   ```
   VITE_BACKEND_MODE=pocketbase
   VITE_PB_URL=https://your-pocketbase-url
   ```
6. Deploy

### 3.3 دامنه سفارشی (اختیاری)
در Cloudflare Pages → Custom domains → Add domain

---

## 📋 مرحله 4: تست و تأیید

### 4.1 چک Health
```bash
# Backend health
curl https://your-pocketbase-url/api/health

# Frontend
https://your-app.pages.dev
```

### 4.2 تست از ایران
- باز کردن سایت از مرورگر ایرانی
- تست ثبت‌نام/ورود
- تست اضافه کردن دارو
- تست آپلود عکس

---

## 🛠 گزینه‌های دیگر

### Railway + Cloudflare Pages
```yaml
# railway.json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.fastify"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "sleepApplication": false
  }
}
```

### Render + Netlify
```yaml
# render.yaml
services:
  - type: web
    name: pharmacy-api
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: pharmacy-db
          property: connectionString
```

---

## 🔧 اسکریپت‌های اتوماسیون

### اسکریپت deploy سریع
```bash
#!/bin/bash
# deploy-iran.sh

echo "🇮🇷 Deploying for Iran access..."

# 1. Build frontend
npm run build

# 2. Deploy to Cloudflare (if wrangler installed)
if command -v wrangler &> /dev/null; then
    wrangler pages publish dist --project-name pharmacy-inventory
fi

# 3. Check health
curl -f https://your-app.pages.dev || echo "⚠️ Health check failed"

echo "✅ Deployment complete!"
echo "🌍 URL: https://your-app.pages.dev"
```

---

## 💡 نکات مهم

### امنیت
- همیشه از HTTPS استفاده کنید
- JWT secret را تغییر دهید
- Rate limiting فعال باشد

### عملکرد
- CDN Cloudflare خودکار فعال است
- تصاویر را optimize کنید
- Database indexing را چک کنید

### نگهداری
- Backup خودکار (PocketBase داخلی)
- Monitoring در Cloudflare Analytics
- Log centralization

---

## 🆘 عیب‌یابی

### مشکلات رایج
1. **CORS Error**: تنظیمات backend را چک کنید
2. **Database Connection**: environment variables را بررسی کنید
3. **Build Failure**: dependencies را update کنید
4. **Slow Loading**: CDN cache را clear کنید

### ابزارهای تست
```bash
# Network test
ping your-app.pages.dev

# API test
curl -I https://your-pocketbase-url/api/health

# Frontend test
curl -I https://your-app.pages.dev
```

---

## 📞 پشتیبانی

اگر مشکلی پیش آمد:
1. Log های deployment را چک کنید
2. Environment variables را مقایسه کنید
3. Health endpoints را تست کنید
4. کش مرورگر را clear کنید

**توسعه‌دهنده**: علیرضا حامد - پاییز 1404