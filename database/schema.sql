-- 🏥 سیستم مدیریت انبار داروخانه - Schema نهایی-- =====================================================

-- =====================================================-- سیستم انبارداری دارو - اسکریپت دیتابیس

-- 👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404-- طراحی و توسعه: علیرضا حامد - پاییز 1404

-- 📧 Email: alireza.h67@gmail.com-- =====================================================

-- 🎯 نسخه: Production Ready

-- =====================================================-- =====================================================

-- جدول کاربران

-- ===== حذف جداول موجود =====-- =====================================================

DROP TABLE IF EXISTS notifications CASCADE;CREATE TABLE IF NOT EXISTS public.users (

DROP TABLE IF EXISTS transfers CASCADE;    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

DROP TABLE IF EXISTS inventory_movements CASCADE;    username VARCHAR(50) UNIQUE NOT NULL,

DROP TABLE IF EXISTS inventory CASCADE;    name VARCHAR(100) NOT NULL,

DROP TABLE IF EXISTS warehouse_inventory CASCADE;    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'admin', 'manager', 'operator')),

DROP TABLE IF EXISTS drug_movements CASCADE;    warehouse_id UUID,

DROP TABLE IF EXISTS activity_logs CASCADE;    active BOOLEAN DEFAULT true,

DROP TABLE IF EXISTS system_settings CASCADE;    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

DROP TABLE IF EXISTS drug_categories CASCADE;    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

DROP TABLE IF EXISTS drugs CASCADE;);

DROP TABLE IF EXISTS warehouses CASCADE;

DROP TABLE IF EXISTS users CASCADE;-- ایندکس برای بهبود عملکرد

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- حذف enum هاCREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

DROP TYPE IF EXISTS notification_type CASCADE;CREATE INDEX IF NOT EXISTS idx_users_warehouse_id ON public.users(warehouse_id);

DROP TYPE IF EXISTS transfer_status CASCADE;

DROP TYPE IF EXISTS movement_type CASCADE;-- =====================================================

DROP TYPE IF EXISTS user_role CASCADE;-- جدول انبارها

-- =====================================================

-- =====================================================CREATE TABLE IF NOT EXISTS public.warehouses (

-- جدول کاربران    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- =====================================================    name VARCHAR(100) NOT NULL,

CREATE TABLE IF NOT EXISTS public.users (    description TEXT,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    location VARCHAR(200),

    username VARCHAR(50) UNIQUE NOT NULL,    manager_name VARCHAR(100),

    name VARCHAR(100) NOT NULL,    capacity INTEGER DEFAULT 1000 CHECK (capacity > 0),

    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'admin', 'manager', 'operator')),    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),

    warehouse_id UUID,    active BOOLEAN DEFAULT true,

    active BOOLEAN DEFAULT true,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);

);

-- ایندکس برای بهبود عملکرد

-- ایندکس برای بهبود عملکردCREATE INDEX IF NOT EXISTS idx_warehouses_name ON public.warehouses(name);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);CREATE INDEX IF NOT EXISTS idx_warehouses_active ON public.warehouses(active);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_users_warehouse_id ON public.users(warehouse_id);-- =====================================================

-- جدول دسته‌بندی داروها

-- =====================================================-- =====================================================

-- جدول انبارهاCREATE TABLE IF NOT EXISTS public.drug_categories (

-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

CREATE TABLE IF NOT EXISTS public.warehouses (    name VARCHAR(100) NOT NULL,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    description TEXT,

    name VARCHAR(100) NOT NULL,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    description TEXT,);

    location VARCHAR(200),

    manager_name VARCHAR(100),-- =====================================================

    capacity INTEGER DEFAULT 1000 CHECK (capacity > 0),-- جدول داروها

    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),-- =====================================================

    active BOOLEAN DEFAULT true,CREATE TABLE IF NOT EXISTS public.drugs (

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    name VARCHAR(200) NOT NULL,

);    generic_name VARCHAR(200),

    description TEXT,

-- ایندکس برای بهبود عملکرد    dosage VARCHAR(100),

CREATE INDEX IF NOT EXISTS idx_warehouses_name ON public.warehouses(name);    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول و...

CREATE INDEX IF NOT EXISTS idx_warehouses_active ON public.warehouses(active);    manufacturer VARCHAR(100),

    category_id UUID REFERENCES public.drug_categories(id),

-- =====================================================    features TEXT,

-- جدول دسته‌بندی داروها    image_url VARCHAR(500),

-- =====================================================    barcode VARCHAR(100),

CREATE TABLE IF NOT EXISTS public.drug_categories (    min_stock_level INTEGER DEFAULT 0,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    max_stock_level INTEGER DEFAULT 1000,

    name VARCHAR(100) NOT NULL,    unit_price DECIMAL(10,2) DEFAULT 0,

    description TEXT,    active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

);    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);

-- =====================================================

-- جدول داروها-- ایندکس برای بهبود عملکرد

-- =====================================================CREATE INDEX IF NOT EXISTS idx_drugs_name ON public.drugs(name);

CREATE TABLE IF NOT EXISTS public.drugs (CREATE INDEX IF NOT EXISTS idx_drugs_generic_name ON public.drugs(generic_name);

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,CREATE INDEX IF NOT EXISTS idx_drugs_barcode ON public.drugs(barcode);

    name VARCHAR(200) NOT NULL,CREATE INDEX IF NOT EXISTS idx_drugs_category_id ON public.drugs(category_id);

    generic_name VARCHAR(200),CREATE INDEX IF NOT EXISTS idx_drugs_active ON public.drugs(active);

    description TEXT,

    dosage VARCHAR(100),-- =====================================================

    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول و...-- جدول موجودی انبار

    manufacturer VARCHAR(100),-- =====================================================

    category_id UUID REFERENCES public.drug_categories(id),CREATE TABLE IF NOT EXISTS public.warehouse_inventory (

    features TEXT,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    image_url VARCHAR(500),    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,

    barcode VARCHAR(100),    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,

    min_stock_level INTEGER DEFAULT 0,    batch_number VARCHAR(100),

    max_stock_level INTEGER DEFAULT 1000,    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),

    unit_price DECIMAL(10,2) DEFAULT 0,    unit_cost DECIMAL(10,2) DEFAULT 0,

    active BOOLEAN DEFAULT true,    manufacture_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    expire_date DATE,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

);    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    

-- ایندکس برای بهبود عملکرد    -- اطمینان از یکتا بودن ترکیب انبار + دارو + بچ

CREATE INDEX IF NOT EXISTS idx_drugs_name ON public.drugs(name);    UNIQUE(warehouse_id, drug_id, batch_number)

CREATE INDEX IF NOT EXISTS idx_drugs_generic_name ON public.drugs(generic_name););

CREATE INDEX IF NOT EXISTS idx_drugs_barcode ON public.drugs(barcode);

CREATE INDEX IF NOT EXISTS idx_drugs_category_id ON public.drugs(category_id);-- ایندکس برای بهبود عملکرد

CREATE INDEX IF NOT EXISTS idx_drugs_active ON public.drugs(active);CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON public.warehouse_inventory(warehouse_id);

CREATE INDEX IF NOT EXISTS idx_inventory_drug_id ON public.warehouse_inventory(drug_id);

-- =====================================================CREATE INDEX IF NOT EXISTS idx_inventory_expire_date ON public.warehouse_inventory(expire_date);

-- جدول موجودی انبارCREATE INDEX IF NOT EXISTS idx_inventory_batch_number ON public.warehouse_inventory(batch_number);

-- =====================================================

CREATE TABLE IF NOT EXISTS public.warehouse_inventory (-- =====================================================

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,-- جدول انتقالات داروها

    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,-- =====================================================

    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,CREATE TABLE IF NOT EXISTS public.drug_movements (

    batch_number VARCHAR(100),    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),    drug_id UUID NOT NULL REFERENCES public.drugs(id),

    unit_cost DECIMAL(10,2) DEFAULT 0,    from_warehouse_id UUID REFERENCES public.warehouses(id),

    manufacture_date DATE,    to_warehouse_id UUID REFERENCES public.warehouses(id),

    expire_date DATE,    batch_number VARCHAR(100),

    entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    quantity INTEGER NOT NULL CHECK (quantity > 0),

    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('transfer', 'entry', 'exit', 'adjustment', 'expired')),

        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),

    -- اطمینان از یکتا بودن ترکیب انبار + دارو + بچ    reference_number VARCHAR(100),

    UNIQUE(warehouse_id, drug_id, batch_number)    notes TEXT,

);    created_by UUID REFERENCES public.users(id),

    approved_by UUID REFERENCES public.users(id),

-- ایندکس برای بهبود عملکرد    movement_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON public.warehouse_inventory(warehouse_id);    completed_date TIMESTAMP WITH TIME ZONE,

CREATE INDEX IF NOT EXISTS idx_inventory_drug_id ON public.warehouse_inventory(drug_id);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

CREATE INDEX IF NOT EXISTS idx_inventory_expire_date ON public.warehouse_inventory(expire_date););

CREATE INDEX IF NOT EXISTS idx_inventory_batch_number ON public.warehouse_inventory(batch_number);

-- ایندکس برای بهبود عملکرد

-- =====================================================CREATE INDEX IF NOT EXISTS idx_movements_drug_id ON public.drug_movements(drug_id);

-- جدول انتقالات داروهاCREATE INDEX IF NOT EXISTS idx_movements_from_warehouse ON public.drug_movements(from_warehouse_id);

-- =====================================================CREATE INDEX IF NOT EXISTS idx_movements_to_warehouse ON public.drug_movements(to_warehouse_id);

CREATE TABLE IF NOT EXISTS public.drug_movements (CREATE INDEX IF NOT EXISTS idx_movements_status ON public.drug_movements(status);

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,CREATE INDEX IF NOT EXISTS idx_movements_type ON public.drug_movements(movement_type);

    drug_id UUID NOT NULL REFERENCES public.drugs(id),CREATE INDEX IF NOT EXISTS idx_movements_date ON public.drug_movements(movement_date);

    from_warehouse_id UUID REFERENCES public.warehouses(id),CREATE INDEX IF NOT EXISTS idx_movements_reference ON public.drug_movements(reference_number);

    to_warehouse_id UUID REFERENCES public.warehouses(id),

    batch_number VARCHAR(100),-- =====================================================

    quantity INTEGER NOT NULL CHECK (quantity > 0),-- جدول تنظیمات سیستم

    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('transfer', 'entry', 'exit', 'adjustment', 'expired')),-- =====================================================

    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),CREATE TABLE IF NOT EXISTS public.system_settings (

    reference_number VARCHAR(100),    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    notes TEXT,    setting_key VARCHAR(100) UNIQUE NOT NULL,

    created_by UUID REFERENCES public.users(id),    setting_value TEXT,

    approved_by UUID REFERENCES public.users(id),    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),

    movement_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    description TEXT,

    completed_date TIMESTAMP WITH TIME ZONE,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

););



-- ایندکس برای بهبود عملکرد-- =====================================================

CREATE INDEX IF NOT EXISTS idx_movements_drug_id ON public.drug_movements(drug_id);-- جدول لاگ فعالیت‌ها

CREATE INDEX IF NOT EXISTS idx_movements_from_warehouse ON public.drug_movements(from_warehouse_id);-- =====================================================

CREATE INDEX IF NOT EXISTS idx_movements_to_warehouse ON public.drug_movements(to_warehouse_id);CREATE TABLE IF NOT EXISTS public.activity_logs (

CREATE INDEX IF NOT EXISTS idx_movements_status ON public.drug_movements(status);    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

CREATE INDEX IF NOT EXISTS idx_movements_type ON public.drug_movements(movement_type);    user_id UUID REFERENCES public.users(id),

CREATE INDEX IF NOT EXISTS idx_movements_date ON public.drug_movements(movement_date);    action VARCHAR(100) NOT NULL,

CREATE INDEX IF NOT EXISTS idx_movements_reference ON public.drug_movements(reference_number);    table_name VARCHAR(50),

    record_id UUID,

-- =====================================================    old_values JSONB,

-- جدول تنظیمات سیستم    new_values JSONB,

-- =====================================================    ip_address INET,

CREATE TABLE IF NOT EXISTS public.system_settings (    user_agent TEXT,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    setting_key VARCHAR(100) UNIQUE NOT NULL,);

    setting_value TEXT,

    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),-- ایندکس برای بهبود عملکرد

    description TEXT,CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLCREATE INDEX IF NOT EXISTS idx_activity_logs_table_name ON public.activity_logs(table_name);

);CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);



-- =====================================================-- =====================================================

-- جدول لاگ فعالیت‌ها-- Foreign Key برای users.warehouse_id

-- =====================================================-- =====================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (ALTER TABLE public.users ADD CONSTRAINT fk_users_warehouse_id 

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);

    user_id UUID REFERENCES public.users(id),

    action VARCHAR(100) NOT NULL,-- =====================================================

    table_name VARCHAR(50),-- توابع Trigger برای به‌روزرسانی automatic timestamps

    record_id UUID,-- =====================================================

    old_values JSONB,CREATE OR REPLACE FUNCTION public.update_updated_at_column()

    new_values JSONB,RETURNS TRIGGER AS $$

    ip_address INET,BEGIN

    user_agent TEXT,    NEW.updated_at = timezone('utc'::text, now());

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    RETURN NEW;

);END;

$$ language 'plpgsql';

-- ایندکس برای بهبود عملکرد

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);-- اعمال trigger به جداول

CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users

CREATE INDEX IF NOT EXISTS idx_activity_logs_table_name ON public.activity_logs(table_name);    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses

-- =====================================================    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Foreign Key برای users.warehouse_id

-- =====================================================CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs

ALTER TABLE public.users ADD CONSTRAINT fk_users_warehouse_id     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.warehouse_inventory

-- =====================================================    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- توابع Trigger برای به‌روزرسانی automatic timestamps

-- =====================================================CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.system_settings

CREATE OR REPLACE FUNCTION public.update_updated_at_column()    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

RETURNS TRIGGER AS $$

BEGIN-- =====================================================

    NEW.updated_at = timezone('utc'::text, now());-- Views برای گزارش‌گیری

    RETURN NEW;-- =====================================================

END;

$$ language 'plpgsql';-- نمای موجودی کامل

CREATE OR REPLACE VIEW public.inventory_view AS

-- اعمال trigger به جداولSELECT 

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users    wi.id,

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    w.name as warehouse_name,

    d.name as drug_name,

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses    d.generic_name,

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    d.dosage,

    d.form,

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs    wi.batch_number,

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    wi.quantity,

    wi.unit_cost,

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.warehouse_inventory    wi.manufacture_date,

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    wi.expire_date,

    CASE 

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.system_settings        WHEN wi.expire_date < CURRENT_DATE THEN 'expired'

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'

        ELSE 'active'

-- =====================================================    END as status,

-- Views برای گزارش‌گیری    wi.entry_date,

-- =====================================================    wi.last_updated

FROM public.warehouse_inventory wi

-- نمای موجودی کاملJOIN public.warehouses w ON wi.warehouse_id = w.id

CREATE OR REPLACE VIEW public.inventory_view ASJOIN public.drugs d ON wi.drug_id = d.id

SELECT WHERE w.active = true AND d.active = true;

    wi.id,

    w.name as warehouse_name,-- نمای انتقالات کامل

    d.name as drug_name,CREATE OR REPLACE VIEW public.movements_view AS

    d.generic_name,SELECT 

    d.dosage,    dm.id,

    d.form,    d.name as drug_name,

    wi.batch_number,    fw.name as from_warehouse,

    wi.quantity,    tw.name as to_warehouse,

    wi.unit_cost,    dm.batch_number,

    wi.manufacture_date,    dm.quantity,

    wi.expire_date,    dm.movement_type,

    CASE     dm.status,

        WHEN wi.expire_date < CURRENT_DATE THEN 'expired'    dm.reference_number,

        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'    dm.notes,

        ELSE 'active'    cu.name as created_by_name,

    END as status,    au.name as approved_by_name,

    wi.entry_date,    dm.movement_date,

    wi.last_updated    dm.completed_date,

FROM public.warehouse_inventory wi    dm.created_at

JOIN public.warehouses w ON wi.warehouse_id = w.idFROM public.drug_movements dm

JOIN public.drugs d ON wi.drug_id = d.idJOIN public.drugs d ON dm.drug_id = d.id

WHERE w.active = true AND d.active = true;LEFT JOIN public.warehouses fw ON dm.from_warehouse_id = fw.id

LEFT JOIN public.warehouses tw ON dm.to_warehouse_id = tw.id

-- نمای انتقالات کاملLEFT JOIN public.users cu ON dm.created_by = cu.id

CREATE OR REPLACE VIEW public.movements_view ASLEFT JOIN public.users au ON dm.approved_by = au.id;

SELECT 

    dm.id,-- =====================================================

    d.name as drug_name,-- داده‌های نمونه

    fw.name as from_warehouse,-- =====================================================

    tw.name as to_warehouse,

    dm.batch_number,-- دسته‌بندی داروها

    dm.quantity,INSERT INTO public.drug_categories (name, description) VALUES

    dm.movement_type,('ضد درد', 'داروهای مسکن و ضد التهاب'),

    dm.status,('آنتی‌بیوتیک', 'داروهای ضد عفونی'),

    dm.reference_number,('ویتامین', 'مکمل‌های ویتامین و مواد معدنی'),

    dm.notes,('قلبی عروقی', 'داروهای مربوط به قلب و عروق'),

    cu.name as created_by_name,('گوارشی', 'داروهای مربوط به دستگاه گوارش')

    au.name as approved_by_name,ON CONFLICT DO NOTHING;

    dm.movement_date,

    dm.completed_date,-- انبارهای نمونه

    dm.created_atINSERT INTO public.warehouses (name, description, location, manager_name, capacity) VALUES

FROM public.drug_movements dm('انبار مرکزی', 'انبار اصلی شرکت', 'تهران، میدان ولیعصر', 'علی احمدی', 2000),

JOIN public.drugs d ON dm.drug_id = d.id('انبار شعبه شرق', 'انبار منطقه شرقی', 'تهران، نارمک', 'فاطمه محمدی', 800),

LEFT JOIN public.warehouses fw ON dm.from_warehouse_id = fw.id('انبار شعبه غرب', 'انبار منطقه غربی', 'تهران، اکباتان', 'محمد رضایی', 600),

LEFT JOIN public.warehouses tw ON dm.to_warehouse_id = tw.id('انبار شعبه شمال', 'انبار منطقه شمالی', 'تهران، تجریش', 'زهرا کریمی', 500)

LEFT JOIN public.users cu ON dm.created_by = cu.idON CONFLICT DO NOTHING;

LEFT JOIN public.users au ON dm.approved_by = au.id;

-- کاربران نمونه

-- =====================================================INSERT INTO public.users (username, name, role, active) VALUES

-- داده‌های نمونه('superadmin', 'سوپر ادمین', 'superadmin', true),

-- =====================================================('admin1', 'مدیر کل', 'admin', true),

('manager1', 'علی احمدی', 'manager', true),

-- دسته‌بندی داروها('operator1', 'فاطمه محمدی', 'operator', true),

INSERT INTO public.drug_categories (name, description) VALUES('operator2', 'محمد رضایی', 'operator', true)

('ضد درد', 'داروهای مسکن و ضد التهاب'),ON CONFLICT (username) DO NOTHING;

('آنتی‌بیوتیک', 'داروهای ضد عفونی'),

('ویتامین', 'مکمل‌های ویتامین و مواد معدنی'),-- تنظیمات سیستم

('قلبی عروقی', 'داروهای مربوط به قلب و عروق'),INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES

('گوارشی', 'داروهای مربوط به دستگاه گوارش')('app_name', 'سیستم انبارداری دارو', 'string', 'نام برنامه'),

ON CONFLICT DO NOTHING;('version', '1.0.0', 'string', 'نسخه برنامه'),

('developer', 'علیرضا حامد', 'string', 'توسعه‌دهنده'),

-- انبارهای نمونه('development_year', 'پاییز 1404', 'string', 'زمان توسعه'),

INSERT INTO public.warehouses (name, description, location, manager_name, capacity) VALUES('session_timeout', '1800', 'number', 'مدت زمان نشست به ثانیه'),

('انبار مرکزی', 'انبار اصلی شرکت', 'تهران، میدان ولیعصر', 'علی احمدی', 2000),('max_file_size', '5242880', 'number', 'حداکثر اندازه فایل آپلود (5MB)'),

('انبار شعبه شرق', 'انبار منطقه شرقی', 'تهران، نارمک', 'فاطمه محمدی', 800),('enable_notifications', 'true', 'boolean', 'فعال‌سازی اعلان‌ها'),

('انبار شعبه غرب', 'انبار منطقه غربی', 'تهران، اکباتان', 'محمد رضایی', 600),('backup_frequency', 'daily', 'string', 'فرکانس پشتیبان‌گیری')

('انبار شعبه شمال', 'انبار منطقه شمالی', 'تهران، تجریش', 'زهرا کریمی', 500)ON CONFLICT (setting_key) DO UPDATE SET 

ON CONFLICT DO NOTHING;    setting_value = EXCLUDED.setting_value,

    updated_at = timezone('utc'::text, now());

-- کاربران نمونه

INSERT INTO public.users (username, name, role, active) VALUES-- =====================================================

('superadmin', 'سوپر ادمین', 'superadmin', true),-- تکمیل اسکریپت

('admin1', 'مدیر کل', 'admin', true),-- =====================================================

('manager1', 'علی احمدی', 'manager', true),-- این اسکریپت آماده اجرا در Supabase SQL Editor است
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