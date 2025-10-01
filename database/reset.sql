-- 🔥 اسکریپت ریست کامل سیستم
-- ⚠️  هشدار: این اسکریپت تمام داده‌ها را حذف می‌کند!
-- 👨‍💻 طراحی: علیرضا حامد - پاییز 1404
-- 📧 Email: alireza.h67@gmail.com

-- ===== بررسی و هشدار =====
DO $$
BEGIN
    RAISE NOTICE '🔥 شروع ریست کامل سیستم...';
    RAISE NOTICE '⚠️  تمام داده‌ها حذف خواهند شد!';
    RAISE NOTICE '📅 زمان: %', NOW();
END $$;

-- ===== حذف کامل تمام جداول =====
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS drugs CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- حذف enum ها
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS transfer_status CASCADE;
DROP TYPE IF EXISTS movement_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- حذف function ها
DROP FUNCTION IF EXISTS update_modified_column() CASCADE;
DROP FUNCTION IF EXISTS check_low_stock() CASCADE;
DROP FUNCTION IF EXISTS check_expired_drugs() CASCADE;

-- ===== پاک کردن policies =====
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename || ' CASCADE';
    END LOOP;
    
    RAISE NOTICE '✅ تمام policies حذف شدند';
END $$;

-- ===== پاک کردن Storage (اختیاری) =====
/*
-- اگر از Supabase Storage استفاده می‌کنید
DELETE FROM storage.objects WHERE bucket_id = 'drug-images';
*/

-- ===== بازسازی سیستم =====
\i schema.sql

-- ===== بررسی نهایی =====
DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
    warehouse_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO warehouse_count FROM warehouses;
    
    RAISE NOTICE '✅ ریست کامل با موفقیت انجام شد!';
    RAISE NOTICE '📊 آماره‌های سیستم:';
    RAISE NOTICE '   📋 تعداد جداول: %', table_count;
    RAISE NOTICE '   👥 تعداد کاربران: %', user_count;
    RAISE NOTICE '   🏢 تعداد انبارها: %', warehouse_count;
    RAISE NOTICE '👨‍💻 سیستم توسط علیرضا حامد بازسازی شد';
    RAISE NOTICE '🕐 زمان تکمیل: %', NOW();
END $$;

-- ===== راهنمای استفاده =====
/*
💡 روش‌های اجرا:

1️⃣ در Supabase SQL Editor:
   کپی و paste کردن محتویات این فایل

2️⃣ از طریق psql:
   psql -h host -U user -d database -f reset.sql

3️⃣ در محیط توسعه:
   npm run db:reset

⚠️  نکات مهم:
   - همیشه قبل از ریست backup بگیرید
   - در production استفاده نکنید
   - فقط برای توسعه و تست

📞 پشتیبانی: alireza.h67@gmail.com
*/