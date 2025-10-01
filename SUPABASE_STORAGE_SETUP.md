# 📦 راهنمای راه‌اندازی Supabase Storage برای سیستم انبارداری دارو

## 🎯 **مقدمه**
سیستم ما برای نگهداری تصاویر داروها از **Supabase Storage** استفاده می‌کند که یک سرویس ذخیره‌سازی قدرتمند و مقرون‌به‌صرفه است.

---

## 🚀 **مراحل راه‌اندازی**

### **1️⃣ ورود به Supabase Dashboard**
1. به آدرس [https://supabase.com](https://supabase.com) بروید
2. با حساب کاربری خود وارد شوید
3. پروژه مربوط به سیستم انبارداری را انتخاب کنید

### **2️⃣ فعال‌سازی Storage**
1. در منوی سمت چپ، روی **"Storage"** کلیک کنید
2. اگر برای اولین بار است، Storage را فعال کنید

### **3️⃣ ایجاد Bucket برای تصاویر داروها**
1. روی **"Create bucket"** کلیک کنید
2. نام bucket را `drug-images` وارد کنید
3. **Public bucket** را فعال کنید (برای دسترسی آسان به تصاویر)
4. روی **"Create bucket"** کلیک کنید

### **4️⃣ تنظیم سیاست‌های امنیتی (RLS)**
در قسمت **"Policies"** برای bucket ایجاد شده:

#### **Policy برای آپلود (INSERT)**
```sql
-- سیاست آپلود: همه کاربران می‌توانند فایل آپلود کنند
CREATE POLICY "Enable upload for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'drug-images' AND 
    auth.role() = 'authenticated'
);
```

#### **Policy برای مشاهده (SELECT)**
```sql
-- سیاست مشاهده: همه می‌توانند تصاویر را مشاهده کنند
CREATE POLICY "Give users access to view images" ON storage.objects
FOR SELECT USING (bucket_id = 'drug-images');
```

#### **Policy برای حذف (DELETE)**
```sql
-- سیاست حذف: فقط کاربران احراز هویت شده
CREATE POLICY "Enable delete for authenticated users" ON storage.objects
FOR DELETE USING (
    bucket_id = 'drug-images' AND 
    auth.role() = 'authenticated'
);
```

### **5️⃣ تنظیم متغیرهای محیطی**
در فایل `.env` یا `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Storage Configuration
VITE_SUPABASE_STORAGE_URL=your-supabase-url/storage/v1
```

---

## 🔧 **پیکربندی در کد**

### **Configuration در supabase.js**
```javascript
// تنظیمات Storage
export const STORAGE_CONFIG = {
  drugImagesBucket: 'drug-images',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  uploadPath: 'drugs' // پوشه داخل bucket
}

// تابع آپلود تصویر با تنظیمات کامل
export const uploadDrugImage = async (file, drugId = null) => {
  try {
    // بررسی نوع فایل
    if (!STORAGE_CONFIG.allowedTypes.includes(file.type)) {
      throw new Error('نوع فایل مجاز نیست')
    }

    // بررسی حجم فایل
    if (file.size > STORAGE_CONFIG.maxFileSize) {
      throw new Error('حجم فایل بیش از حد مجاز است')
    }

    // ایجاد نام یکتا
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${drugId || 'temp'}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${STORAGE_CONFIG.uploadPath}/${fileName}`

    // آپلود به Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.drugImagesBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) throw error

    // دریافت URL عمومی
    const { data: urlData } = supabase.storage
      .from(STORAGE_CONFIG.drugImagesBucket)
      .getPublicUrl(filePath)

    return {
      success: true,
      data: {
        url: urlData.publicUrl,
        path: filePath,
        fileName: fileName,
        size: file.size,
        type: file.type
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
```

---

## 📊 **مزایای Supabase Storage**

### **✅ مزایا:**
- **رایگان تا 1GB** ذخیره‌سازی
- **CDN جهانی** برای سرعت بالا
- **امنیت بالا** با RLS
- **مقیاس‌پذیری** خودکار
- **API ساده** و مستند
- **پشتیبانی از انواع فایل**
- **مدیریت آسان** از Dashboard

### **💰 هزینه‌ها:**
- **Free Tier**: 1GB رایگان
- **Pro Plan**: $25/ماه → 100GB
- **هزینه اضافی**: $0.021 به ازای هر GB

---

## 🔄 **مایگریشن داده‌های موجود**

اگر تصاویری در localStorage یا سایر جاها دارید:

```javascript
// مایگریشن تصاویر موجود
const migrateExistingImages = async () => {
  const drugs = await supabase.from('drugs').select('*')
  
  for (const drug of drugs.data) {
    if (drug.image_url && drug.image_url.startsWith('data:')) {
      // تبدیل base64 به فایل
      const file = base64ToFile(drug.image_url, `${drug.name}.jpg`)
      
      // آپلود به Storage
      const result = await uploadDrugImage(file, drug.id)
      
      if (result.success) {
        // بروزرسانی URL در دیتابیس
        await supabase
          .from('drugs')
          .update({ image_url: result.data.url })
          .eq('id', drug.id)
      }
    }
  }
}
```

---

## 🔒 **نکات امنیتی**

1. **همیشه فایل‌ها را Validate کنید**
2. **حجم فایل‌ها را محدود کنید**
3. **نوع فایل‌ها را چک کنید**
4. **نام فایل‌ها را Sanitize کنید**
5. **از RLS استفاده کنید**

---

## 🚨 **عیب‌یابی**

### **مشکلات متداول:**

#### **خطای 403 Forbidden**
- بررسی کنید Policy ها درست تنظیم شده‌اند
- چک کنید bucket Public است

#### **خطای آپلود**
- بررسی اندازه فایل
- چک کردن نوع فایل
- بررسی اتصال اینترنت

#### **تصاویر لود نمی‌شوند**
- URL عمومی را چک کنید
- CORS settings را بررسی کنید

---

## 📞 **پشتیبانی**

برای مشکلات فنی:
- 📧 **Email**: support@supabase.io
- 📚 **Documentation**: https://supabase.com/docs/guides/storage
- 💬 **Discord**: https://discord.supabase.com

---

**🎉 حالا سیستم شما آماده استفاده از قدرتمندترین سیستم ذخیره‌سازی است!**