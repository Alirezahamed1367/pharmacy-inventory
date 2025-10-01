-- 🔥 اسکریپت ریست کامل سیستم مدیریت انبار داروخانه
-- ⚠️  هشدار: این اسکریپت تمام داده‌ها را حذف می‌کند!
-- 📌 استفاده: فقط برای تست و ریست کامل سیستم
-- 👨‍💻 طراحی: علیرضا حامد - پاییز 1404

-- ===== قدم 1: بررسی و تایید ریست =====
DO $$
BEGIN
    RAISE NOTICE '🔥 در حال شروع ریست کامل سیستم...';
    RAISE NOTICE '⚠️  تمام داده‌ها حذف خواهند شد!';
    RAISE NOTICE '📅 زمان اجرا: %', NOW();
END $$;

-- ===== قدم 2: حذف کامل تمام جداول =====
-- حذف تمام constraint ها و dependencies
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS drugs CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- حذف تمام enum ها
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS transfer_status CASCADE;
DROP TYPE IF EXISTS movement_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- حذف تمام function ها
DROP FUNCTION IF EXISTS update_modified_column() CASCADE;
DROP FUNCTION IF EXISTS check_low_stock() CASCADE;
DROP FUNCTION IF EXISTS check_expired_drugs() CASCADE;

-- ===== قدم 3: پاک کردن تمام policies و security =====
-- این بخش برای Supabase ضروری است
DO $$
DECLARE
    r RECORD;
BEGIN
    -- حذف تمام RLS policies
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename || ' CASCADE';
    END LOOP;
    
    RAISE NOTICE '✅ تمام policies حذف شدند';
END $$;

-- ===== قدم 4: پاک کردن Storage (اختیاری) =====
-- اگر از Supabase Storage استفاده می‌کنید، این بخش را اجرا کنید
/*
-- حذف تمام فایل‌های آپلود شده
DELETE FROM storage.objects WHERE bucket_id = 'drug-images';
-- حذف bucket اگر نیاز دارید
-- DROP POLICY IF EXISTS "Everyone can view drug images" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'drug-images';
*/

-- ===== قدم 5: بازسازی کامل سیستم =====
RAISE NOTICE '🔄 شروع بازسازی سیستم...';

-- اجرای مجدد schema اصلی
\i schema_production.sql

-- ===== قدم 6: بررسی نهایی =====
DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
    warehouse_count INTEGER;
BEGIN
    -- شمارش جداول
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    -- شمارش کاربران
    SELECT COUNT(*) INTO user_count FROM users;
    
    -- شمارش انبارها
    SELECT COUNT(*) INTO warehouse_count FROM warehouses;
    
    RAISE NOTICE '✅ ریست کامل با موفقیت انجام شد!';
    RAISE NOTICE '📊 آماره‌های سیستم:';
    RAISE NOTICE '   - تعداد جداول: %', table_count;
    RAISE NOTICE '   - تعداد کاربران: %', user_count;
    RAISE NOTICE '   - تعداد انبارها: %', warehouse_count;
    RAISE NOTICE '👨‍💻 سیستم توسط علیرضا حامد بازسازی شد';
    RAISE NOTICE '🕐 زمان تکمیل: %', NOW();
END $$;

-- ===== نکات مهم برای استفاده =====
/*
💡 راهنمای استفاده:

1️⃣ برای ریست کامل:
   psql -h your-host -p 5432 -U your-user -d your-db -f reset_system.sql

2️⃣ برای ریست از طریق Supabase Dashboard:
   - وارد SQL Editor شوید
   - محتویات این فایل را copy-paste کنید
   - روی Run کلیک کنید

3️⃣ برای ریست در محیط توسعه:
   npm run db:reset

4️⃣ حفاظت از داده‌ها:
   - همیشه قبل از ریست، backup بگیرید
   - در production هرگز این اسکریپت را اجرا نکنید

⚠️  هشدار امنیتی:
   - این اسکریپت تمام داده‌ها را حذف می‌کند
   - فقط در محیط توسعه و تست استفاده کنید
   - قبل از اجرا حتماً backup تهیه کنید

📞 پشتیبانی:
   علیرضا حامد - alireza.h67@gmail.com
*/