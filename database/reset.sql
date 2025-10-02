-- 🏥 اسکریپت ریست کامل سیستم مدیریت انبار داروخانه
-- =====================================================
-- 👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404
-- 🎯 هدف: پاک کردن کامل دیتابیس برای شروع مجدد
-- ⚠️  هشدار: این اسکریپت تمام داده‌ها را پاک می‌کند!
-- =====================================================

-- نمایش پیام هشدار
SELECT 
    '⚠️ شروع عملیات پاک‌سازی کامل دیتابیس' as warning,
    '🗑️ تمام جداول، توابع و داده‌ها حذف خواهند شد' as notice,
    now() as start_time;

-- =====================================================
-- حذف Views
-- =====================================================
DROP VIEW IF EXISTS public.inventory_view CASCADE;
DROP VIEW IF EXISTS public.movements_view CASCADE;

-- =====================================================
-- حذف Policies (RLS)
-- =====================================================
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view all warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Users can view all drugs" ON public.drugs;
DROP POLICY IF EXISTS "Only admins can modify users" ON public.users;
DROP POLICY IF EXISTS "Only admins can modify warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Authorized users can modify drugs" ON public.drugs;

-- =====================================================
-- حذف Triggers
-- =====================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_warehouses_updated_at ON public.warehouses;
DROP TRIGGER IF EXISTS update_drugs_updated_at ON public.drugs;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.warehouse_inventory;
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.system_settings;

-- =====================================================
-- حذف Functions
-- =====================================================
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- =====================================================
-- حذف Indexes
-- =====================================================
DROP INDEX IF EXISTS public.idx_users_username;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_warehouse_id;
DROP INDEX IF EXISTS public.idx_warehouses_name;
DROP INDEX IF EXISTS public.idx_warehouses_active;
DROP INDEX IF EXISTS public.idx_drugs_name;
DROP INDEX IF EXISTS public.idx_drugs_barcode;
DROP INDEX IF EXISTS public.idx_drugs_category_id;
DROP INDEX IF EXISTS public.idx_drugs_active;
DROP INDEX IF EXISTS public.idx_inventory_warehouse_id;
DROP INDEX IF EXISTS public.idx_inventory_drug_id;
DROP INDEX IF EXISTS public.idx_inventory_expire_date;
DROP INDEX IF EXISTS public.idx_movements_drug_id;
DROP INDEX IF EXISTS public.idx_movements_status;
DROP INDEX IF EXISTS public.idx_movements_date;
DROP INDEX IF EXISTS public.idx_activity_logs_user_id;
DROP INDEX IF EXISTS public.idx_activity_logs_created_at;

-- =====================================================
-- حذف جداول به ترتیب وابستگی
-- =====================================================
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.drug_movements CASCADE;
DROP TABLE IF EXISTS public.warehouse_inventory CASCADE;
DROP TABLE IF EXISTS public.drugs CASCADE;
DROP TABLE IF EXISTS public.drug_categories CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;

-- حذف جداول قدیمی احتمالی
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.transfers CASCADE;
DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;

-- =====================================================
-- حذف ENUMs قدیمی احتمالی
-- =====================================================
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.transfer_status CASCADE;
DROP TYPE IF EXISTS public.movement_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- =====================================================
-- حذف Storage Buckets (اختیاری)
-- =====================================================
-- DELETE FROM storage.buckets WHERE id = 'drug-images';
-- این خط در صورت نیاز به پاک کردن فایل‌های آپلود شده فعال شود

-- =====================================================
-- بررسی و گزارش نهایی
-- =====================================================
SELECT 
    '✅ عملیات پاک‌سازی کامل با موفقیت انجام شد' as success,
    '🔄 سیستم آماده نصب مجدد است' as ready,
    '👨‍💻 توسط: علیرضا حامد - پاییز 1404' as developer,
    now() as completion_time;

-- =====================================================
-- آمادگی برای اجرای schema.sql
-- =====================================================
SELECT 
    '📋 مرحله بعد: اجرای schema.sql برای ایجاد جداول جدید' as next_step,
    '📂 سپس: اجرای sample_data.sql برای داده‌های نمونه' as then_step;