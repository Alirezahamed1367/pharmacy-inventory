# ⚡ راهنمای فوری (5 دقیقه)
# Quick Deploy Guide (5 minutes)

## 🎯 برای عجله‌ای‌ها: 3 دستور ساده

### گام 1: آماده‌سازی خودکار
```powershell
# اجرای اسکریپت آماده‌سازی کامل
.\quick-deploy.ps1
```
**⏱️ زمان: 1 دقیقه**

### گام 2: آپلود کد
```powershell
# جایگزین [USERNAME] با نام GitHub شما
git remote add origin https://github.com/[USERNAME]/pharmacy-inventory.git
git branch -M main  
git push -u origin main
```
**⏱️ زمان: 30 ثانیه**  
**📝 کار دستی**: ساخت repository در GitHub

### گام 3: Deploy خودکار
```powershell
# Backend (Fly.io)
fly auth login
fly launch --name pharmacy-inventory-pb --region fra --yes
fly volumes create pb_data --region fra --size 1
fly deploy
```
**⏱️ زمان: 2 دقیقه**  
**📝 کار دستی**: ثبت‌نام Fly.io (1 بار)

```
# Frontend (Cloudflare Pages)
https://pages.cloudflare.com → Connect Git → Deploy
```
**⏱️ زمان: 1.5 دقیقه**  
**📝 کار دستی**: کلیک Deploy در Cloudflare

---

## 🎉 نتیجه نهایی

✅ **Backend**: `https://pharmacy-inventory-pb.fly.dev`  
✅ **Frontend**: `https://pharmacy-inventory.pages.dev`  
✅ **Admin**: `https://pharmacy-inventory-pb.fly.dev/_/`

---

## 🚨 اگر خطا خورد

### خطای Build:
```powershell
npm cache clean --force
npm install
npm run build
```

### خطای Git:
```powershell
git init
git add .
git commit -m "Initial commit"
```

### خطای Fly:
```powershell
fly doctor  # چک کردن اتصال
fly deploy --force  # اجبار deploy
```

---

## 📞 کمک فوری

**اسکریپت خودکار**: `.\quick-deploy.ps1`  
**راهنمای کامل**: `DEPLOYMENT_STEP_BY_STEP.md`  
**عیب‌یابی**: در همین فایل بالا ↑

**توسعه‌دهنده**: علیرضا حامد - پاییز 1404