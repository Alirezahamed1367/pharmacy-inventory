# 📋 راهنمای استفاده از Database

## 🎯 **فایل‌های موجود**

### **1️⃣ schema.sql** - اسکریپت اصلی
- **هدف**: ایجاد کامل دیتابیس production
- **محتوا**: 
  - تمام جداول با روابط صحیح
  - 2 کاربر دائمی (superadmin & admin)
  - سیاست‌های امنیتی RLS
  - توابع کمکی
- **زمان استفاده**: راه‌اندازی اولیه سیستم

### **2️⃣ reset.sql** - ریست کامل
- **هدف**: پاک کردن و بازسازی کامل دیتابیس
- **محتوا**:
  - حذف تمام جداول و داده‌ها
  - پاک کردن policies
  - اجرای مجدد schema.sql
- **زمان استفاده**: هنگام نیاز به شروع از صفر

### **3️⃣ sample_data.sql** - داده‌های تست
- **هدف**: اضافه کردن داده‌های نمونه برای تست
- **محتوا**:
  - 10 دارو در دسته‌های مختلف
  - موجودی انبار
  - تحرکات نمونه
  - اعلانات
- **زمان استفاده**: بعد از نصب برای تست سیستم

---

## 🚀 **راهنمای نصب**

### **مرحله 1: نصب اولیه**
```sql
-- در Supabase SQL Editor اجرا کنید:
\i schema.sql
```

### **مرحله 2: اضافه کردن داده‌های تست (اختیاری)**
```sql
-- برای تست سیستم:
\i sample_data.sql
```

### **مرحله 3: ریست در صورت نیاز**
```sql
-- برای شروع مجدد:
\i reset.sql
```

---

## 👥 **کاربران پیش‌فرض**

| کاربر | نام کاربری | رمز عبور | نقش | توضیحات |
|-------|-------------|-----------|------|---------|
| توسعه‌دهنده | `superadmin` | `A25893Aa` | Super Admin | علیرضا حامد - غیر قابل حذف |
| مدیر سیستم | `admin` | `password` | Admin | مدیریت کاربران - غیر قابل حذف |

---

## 🏗️ **ساختار دیتابیس**

### **جداول اصلی:**
- **users**: کاربران سیستم
- **warehouses**: انبارها
- **drugs**: اطلاعات داروها
- **inventory**: موجودی انبار
- **inventory_movements**: تحرکات موجودی
- **transfers**: انتقالات بین انبار
- **notifications**: اعلانات سیستم

### **ویژگی‌های امنیتی:**
- ✅ Row Level Security (RLS)
- ✅ محافظت از کاربران دائمی
- ✅ کنترل دسترسی بر اساس نقش
- ✅ Audit trail برای تغییرات

### **توابع کمکی:**
- `check_low_stock()`: بررسی موجودی کم
- `check_expired_drugs()`: بررسی داروهای منقضی
- `update_modified_column()`: بروزرسانی خودکار timestamps

---

## 🔧 **عملیات مفید**

### **بررسی وضعیت سیستم:**
```sql
-- تعداد کاربران
SELECT COUNT(*) as user_count FROM users;

-- تعداد داروها
SELECT COUNT(*) as drug_count FROM drugs WHERE is_active = true;

-- موجودی کل
SELECT SUM(quantity) as total_inventory FROM inventory;

-- داروهای کم موجود
SELECT * FROM check_low_stock();

-- داروهای منقضی
SELECT * FROM check_expired_drugs();
```

### **مدیریت کاربران:**
```sql
-- اضافه کردن کاربر جدید
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES ('newuser', 'user@example.com', 'hashed_password', 'نام کاربر', 'operator');

-- فعال/غیرفعال کردن کاربر
UPDATE users SET is_active = false WHERE username = 'username';
```

### **مدیریت انبار:**
```sql
-- اضافه کردن انبار جدید
INSERT INTO warehouses (name, code, description)
VALUES ('انبار جدید', 'NEW', 'توضیحات انبار');

-- بررسی موجودی انبار
SELECT w.name, COUNT(i.id) as items, SUM(i.quantity) as total_quantity
FROM warehouses w
LEFT JOIN inventory i ON w.id = i.warehouse_id
GROUP BY w.id, w.name;
```

---

## ⚠️ **نکات مهم**

### **امنیت:**
- هرگز رمزهای واقعی را در کد commit نکنید
- کاربران دائمی قابل حذف نیستند
- RLS policies محافظت از داده‌ها می‌کنند

### **Performance:**
- همه ایندکس‌های ضروری تعریف شده‌اند
- از EXPLAIN ANALYZE برای بررسی کارایی استفاده کنید
- پشتیبان‌گیری منظم انجام دهید

### **Maintenance:**
- به‌طور منظم از `check_expired_drugs()` استفاده کنید
- موجودی کم را با `check_low_stock()` بررسی کنید
- Log های سیستم را پیگیری کنید

---

## 📞 **پشتیبانی**

**توسعه‌دهنده**: علیرضا حامد  
**ایمیل**: alireza.h67@gmail.com  
**پروژه**: [GitHub Repository](https://github.com/Alirezahamed1367/pharmacy-inventory)

**تاریخ آخرین بروزرسانی**: پاییز 1404