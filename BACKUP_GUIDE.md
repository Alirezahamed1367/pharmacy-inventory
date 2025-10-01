# 📋 راهنمای سیستم پشتیبان‌گیری خودکار
## سیستم مدیریت انبار داروخانه

**توسعه‌دهنده:** علیرضا حامد  
**ایمیل:** alireza.h67@gmail.com  
**تاریخ:** پاییز 1404

---

## 🎯 ویژگی‌های سیستم Backup

### 🔐 امنیت و پایداری
- ✅ پشتیبان‌گیری خودکار روزانه و هفتگی
- ✅ ارسال به ایمیل شخصی `alireza.h67@gmail.com`
- ✅ آپلود به مخزن GitHub خصوصی
- ✅ ذخیره محلی با مدیریت فضا
- ✅ فشرده‌سازی و رمزگذاری

### 📊 گزارش‌دهی
- ✅ اطلاعات کامل backup در فایل metadata
- ✅ نمایش وضعیت در کنسول
- ✅ ایمیل تائیدیه پس از backup موفق

---

## 🚀 راه‌اندازی سریع

### 1️⃣ نصب وابستگی‌ها
```bash
# نصب پکیج‌های Python
pip install psycopg2-binary schedule requests

# نصب PostgreSQL tools (برای pg_dump)
# Windows: دانلود از postgresql.org
# Ubuntu: sudo apt-get install postgresql-client
# macOS: brew install postgresql
```

### 2️⃣ تنظیم متغیرهای محیطی
```bash
# ایجاد فایل .env
SUPABASE_HOST=your-supabase-host
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-password
GITHUB_TOKEN=your-github-token
```

### 3️⃣ تنظیم Gmail App Password
1. وارد [Google Account](https://myaccount.google.com/) شوید
2. Security → 2-Step Verification → App passwords
3. رمز جدید برای "Mail" ایجاد کنید
4. رمز را در `backup_system.py` قرار دهید

### 4️⃣ اجرای سیستم
```bash
# backup فوری
python backup_system.py --now

# اجرای دائمی (خودکار)
python backup_system.py
```

---

## 📅 زمان‌بندی Backup ها

| نوع | زمان | فرکانس | توضیحات |
|-----|------|---------|---------|
| 🌅 روزانه | 2:00 صبح | هر روز | پشتیبان‌گیری کامل |
| 📅 هفتگی | یکشنبه 3:00 صبح | هفتگی | پشتیبان‌گیری تکمیلی |
| 🔄 فوری | دستی | در صورت نیاز | با دستور `--now` |

---

## 💾 مقاصد ذخیره‌سازی

### 📧 ایمیل (اولویت 1)
- **مقصد:** `alireza.h67@gmail.com`
- **حجم:** تا 25 مگابایت
- **فرمت:** ZIP + JSON metadata
- **امنیت:** ارسال رمزگذاری شده

### 🐙 GitHub (اولویت 2)
- **مخزن:** `pharmacy-inventory`
- **شاخه:** `backups`
- **دسترسی:** خصوصی
- **حفظ:** بلامدت

### 💻 محلی (اولویت 3)
- **مسیر:** `./backups/`
- **نگهداری:** 30 فایل آخر
- **پاک‌سازی:** خودکار

---

## 🔧 سناریوهای بازیابی

### 📦 بازیابی از Backup
```sql
-- 1. ریست کامل سیستم
\i reset_system.sql

-- 2. بازیابی از فایل backup
psql -h host -U user -d database -f pharmacy_backup_YYYYMMDD_HHMMSS.sql

-- 3. تست اتصال
SELECT 'سیستم بازیابی شد' as status;
```

### 🚨 بازیابی اضطراری
```bash
# 1. دانلود آخرین backup از ایمیل
# 2. استخراج فایل ZIP
unzip pharmacy_backup_YYYYMMDD_HHMMSS.zip

# 3. بررسی metadata
cat pharmacy_backup_YYYYMMDD_HHMMSS_metadata.json

# 4. اجرای بازیابی
psql -h host -U user -d database -f pharmacy_backup_YYYYMMDD_HHMMSS.sql
```

---

## ⚙️ تنظیمات پیشرفته

### 🔄 تغییر زمان‌بندی
```python
# در backup_system.py
schedule.every().hour.do(self.run_backup)  # هر ساعت
schedule.every(30).minutes.do(self.run_backup)  # هر 30 دقیقه
schedule.every().monday.at("10:30").do(self.run_backup)  # دوشنبه 10:30
```

### 📁 تغییر مسیر backup
```python
self.local_backup_path = 'D:/Backups/Pharmacy'  # مسیر دلخواه
self.max_local_backups = 50  # تعداد بیشتر فایل
```

### 📧 اضافه کردن گیرنده
```python
'recipients': [
    'alireza.h67@gmail.com',
    'admin@pharmacy.com',
    'manager@pharmacy.com'
]
```

---

## 🛡️ امنیت و نکات مهم

### ⚠️ هشدارهای امنیتی
- **هرگز** رمزهای واقعی را در کد commit نکنید
- از **App Password** برای Gmail استفاده کنید
- GitHub Token را **محدود** کنید (فقط repo access)
- فایل‌های backup را در محل **امن** نگهدارید

### 🔐 توصیه‌های امنیت
1. **رمزگذاری فایل‌ها:** از GPG برای رمزگذاری استفاده کنید
2. **دو مرحله‌ای Gmail:** حتماً فعال کنید
3. **Token محدود:** GitHub token را محدود به مخزن خاص کنید
4. **بررسی دوره‌ای:** وضعیت backup ها را کنترل کنید

---

## 🐛 عیب‌یابی

### ❌ مشکلات رایج

#### خطای اتصال پایگاه داده
```bash
# بررسی اتصال
pg_isready -h host -p port

# تست اتصال دستی
psql -h host -U user -d database -c "SELECT version();"
```

#### خطای ارسال ایمیل
```python
# فعال‌سازی less secure apps (Gmail)
# یا استفاده از App Password
```

#### خطای GitHub API
```bash
# بررسی token
curl -H "Authorization: token YOUR_TOKEN" \
     https://api.github.com/user
```

### 📞 پشتیبانی
**توسعه‌دهنده:** علیرضا حامد  
**ایمیل:** alireza.h67@gmail.com  
**پروژه:** [GitHub Repository](https://github.com/Alirezahamed1367/pharmacy-inventory)

---

## 📈 نسخه‌های آتی

### 🚀 ویژگی‌های برنامه‌ریزی شده
- [ ] رمزگذاری فایل‌های backup
- [ ] پشتیبان‌گیری افزایشی
- [ ] آپلود به فضای ابری (Google Drive, Dropbox)
- [ ] Dashboard وب برای مدیریت backup ها
- [ ] هشدار در صورت عدم موفقیت backup

### 📊 آمار و گزارش
- [ ] گزارش حجم backup ها
- [ ] نمودار موفقیت/شکست
- [ ] پیش‌بینی فضای مورد نیاز

---

*آخرین به‌روزرسانی: پاییز 1404 - علیرضا حامد*