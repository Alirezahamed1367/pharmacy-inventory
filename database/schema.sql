-- 🏥 سیستم مدیریت انبار داروخانه - Schema نهایی-- =====================================================

-- =====================================================-- سیستم انبارداری دارو - اسکریپت دیتابیس (نسخه نهایی و صحیح)

-- 👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404-- طراحی و توسعه: علیرضا حامد - پاییز 1404

-- 📧 Email: alireza.h67@gmail.com-- =====================================================

-- 🎯 نسخه: Production Ready

-- =====================================================-- پاک کردن جداول موجود برای شروع از صفر

DROP TABLE IF EXISTS public.activity_logs CASCADE;

-- ===== حذف جداول موجود =====DROP TABLE IF EXISTS public.drug_movements CASCADE;

DROP TABLE IF EXISTS notifications CASCADE;DROP TABLE IF EXISTS public.warehouse_inventory CASCADE;

DROP TABLE IF EXISTS transfers CASCADE;DROP TABLE IF EXISTS public.drugs CASCADE;

DROP TABLE IF EXISTS inventory_movements CASCADE;DROP TABLE IF EXISTS public.drug_categories CASCADE;

DROP TABLE IF EXISTS inventory CASCADE;DROP TABLE IF EXISTS public.system_settings CASCADE;

DROP TABLE IF EXISTS warehouse_inventory CASCADE;DROP TABLE IF EXISTS public.users CASCADE;

DROP TABLE IF EXISTS drug_movements CASCADE;DROP TABLE IF EXISTS public.warehouses CASCADE;

DROP TABLE IF EXISTS activity_logs CASCADE;

DROP TABLE IF EXISTS system_settings CASCADE;-- =====================================================

DROP TABLE IF EXISTS drug_categories CASCADE;-- جدول دسته‌بندی داروها

DROP TABLE IF EXISTS drugs CASCADE;-- =====================================================

DROP TABLE IF EXISTS warehouses CASCADE;CREATE TABLE public.drug_categories (

DROP TABLE IF EXISTS users CASCADE;    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

-- حذف enum ها    description TEXT,

DROP TYPE IF EXISTS notification_type CASCADE;    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

DROP TYPE IF EXISTS transfer_status CASCADE;);

DROP TYPE IF EXISTS movement_type CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;-- =====================================================

-- جدول داروها

-- =====================================================-- =====================================================

-- جدول کاربرانCREATE TABLE public.drugs (

-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

CREATE TABLE IF NOT EXISTS public.users (    name VARCHAR(200) NOT NULL,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    generic_name VARCHAR(200),

    username VARCHAR(50) UNIQUE NOT NULL,    description TEXT,

    name VARCHAR(100) NOT NULL,    dosage VARCHAR(100),

    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'admin', 'manager', 'operator')),    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول و...

    warehouse_id UUID,    manufacturer VARCHAR(100),

    active BOOLEAN DEFAULT true,    category_id UUID REFERENCES public.drug_categories(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    features TEXT,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    image_url VARCHAR(500),

);    barcode VARCHAR(100),

    min_stock_level INTEGER DEFAULT 0,

-- ایندکس برای بهبود عملکرد    max_stock_level INTEGER DEFAULT 1000,

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);    unit_price DECIMAL(10,2) DEFAULT 0,

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);    active BOOLEAN DEFAULT true,

CREATE INDEX IF NOT EXISTS idx_users_warehouse_id ON public.users(warehouse_id);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

-- =====================================================);

-- جدول انبارها

-- =====================================================-- =====================================================

CREATE TABLE IF NOT EXISTS public.warehouses (-- جدول انبارها

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,-- =====================================================

    name VARCHAR(100) NOT NULL,CREATE TABLE public.warehouses (

    description TEXT,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    location VARCHAR(200),    name VARCHAR(200) NOT NULL,

    manager_name VARCHAR(100),    location VARCHAR(300),

    capacity INTEGER DEFAULT 1000 CHECK (capacity > 0),    manager_name VARCHAR(100),

    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),    phone VARCHAR(20),

    active BOOLEAN DEFAULT true,    email VARCHAR(100),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    description TEXT,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    active BOOLEAN DEFAULT true,

);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

-- ایندکس برای بهبود عملکرد);

CREATE INDEX IF NOT EXISTS idx_warehouses_name ON public.warehouses(name);

CREATE INDEX IF NOT EXISTS idx_warehouses_active ON public.warehouses(active);-- =====================================================

-- جدول کاربران

-- =====================================================-- =====================================================

-- جدول دسته‌بندی داروهاCREATE TABLE public.users (

-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

CREATE TABLE IF NOT EXISTS public.drug_categories (    username VARCHAR(50) UNIQUE NOT NULL,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    password VARCHAR(100) NOT NULL,

    name VARCHAR(100) NOT NULL,    full_name VARCHAR(100) NOT NULL,

    description TEXT,    email VARCHAR(100),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    phone VARCHAR(20),

);    role VARCHAR(20) NOT NULL DEFAULT 'operator',

    warehouse_id UUID REFERENCES public.warehouses(id),

-- =====================================================    permissions JSONB DEFAULT '{}',

-- جدول داروها    active BOOLEAN DEFAULT true,

-- =====================================================    last_login TIMESTAMP WITH TIME ZONE,

CREATE TABLE IF NOT EXISTS public.drugs (    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    name VARCHAR(200) NOT NULL,);

    generic_name VARCHAR(200),

    description TEXT,-- =====================================================

    dosage VARCHAR(100),-- جدول موجودی انبار

    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول و...-- =====================================================

    manufacturer VARCHAR(100),CREATE TABLE public.warehouse_inventory (

    category_id UUID REFERENCES public.drug_categories(id),    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    features TEXT,    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,

    image_url VARCHAR(500),    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,

    barcode VARCHAR(100),    quantity INTEGER NOT NULL DEFAULT 0,

    min_stock_level INTEGER DEFAULT 0,    expiry_date DATE,

    max_stock_level INTEGER DEFAULT 1000,    batch_number VARCHAR(50),

    unit_price DECIMAL(10,2) DEFAULT 0,    supplier VARCHAR(100),

    active BOOLEAN DEFAULT true,    purchase_price DECIMAL(10,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    purchase_date DATE,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    notes TEXT,

);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

-- ایندکس برای بهبود عملکرد    UNIQUE(drug_id, warehouse_id, batch_number)

CREATE INDEX IF NOT EXISTS idx_drugs_name ON public.drugs(name););

CREATE INDEX IF NOT EXISTS idx_drugs_generic_name ON public.drugs(generic_name);

CREATE INDEX IF NOT EXISTS idx_drugs_barcode ON public.drugs(barcode);-- =====================================================

CREATE INDEX IF NOT EXISTS idx_drugs_category_id ON public.drugs(category_id);-- جدول حرکات داروها

CREATE INDEX IF NOT EXISTS idx_drugs_active ON public.drugs(active);-- =====================================================

CREATE TABLE public.drug_movements (

-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- جدول موجودی انبار    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,

-- =====================================================    from_warehouse_id UUID REFERENCES public.warehouses(id),

CREATE TABLE IF NOT EXISTS public.warehouse_inventory (    to_warehouse_id UUID REFERENCES public.warehouses(id),

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'transfer'

    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,    quantity INTEGER NOT NULL,

    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,    reference_number VARCHAR(100),

    batch_number VARCHAR(100),    batch_number VARCHAR(50),

    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),    expiry_date DATE,

    unit_cost DECIMAL(10,2) DEFAULT 0,    supplier VARCHAR(100),

    manufacture_date DATE,    user_id UUID REFERENCES public.users(id),

    expire_date DATE,    notes TEXT,

    entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    status VARCHAR(20) DEFAULT 'completed',

    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    movement_date DATE DEFAULT CURRENT_DATE,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    -- اطمینان از یکتا بودن ترکیب انبار + دارو + بچ);

    UNIQUE(warehouse_id, drug_id, batch_number)

);-- =====================================================

-- جدول تنظیمات سیستم

-- ایندکس برای بهبود عملکرد-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON public.warehouse_inventory(warehouse_id);CREATE TABLE public.system_settings (

CREATE INDEX IF NOT EXISTS idx_inventory_drug_id ON public.warehouse_inventory(drug_id);    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

CREATE INDEX IF NOT EXISTS idx_inventory_expire_date ON public.warehouse_inventory(expire_date);    setting_key VARCHAR(100) UNIQUE NOT NULL,

CREATE INDEX IF NOT EXISTS idx_inventory_batch_number ON public.warehouse_inventory(batch_number);    setting_value JSONB NOT NULL,

    description TEXT,

-- =====================================================    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

-- جدول انتقالات داروها    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

-- =====================================================);

CREATE TABLE IF NOT EXISTS public.drug_movements (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,-- =====================================================

    drug_id UUID NOT NULL REFERENCES public.drugs(id),-- جدول لاگ فعالیت‌ها

    from_warehouse_id UUID REFERENCES public.warehouses(id),-- =====================================================

    to_warehouse_id UUID REFERENCES public.warehouses(id),CREATE TABLE public.activity_logs (

    batch_number VARCHAR(100),    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    quantity INTEGER NOT NULL CHECK (quantity > 0),    user_id UUID REFERENCES public.users(id),

    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('transfer', 'entry', 'exit', 'adjustment', 'expired')),    action VARCHAR(100) NOT NULL,

    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),    table_name VARCHAR(50),

    reference_number VARCHAR(100),    record_id UUID,

    notes TEXT,    old_values JSONB,

    created_by UUID REFERENCES public.users(id),    new_values JSONB,

    approved_by UUID REFERENCES public.users(id),    ip_address VARCHAR(45),

    movement_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    user_agent TEXT,

    completed_date TIMESTAMP WITH TIME ZONE,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);

);

-- =====================================================

-- ایندکس برای بهبود عملکرد-- ایجاد فانکشن trigger برای updated_at

CREATE INDEX IF NOT EXISTS idx_movements_drug_id ON public.drug_movements(drug_id);-- =====================================================

CREATE INDEX IF NOT EXISTS idx_movements_from_warehouse ON public.drug_movements(from_warehouse_id);CREATE OR REPLACE FUNCTION update_updated_at_column()

CREATE INDEX IF NOT EXISTS idx_movements_to_warehouse ON public.drug_movements(to_warehouse_id);RETURNS TRIGGER AS $$

CREATE INDEX IF NOT EXISTS idx_movements_status ON public.drug_movements(status);BEGIN

CREATE INDEX IF NOT EXISTS idx_movements_type ON public.drug_movements(movement_type);    NEW.updated_at = timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_movements_date ON public.drug_movements(movement_date);    RETURN NEW;

CREATE INDEX IF NOT EXISTS idx_movements_reference ON public.drug_movements(reference_number);END;

$$ language 'plpgsql';

-- =====================================================

-- جدول تنظیمات سیستم-- =====================================================

-- =====================================================-- اضافه کردن trigger برای جداول

CREATE TABLE IF NOT EXISTS public.system_settings (-- =====================================================

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

    setting_key VARCHAR(100) UNIQUE NOT NULL,CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

    setting_value TEXT,CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),CREATE TRIGGER update_warehouse_inventory_updated_at BEFORE UPDATE ON public.warehouse_inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

    description TEXT,CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL-- =====================================================

);-- ایجاد indexes برای بهبود کارایی

-- =====================================================

-- =====================================================CREATE INDEX idx_drugs_name ON public.drugs(name);

-- جدول لاگ فعالیت‌هاCREATE INDEX idx_drugs_category ON public.drugs(category_id);

-- =====================================================CREATE INDEX idx_drugs_active ON public.drugs(active);

CREATE TABLE IF NOT EXISTS public.activity_logs (CREATE INDEX idx_warehouses_active ON public.warehouses(active);

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,CREATE INDEX idx_users_username ON public.users(username);

    user_id UUID REFERENCES public.users(id),CREATE INDEX idx_users_role ON public.users(role);

    action VARCHAR(100) NOT NULL,CREATE INDEX idx_warehouse_inventory_drug ON public.warehouse_inventory(drug_id);

    table_name VARCHAR(50),CREATE INDEX idx_warehouse_inventory_warehouse ON public.warehouse_inventory(warehouse_id);

    record_id UUID,CREATE INDEX idx_warehouse_inventory_expiry ON public.warehouse_inventory(expiry_date);

    old_values JSONB,CREATE INDEX idx_drug_movements_drug ON public.drug_movements(drug_id);

    new_values JSONB,CREATE INDEX idx_drug_movements_date ON public.drug_movements(movement_date);

    ip_address INET,CREATE INDEX idx_drug_movements_type ON public.drug_movements(movement_type);

    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL-- =====================================================

);-- ایجاد views مفید

-- =====================================================

-- ایندکس برای بهبود عملکرد

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);-- نمای موجودی انبار با جزئیات

CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);CREATE VIEW inventory_view AS

CREATE INDEX IF NOT EXISTS idx_activity_logs_table_name ON public.activity_logs(table_name);SELECT 

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);    wi.id,

    d.name as drug_name,

-- =====================================================    d.generic_name,

-- Foreign Key برای users.warehouse_id    d.dosage,

-- =====================================================    d.form,

ALTER TABLE public.users ADD CONSTRAINT fk_users_warehouse_id     w.name as warehouse_name,

    FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);    wi.quantity,

    wi.expiry_date,

-- =====================================================    wi.batch_number,

-- توابع Trigger برای به‌روزرسانی automatic timestamps    wi.supplier,

-- =====================================================    wi.purchase_price,

CREATE OR REPLACE FUNCTION public.update_updated_at_column()    wi.purchase_date,

RETURNS TRIGGER AS $$    CASE 

BEGIN        WHEN wi.expiry_date < CURRENT_DATE THEN 'expired'

    NEW.updated_at = timezone('utc'::text, now());        WHEN wi.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'

    RETURN NEW;        ELSE 'good'

END;    END as status

$$ language 'plpgsql';FROM public.warehouse_inventory wi

JOIN public.drugs d ON wi.drug_id = d.id

-- اعمال trigger به جداولJOIN public.warehouses w ON wi.warehouse_id = w.id

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.usersWHERE d.active = true AND w.active = true;

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- نمای حرکات داروها با جزئیات

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehousesCREATE VIEW movements_view AS

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();SELECT 

    dm.id,

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs    d.name as drug_name,

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    wf.name as from_warehouse,

    wt.name as to_warehouse,

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.warehouse_inventory    dm.movement_type,

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    dm.quantity,

    dm.reference_number,

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.system_settings    dm.batch_number,

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    dm.expiry_date,

    dm.supplier,

-- =====================================================    u.full_name as user_name,

-- Views برای گزارش‌گیری    dm.notes,

-- =====================================================    dm.status,

    dm.movement_date,

-- نمای موجودی کامل    dm.created_at

CREATE OR REPLACE VIEW public.inventory_view ASFROM public.drug_movements dm

SELECT JOIN public.drugs d ON dm.drug_id = d.id

    wi.id,LEFT JOIN public.warehouses wf ON dm.from_warehouse_id = wf.id

    w.name as warehouse_name,LEFT JOIN public.warehouses wt ON dm.to_warehouse_id = wt.id

    d.name as drug_name,LEFT JOIN public.users u ON dm.user_id = u.id

    d.generic_name,ORDER BY dm.created_at DESC;

    d.dosage,

    d.form,-- =====================================================

    wi.batch_number,-- درج کاربران پیش‌فرض سیستم

    wi.quantity,-- =====================================================

    wi.unit_cost,INSERT INTO public.users (username, password, full_name, role) VALUES

    wi.manufacture_date,('superadmin', 'A25893Aa', 'مدیر کل سیستم', 'superadmin'),

    wi.expire_date,('admin1', '123456', 'مدیر کل', 'admin'),

    CASE ('manager1', '123456', 'مدیر انبار', 'manager'),

        WHEN wi.expire_date < CURRENT_DATE THEN 'expired'('operator1', '123456', 'کارمند', 'operator');

        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'

        ELSE 'active'-- =====================================================

    END as status,-- درج دسته‌بندی‌های پیش‌فرض

    wi.entry_date,-- =====================================================

    wi.last_updatedINSERT INTO public.drug_categories (name, description) VALUES

FROM public.warehouse_inventory wi('مسکن و ضد التهاب', 'داروهای مسکن و ضد التهاب'),

JOIN public.warehouses w ON wi.warehouse_id = w.id('آنتی‌بیوتیک', 'داروهای ضد باکتری'),

JOIN public.drugs d ON wi.drug_id = d.id('قلبی و عروقی', 'داروهای مربوط به قلب و عروق'),

WHERE w.active = true AND d.active = true;('تنفسی', 'داروهای مربوط به دستگاه تنفس'),

('گوارشی', 'داروهای مربوط به دستگاه گوارش');

-- نمای انتقالات کامل

CREATE OR REPLACE VIEW public.movements_view AS-- =====================================================

SELECT -- تنظیمات پیش‌فرض سیستم

    dm.id,-- =====================================================

    d.name as drug_name,INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES

    fw.name as from_warehouse,('suppliers', '[]', 'لیست تأمین‌کنندگان'),

    tw.name as to_warehouse,('notification_settings', '{"expiry_days": 30, "low_stock_threshold": 10}', 'تنظیمات اعلان‌ها'),

    dm.batch_number,('system_info', '{"name": "سیستم مدیریت انبار دارو", "version": "1.0.0", "developer": "علیرضا حامد"}', 'اطلاعات سیستم');

    dm.quantity,

    dm.movement_type,-- =====================================================

    dm.status,-- فعال‌سازی RLS (Row Level Security)

    dm.reference_number,-- =====================================================

    dm.notes,ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    cu.name as created_by_name,ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;

    au.name as approved_by_name,ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

    dm.movement_date,ALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;

    dm.completed_date,ALTER TABLE public.drug_movements ENABLE ROW LEVEL SECURITY;

    dm.created_atALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

FROM public.drug_movements dm

JOIN public.drugs d ON dm.drug_id = d.id-- =====================================================

LEFT JOIN public.warehouses fw ON dm.from_warehouse_id = fw.id-- پایان اسکریپت

LEFT JOIN public.warehouses tw ON dm.to_warehouse_id = tw.id-- =====================================================
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
('گوارشی', 'داروهای مربوط به دستگاه گوارش')
ON CONFLICT DO NOTHING;

-- انبارهای نمونه
INSERT INTO public.warehouses (name, description, location, manager_name, capacity) VALUES
('انبار مرکزی', 'انبار اصلی شرکت', 'تهران، میدان ولیعصر', 'علی احمدی', 2000),
('انبار شعبه شرق', 'انبار منطقه شرقی', 'تهران، نارمک', 'فاطمه محمدی', 800),
('انبار شعبه غرب', 'انبار منطقه غربی', 'تهران، اکباتان', 'محمد رضایی', 600),
('انبار شعبه شمال', 'انبار منطقه شمالی', 'تهران، تجریش', 'زهرا کریمی', 500)
ON CONFLICT DO NOTHING;

-- کاربران نمونه
INSERT INTO public.users (username, name, role, active) VALUES
('superadmin', 'سوپر ادمین', 'superadmin', true),
('admin1', 'مدیر کل', 'admin', true),
('manager1', 'علی احمدی', 'manager', true),
('operator1', 'فاطمه محمدی', 'operator', true),
('operator2', 'محمد رضایی', 'operator', true)
ON CONFLICT (username) DO NOTHING;

-- تنظیمات سیستم
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('app_name', 'سیستم انبارداری دارو', 'string', 'نام برنامه'),
('version', '1.0.0', 'string', 'نسخه برنامه'),
('developer', 'علیرضا حامد', 'string', 'توسعه‌دهنده'),
('development_year', 'پاییز 1404', 'string', 'زمان توسعه'),
('session_timeout', '1800', 'number', 'مدت زمان نشست به ثانیه'),
('max_file_size', '5242880', 'number', 'حداکثر اندازه فایل آپلود (5MB)'),
('enable_notifications', 'true', 'boolean', 'فعال‌سازی اعلان‌ها'),
('backup_frequency', 'daily', 'string', 'فرکانس پشتیبان‌گیری')
ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = timezone('utc'::text, now());

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy برای دسترسی کاربران
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Only admins can modify users" ON public.users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
);

-- Policy برای انبارها
CREATE POLICY "Users can view all warehouses" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Only admins can modify warehouses" ON public.warehouses FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')
    )
);

-- Policy برای داروها
CREATE POLICY "Users can view all drugs" ON public.drugs FOR SELECT USING (true);
CREATE POLICY "Authorized users can modify drugs" ON public.drugs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')
    )
);

-- =====================================================
-- Storage Buckets برای تصاویر
-- =====================================================
-- این دستور در Supabase Console اجرا شود:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('drug-images', 'drug-images', true);

-- =====================================================
-- تکمیل اسکریپت
-- =====================================================
SELECT '🎉 سیستم مدیریت انبار داروخانه با موفقیت نصب شد' as status,
       '👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404' as developer;

-- این اسکریپت آماده اجرا در Supabase SQL Editor است