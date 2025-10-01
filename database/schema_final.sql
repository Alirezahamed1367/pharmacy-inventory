-- =====================================================
-- سیستم انبارداری دارو - اسکریپت دیتابیس (نسخه نهایی)
-- طراحی و توسعه: علیرضا حامد - پاییز 1404
-- =====================================================

-- پاک کردن جداول موجود برای شروع از صفر
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.drug_movements CASCADE;
DROP TABLE IF EXISTS public.warehouse_inventory CASCADE;
DROP TABLE IF EXISTS public.drugs CASCADE;
DROP TABLE IF EXISTS public.drug_categories CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;

-- =====================================================
-- جدول دسته‌بندی داروها (ابتدا ایجاد می‌شود)
-- =====================================================
CREATE TABLE public.drug_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- جدول انبارها
-- =====================================================
CREATE TABLE public.warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    manager_name VARCHAR(100),
    capacity INTEGER DEFAULT 1000 CHECK (capacity > 0),
    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- جدول کاربران
-- =====================================================
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'admin', 'manager', 'operator')),
    warehouse_id UUID REFERENCES public.warehouses(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- جدول داروها
-- =====================================================
CREATE TABLE public.drugs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    description TEXT,
    dosage VARCHAR(100),
    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول و...
    manufacturer VARCHAR(100),
    category_id UUID REFERENCES public.drug_categories(id),
    features TEXT,
    image_url VARCHAR(500),
    barcode VARCHAR(100),
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    unit_price DECIMAL(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- جدول موجودی انبار
-- =====================================================
CREATE TABLE public.warehouse_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
    batch_number VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit_cost DECIMAL(10,2) DEFAULT 0,
    manufacture_date DATE,
    expire_date DATE,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- اطمینان از یکتا بودن ترکیب انبار + دارو + بچ
    UNIQUE(warehouse_id, drug_id, batch_number)
);

-- =====================================================
-- جدول انتقالات داروها
-- =====================================================
CREATE TABLE public.drug_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_id UUID NOT NULL REFERENCES public.drugs(id),
    from_warehouse_id UUID REFERENCES public.warehouses(id),
    to_warehouse_id UUID REFERENCES public.warehouses(id),
    batch_number VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('transfer', 'entry', 'exit', 'adjustment', 'expired')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
    reference_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- جدول تنظیمات سیستم
-- =====================================================
CREATE TABLE public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- جدول لاگ فعالیت‌ها
-- =====================================================
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- ایندکس‌ها برای بهبود عملکرد
-- =====================================================
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_warehouse_id ON public.users(warehouse_id);

CREATE INDEX idx_warehouses_name ON public.warehouses(name);
CREATE INDEX idx_warehouses_active ON public.warehouses(active);

CREATE INDEX idx_drugs_name ON public.drugs(name);
CREATE INDEX idx_drugs_generic_name ON public.drugs(generic_name);
CREATE INDEX idx_drugs_barcode ON public.drugs(barcode);
CREATE INDEX idx_drugs_category_id ON public.drugs(category_id);
CREATE INDEX idx_drugs_active ON public.drugs(active);

CREATE INDEX idx_inventory_warehouse_id ON public.warehouse_inventory(warehouse_id);
CREATE INDEX idx_inventory_drug_id ON public.warehouse_inventory(drug_id);
CREATE INDEX idx_inventory_expire_date ON public.warehouse_inventory(expire_date);
CREATE INDEX idx_inventory_batch_number ON public.warehouse_inventory(batch_number);

CREATE INDEX idx_movements_drug_id ON public.drug_movements(drug_id);
CREATE INDEX idx_movements_from_warehouse ON public.drug_movements(from_warehouse_id);
CREATE INDEX idx_movements_to_warehouse ON public.drug_movements(to_warehouse_id);
CREATE INDEX idx_movements_status ON public.drug_movements(status);
CREATE INDEX idx_movements_type ON public.drug_movements(movement_type);
CREATE INDEX idx_movements_date ON public.drug_movements(movement_date);
CREATE INDEX idx_movements_reference ON public.drug_movements(reference_number);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_table_name ON public.activity_logs(table_name);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- =====================================================
-- توابع Trigger برای به‌روزرسانی automatic timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- اعمال trigger به جداول
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.warehouse_inventory
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Views برای گزارش‌گیری
-- =====================================================

-- نمای موجودی کامل
CREATE VIEW public.inventory_view AS
SELECT 
    wi.id,
    w.name as warehouse_name,
    d.name as drug_name,
    d.generic_name,
    d.dosage,
    d.form,
    wi.batch_number,
    wi.quantity,
    wi.unit_cost,
    wi.manufacture_date,
    wi.expire_date,
    CASE 
        WHEN wi.expire_date < CURRENT_DATE THEN 'expired'
        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'active'
    END as status,
    wi.entry_date,
    wi.last_updated
FROM public.warehouse_inventory wi
JOIN public.warehouses w ON wi.warehouse_id = w.id
JOIN public.drugs d ON wi.drug_id = d.id
WHERE w.active = true AND d.active = true;

-- نمای انتقالات کامل
CREATE VIEW public.movements_view AS
SELECT 
    dm.id,
    d.name as drug_name,
    fw.name as from_warehouse,
    tw.name as to_warehouse,
    dm.batch_number,
    dm.quantity,
    dm.movement_type,
    dm.status,
    dm.reference_number,
    dm.notes,
    cu.name as created_by_name,
    au.name as approved_by_name,
    dm.movement_date,
    dm.completed_date,
    dm.created_at
FROM public.drug_movements dm
JOIN public.drugs d ON dm.drug_id = d.id
LEFT JOIN public.warehouses fw ON dm.from_warehouse_id = fw.id
LEFT JOIN public.warehouses tw ON dm.to_warehouse_id = tw.id
LEFT JOIN public.users cu ON dm.created_by = cu.id
LEFT JOIN public.users au ON dm.approved_by = au.id;

-- =====================================================
-- داده‌های نمونه
-- =====================================================

-- دسته‌بندی داروها
INSERT INTO public.drug_categories (name, description) VALUES
('ضد درد', 'داروهای مسکن و ضد التهاب'),
('آنتی‌بیوتیک', 'داروهای ضد عفونی'),
('ویتامین', 'مکمل‌های ویتامین و مواد معدنی'),
('قلبی عروقی', 'داروهای مربوط به قلب و عروق'),
('گوارشی', 'داروهای مربوط به دستگاه گوارش');

-- انبارهای نمونه
INSERT INTO public.warehouses (name, description, location, manager_name, capacity) VALUES
('انبار مرکزی', 'انبار اصلی شرکت', 'تهران، میدان ولیعصر', 'علی احمدی', 2000),
('انبار شعبه شرق', 'انبار منطقه شرقی', 'تهران، نارمک', 'فاطمه محمدی', 800),
('انبار شعبه غرب', 'انبار منطقه غربی', 'تهران، اکباتان', 'محمد رضایی', 600),
('انبار شعبه شمال', 'انبار منطقه شمالی', 'تهران، تجریش', 'زهرا کریمی', 500);

-- کاربران نمونه
INSERT INTO public.users (username, name, role, active) VALUES
('superadmin', 'سوپر ادمین', 'superadmin', true),
('admin1', 'مدیر کل', 'admin', true),
('manager1', 'علی احمدی', 'manager', true),
('operator1', 'فاطمه محمدی', 'operator', true),
('operator2', 'محمد رضایی', 'operator', true);

-- تنظیمات سیستم
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('app_name', 'سیستم انبارداری دارو', 'string', 'نام برنامه'),
('version', '1.0.0', 'string', 'نسخه برنامه'),
('developer', 'علیرضا حامد', 'string', 'توسعه‌دهنده'),
('development_year', 'پاییز 1404', 'string', 'زمان توسعه'),
('session_timeout', '1800', 'number', 'مدت زمان نشست به ثانیه'),
('max_file_size', '5242880', 'number', 'حداکثر اندازه فایل آپلود (5MB)'),
('enable_notifications', 'true', 'boolean', 'فعال‌سازی اعلان‌ها'),
('backup_frequency', 'daily', 'string', 'فرکانس پشتیبان‌گیری');

-- =====================================================
-- تکمیل اسکریپت
-- =====================================================
-- این اسکریپت آماده اجرا در Supabase SQL Editor است
-- همه نوع داده‌ها UUID هستند و مشکل تضاد حل شده است