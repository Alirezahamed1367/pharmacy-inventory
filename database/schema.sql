-- =====================================================-- =====================================================-- 🏥 سیستم مدیریت انبار داروخانه - Production Schema-- 🏥 سیستم مدیریت انبار داروخانه - Schema نهایی-- 🏥 سیستم مدیریت انبار داروخانه - Schema نهایی-- =====================================================

-- Pharmacy Inventory Management System Database Schema

-- طراحی و توسعه توسط علیرضا حامد - پاییز 1404-- Pharmacy Inventory Management System Database Schema

-- =====================================================

-- طراحی و توسعه توسط علیرضا حامد - پاییز 1404-- =====================================================

-- حذف جداول موجود برای شروع از صفر

DROP TABLE IF EXISTS public.activity_logs CASCADE;-- =====================================================

DROP TABLE IF EXISTS public.system_settings CASCADE;

DROP TABLE IF EXISTS public.drug_movements CASCADE;-- 👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404-- =====================================================

DROP TABLE IF EXISTS public.warehouse_inventory CASCADE;

DROP TABLE IF EXISTS public.drugs CASCADE;-- حذف جداول موجود برای شروع از صفر

DROP TABLE IF EXISTS public.warehouses CASCADE;

DROP TABLE IF EXISTS public.users CASCADE;DROP TABLE IF EXISTS public.activity_logs CASCADE;-- 📧 Email: alireza.h67@gmail.com

DROP TABLE IF EXISTS public.drug_categories CASCADE;

DROP TABLE IF EXISTS public.system_settings CASCADE;

-- حذف ویوهای موجود

DROP VIEW IF EXISTS public.inventory_view CASCADE;DROP TABLE IF EXISTS public.drug_movements CASCADE;-- 🎯 نسخه: Production Ready v1.0-- 👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404-- =====================================================-- سیستم انبارداری دارو - اسکریپت دیتابیس (نسخه نهایی و صحیح)

DROP VIEW IF EXISTS public.movements_view CASCADE;

DROP TABLE IF EXISTS public.warehouse_inventory CASCADE;

-- =====================================================

-- جدول دسته‌بندی داروهاDROP TABLE IF EXISTS public.drugs CASCADE;-- =====================================================

-- =====================================================

CREATE TABLE public.drug_categories (DROP TABLE IF EXISTS public.warehouses CASCADE;

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name VARCHAR(100) NOT NULL,DROP TABLE IF EXISTS public.users CASCADE;-- 📧 Email: alireza.h67@gmail.com

    description TEXT,

    active BOOLEAN DEFAULT true,DROP TABLE IF EXISTS public.drug_categories CASCADE;

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL-- حذف جداول موجود

);

-- حذف ویوهای موجود

-- ایندکس برای جستجوی سریع

CREATE INDEX idx_drug_categories_name ON public.drug_categories(name);DROP VIEW IF EXISTS public.inventory_view CASCADE;DROP TABLE IF EXISTS public.activity_logs CASCADE;-- 🎯 نسخه: Production Ready v1.0-- 👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404-- طراحی و توسعه: علیرضا حامد - پاییز 1404

CREATE INDEX idx_drug_categories_active ON public.drug_categories(active);

DROP VIEW IF EXISTS public.movements_view CASCADE;

-- =====================================================

-- جدول کاربرانDROP TABLE IF EXISTS public.drug_movements CASCADE;

-- =====================================================

CREATE TABLE public.users (-- =====================================================

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,-- جدول دسته‌بندی داروهاDROP TABLE IF EXISTS public.warehouse_inventory CASCADE;-- =====================================================

    password VARCHAR(255) NOT NULL,

    full_name VARCHAR(100) NOT NULL,-- =====================================================

    email VARCHAR(100),

    phone VARCHAR(20),CREATE TABLE public.drug_categories (DROP TABLE IF EXISTS public.drugs CASCADE;

    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'manager', 'user')),

    active BOOLEAN DEFAULT true,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    last_login TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    name VARCHAR(100) NOT NULL,DROP TABLE IF EXISTS public.drug_categories CASCADE;-- 📧 Email: alireza.h67@gmail.com-- =====================================================

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);    description TEXT,



-- ایندکس‌ها    active BOOLEAN DEFAULT true,DROP TABLE IF EXISTS public.system_settings CASCADE;

CREATE INDEX idx_users_username ON public.users(username);

CREATE INDEX idx_users_role ON public.users(role);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

CREATE INDEX idx_users_active ON public.users(active);

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLDROP TABLE IF EXISTS public.users CASCADE;-- پاک کردن جداول موجود برای شروع از صفر

-- =====================================================

-- جدول انبارها);

-- =====================================================

CREATE TABLE public.warehouses (DROP TABLE IF EXISTS public.warehouses CASCADE;

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name VARCHAR(100) NOT NULL,-- ایندکس برای جستجوی سریع

    description TEXT,

    address TEXT,CREATE INDEX idx_drug_categories_name ON public.drug_categories(name);DROP TABLE IF EXISTS public.activity_logs CASCADE;-- 🎯 نسخه: Production Ready

    phone VARCHAR(20),

    manager_id UUID REFERENCES public.users(id),CREATE INDEX idx_drug_categories_active ON public.drug_categories(active);

    capacity INTEGER DEFAULT 1000,

    active BOOLEAN DEFAULT true,-- =====================================================

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL-- =====================================================

);

-- جدول کاربران-- =====================================================

-- ایندکس‌ها

CREATE INDEX idx_warehouses_name ON public.warehouses(name);-- =====================================================-- Pharmacy Inventory Management System Database Schema

CREATE INDEX idx_warehouses_manager ON public.warehouses(manager_id);

CREATE INDEX idx_warehouses_active ON public.warehouses(active);CREATE TABLE public.users (-- طراحی و توسعه توسط علیرضا حامد - پاییز 1404



-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,-- =====================================================

-- جدول داروها

-- =====================================================    username VARCHAR(50) UNIQUE NOT NULL,

CREATE TABLE public.drugs (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    password VARCHAR(255) NOT NULL,-- حذف جداول موجود برای شروع از صفر

    name VARCHAR(200) NOT NULL,

    generic_name VARCHAR(200),    full_name VARCHAR(100) NOT NULL,DROP TABLE IF EXISTS public.activity_logs CASCADE;

    description TEXT,

    dosage VARCHAR(100),    email VARCHAR(100),DROP TABLE IF EXISTS public.system_settings CASCADE;

    form VARCHAR(50),

    manufacturer VARCHAR(100),    phone VARCHAR(20),DROP TABLE IF EXISTS public.drug_movements CASCADE;

    category_id UUID REFERENCES public.drug_categories(id),

    features TEXT,    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'manager', 'user')),DROP TABLE IF EXISTS public.warehouse_inventory CASCADE;

    image_url TEXT,

    barcode VARCHAR(100),    active BOOLEAN DEFAULT true,DROP TABLE IF EXISTS public.drugs CASCADE;

    min_stock_level INTEGER DEFAULT 0,

    max_stock_level INTEGER DEFAULT 1000,    last_login TIMESTAMP WITH TIME ZONE,DROP TABLE IF EXISTS public.warehouses CASCADE;

    unit_price DECIMAL(10,2) DEFAULT 0,

    active BOOLEAN DEFAULT true,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,DROP TABLE IF EXISTS public.users CASCADE;

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLDROP TABLE IF EXISTS public.drug_categories CASCADE;

);

);

-- ایندکس‌ها

CREATE INDEX idx_drugs_name ON public.drugs(name);-- حذف ویوهای موجود

CREATE INDEX idx_drugs_generic_name ON public.drugs(generic_name);

CREATE INDEX idx_drugs_category ON public.drugs(category_id);-- ایندکس‌هاDROP VIEW IF EXISTS public.inventory_view CASCADE;

CREATE INDEX idx_drugs_barcode ON public.drugs(barcode);

CREATE INDEX idx_drugs_active ON public.drugs(active);CREATE INDEX idx_users_username ON public.users(username);DROP VIEW IF EXISTS public.movements_view CASCADE;



-- =====================================================CREATE INDEX idx_users_role ON public.users(role);

-- جدول موجودی انبار

-- =====================================================CREATE INDEX idx_users_active ON public.users(active);-- =====================================================

CREATE TABLE public.warehouse_inventory (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,-- جدول دسته‌بندی داروها

    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,

    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,-- =====================================================-- =====================================================

    batch_number VARCHAR(100),

    quantity INTEGER DEFAULT 0,-- جدول انبارهاCREATE TABLE public.drug_categories (

    unit_cost DECIMAL(10,2) DEFAULT 0,

    manufacture_date DATE,-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    expire_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,CREATE TABLE public.warehouses (    name VARCHAR(100) NOT NULL,

    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    description TEXT,

    UNIQUE(warehouse_id, drug_id, batch_number)

);    name VARCHAR(100) NOT NULL,    active BOOLEAN DEFAULT true,



-- ایندکس‌ها    description TEXT,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

CREATE INDEX idx_warehouse_inventory_warehouse ON public.warehouse_inventory(warehouse_id);

CREATE INDEX idx_warehouse_inventory_drug ON public.warehouse_inventory(drug_id);    address TEXT,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

CREATE INDEX idx_warehouse_inventory_expire ON public.warehouse_inventory(expire_date);

CREATE INDEX idx_warehouse_inventory_batch ON public.warehouse_inventory(batch_number);    phone VARCHAR(20),);



-- =====================================================    manager_id UUID REFERENCES public.users(id),

-- جدول حرکات دارو

-- =====================================================    capacity INTEGER DEFAULT 1000,-- ایندکس برای جستجوی سریع

CREATE TABLE public.drug_movements (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    active BOOLEAN DEFAULT true,CREATE INDEX idx_drug_categories_name ON public.drug_categories(name);

    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,

    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,CREATE INDEX idx_drug_categories_active ON public.drug_categories(active);

    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment')),

    quantity INTEGER NOT NULL,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    unit_cost DECIMAL(10,2),

    batch_number VARCHAR(100),);-- =====================================================

    expire_date DATE,

    from_warehouse_id UUID REFERENCES public.warehouses(id),-- جدول کاربران

    to_warehouse_id UUID REFERENCES public.warehouses(id),

    user_id UUID REFERENCES public.users(id),-- ایندکس‌ها-- =====================================================

    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLCREATE INDEX idx_warehouses_name ON public.warehouses(name);CREATE TABLE public.users (

);

CREATE INDEX idx_warehouses_manager ON public.warehouses(manager_id);    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- ایندکس‌ها

CREATE INDEX idx_drug_movements_drug ON public.drug_movements(drug_id);CREATE INDEX idx_warehouses_active ON public.warehouses(active);    username VARCHAR(50) UNIQUE NOT NULL,

CREATE INDEX idx_drug_movements_warehouse ON public.drug_movements(warehouse_id);

CREATE INDEX idx_drug_movements_type ON public.drug_movements(movement_type);    password VARCHAR(255) NOT NULL,

CREATE INDEX idx_drug_movements_date ON public.drug_movements(created_at);

-- =====================================================    full_name VARCHAR(100) NOT NULL,

-- =====================================================

-- جدول تنظیمات سیستم-- جدول داروها    email VARCHAR(100),

-- =====================================================

CREATE TABLE public.system_settings (-- =====================================================    phone VARCHAR(20),

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    setting_key VARCHAR(100) UNIQUE NOT NULL,CREATE TABLE public.drugs (    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'manager', 'user')),

    setting_value TEXT,

    description TEXT,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    active BOOLEAN DEFAULT true,

    updated_by UUID REFERENCES public.users(id),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    name VARCHAR(200) NOT NULL,    last_login TIMESTAMP WITH TIME ZONE,

);

    generic_name VARCHAR(200),    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

-- =====================================================

-- جدول گزارش فعالیت‌ها    description TEXT,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

-- =====================================================

CREATE TABLE public.activity_logs (    dosage VARCHAR(100),);

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID REFERENCES public.users(id),    form VARCHAR(50),

    action VARCHAR(100) NOT NULL,

    table_name VARCHAR(50),    manufacturer VARCHAR(100),-- ایندکس‌ها

    record_id UUID,

    old_data JSONB,    category_id UUID REFERENCES public.drug_categories(id),CREATE INDEX idx_users_username ON public.users(username);

    new_data JSONB,

    ip_address INET,    features TEXT,CREATE INDEX idx_users_role ON public.users(role);

    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    image_url TEXT,CREATE INDEX idx_users_active ON public.users(active);

);

    barcode VARCHAR(100),

-- ایندکس‌ها

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);    min_stock_level INTEGER DEFAULT 0,-- =====================================================

CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);

CREATE INDEX idx_activity_logs_date ON public.activity_logs(created_at);    max_stock_level INTEGER DEFAULT 1000,-- جدول انبارها



-- =====================================================    unit_price DECIMAL(10,2) DEFAULT 0,-- =====================================================

-- ویوها برای گزارش‌گیری

-- =====================================================    active BOOLEAN DEFAULT true,CREATE TABLE public.warehouses (



-- ویو موجودی کامل    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

CREATE VIEW public.inventory_view AS

SELECT     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    name VARCHAR(100) NOT NULL,

    wi.id,

    d.id as drug_id,);    description TEXT,

    d.name as drug_name,

    d.generic_name,    address TEXT,

    d.form,

    d.dosage,-- ایندکس‌ها    phone VARCHAR(20),

    d.manufacturer,

    dc.name as category_name,CREATE INDEX idx_drugs_name ON public.drugs(name);    manager_id UUID REFERENCES public.users(id),

    w.id as warehouse_id,

    w.name as warehouse_name,CREATE INDEX idx_drugs_generic_name ON public.drugs(generic_name);    capacity INTEGER DEFAULT 1000,

    wi.batch_number,

    wi.quantity,CREATE INDEX idx_drugs_category ON public.drugs(category_id);    active BOOLEAN DEFAULT true,

    wi.unit_cost,

    wi.manufacture_date,CREATE INDEX idx_drugs_barcode ON public.drugs(barcode);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    wi.expire_date,

    d.min_stock_level,CREATE INDEX idx_drugs_active ON public.drugs(active);    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    d.max_stock_level,

    CASE );

        WHEN wi.expire_date <= CURRENT_DATE THEN 'expired'

        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'expiring'-- =====================================================

        ELSE 'valid'

    END as expiry_status,-- جدول موجودی انبار-- ایندکس‌ها

    wi.created_at,

    wi.last_updated-- =====================================================CREATE INDEX idx_warehouses_name ON public.warehouses(name);

FROM public.warehouse_inventory wi

JOIN public.drugs d ON wi.drug_id = d.idCREATE TABLE public.warehouse_inventory (CREATE INDEX idx_warehouses_manager ON public.warehouses(manager_id);

JOIN public.warehouses w ON wi.warehouse_id = w.id

LEFT JOIN public.drug_categories dc ON d.category_id = dc.id    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,CREATE INDEX idx_warehouses_active ON public.warehouses(active);

WHERE d.active = true AND w.active = true;

    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,

-- ویو حرکات کامل

CREATE VIEW public.movements_view AS    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,-- =====================================================

SELECT 

    dm.id,    batch_number VARCHAR(100),-- جدول داروها

    d.name as drug_name,

    d.generic_name,    quantity INTEGER DEFAULT 0,-- =====================================================

    w.name as warehouse_name,

    dm.movement_type,    unit_cost DECIMAL(10,2) DEFAULT 0,CREATE TABLE public.drugs (

    dm.quantity,

    dm.unit_cost,    manufacture_date DATE,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    dm.batch_number,

    dm.expire_date,    expire_date DATE,    name VARCHAR(200) NOT NULL,

    fw.name as from_warehouse_name,

    tw.name as to_warehouse_name,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    generic_name VARCHAR(200),

    u.full_name as user_name,

    dm.notes,    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    description TEXT,

    dm.created_at

FROM public.drug_movements dm        dosage VARCHAR(100),

JOIN public.drugs d ON dm.drug_id = d.id

JOIN public.warehouses w ON dm.warehouse_id = w.id    UNIQUE(warehouse_id, drug_id, batch_number)    form VARCHAR(50),

LEFT JOIN public.warehouses fw ON dm.from_warehouse_id = fw.id

LEFT JOIN public.warehouses tw ON dm.to_warehouse_id = tw.id);    manufacturer VARCHAR(100),

LEFT JOIN public.users u ON dm.user_id = u.id

ORDER BY dm.created_at DESC;    category_id UUID REFERENCES public.drug_categories(id),



-- =====================================================-- ایندکس‌ها    features TEXT,

-- تریگرها برای بهروزرسانی خودکار

-- =====================================================CREATE INDEX idx_warehouse_inventory_warehouse ON public.warehouse_inventory(warehouse_id);    image_url TEXT,



-- تریگر برای بهروزرسانی updated_atCREATE INDEX idx_warehouse_inventory_drug ON public.warehouse_inventory(drug_id);    barcode VARCHAR(100),

CREATE OR REPLACE FUNCTION update_updated_at_column()

RETURNS TRIGGER AS $$CREATE INDEX idx_warehouse_inventory_expire ON public.warehouse_inventory(expire_date);    min_stock_level INTEGER DEFAULT 0,

BEGIN

    NEW.updated_at = timezone('utc'::text, now());CREATE INDEX idx_warehouse_inventory_batch ON public.warehouse_inventory(batch_number);    max_stock_level INTEGER DEFAULT 1000,

    RETURN NEW;

END;    unit_price DECIMAL(10,2) DEFAULT 0,

$$ language 'plpgsql';

-- =====================================================    active BOOLEAN DEFAULT true,

-- اعمال تریگر به جداول

CREATE TRIGGER update_drug_categories_updated_at BEFORE UPDATE ON public.drug_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- جدول حرکات دارو    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- =====================================================    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.drug_movements ();

-- تریگر برای بهروزرسانی موجودی

CREATE OR REPLACE FUNCTION update_inventory_timestamp()    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

RETURNS TRIGGER AS $$

BEGIN    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,-- ایندکس‌ها

    NEW.last_updated = timezone('utc'::text, now());

    RETURN NEW;    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,CREATE INDEX idx_drugs_name ON public.drugs(name);

END;

$$ language 'plpgsql';    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment')),CREATE INDEX idx_drugs_generic_name ON public.drugs(generic_name);



CREATE TRIGGER update_warehouse_inventory_timestamp BEFORE UPDATE ON public.warehouse_inventory FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();    quantity INTEGER NOT NULL,CREATE INDEX idx_drugs_category ON public.drugs(category_id);



-- =====================================================    unit_cost DECIMAL(10,2),CREATE INDEX idx_drugs_barcode ON public.drugs(barcode);

-- داده‌های اولیه ضروری

-- =====================================================    batch_number VARCHAR(100),CREATE INDEX idx_drugs_active ON public.drugs(active);



-- دسته‌بندی‌های پایه    expire_date DATE,

INSERT INTO public.drug_categories (name, description) VALUES

('عمومی', 'داروهای عمومی'),    from_warehouse_id UUID REFERENCES public.warehouses(id),-- =====================================================

('آنتی‌بیوتیک', 'داروهای ضد عفونی'),

('ضد درد', 'داروهای تسکین درد'),    to_warehouse_id UUID REFERENCES public.warehouses(id),-- جدول موجودی انبار

('قلبی و عروقی', 'داروهای مربوط به قلب و عروق'),

('گوارشی', 'داروهای مربوط به دستگاه گوارش'),    user_id UUID REFERENCES public.users(id),-- =====================================================

('تنفسی', 'داروهای مربوط به دستگاه تنفسی'),

('هورمونی', 'داروهای هورمونی'),    notes TEXT,CREATE TABLE public.warehouse_inventory (

('ویتامین و مکمل', 'ویتامین‌ها و مکمل‌های غذایی');

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- کاربر سوپر ادمین پیش‌فرض

INSERT INTO public.users (username, password, full_name, role) VALUES);    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,

('superadmin', 'A25893Aa', 'مدیر کل سیستم', 'superadmin'),

('admin', 'admin123', 'مدیر سیستم', 'admin');    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,



-- انبار پیش‌فرض-- ایندکس‌ها    batch_number VARCHAR(100),

INSERT INTO public.warehouses (name, description, address) VALUES

('انبار مرکزی', 'انبار اصلی داروخانه', 'آدرس انبار مرکزی'),CREATE INDEX idx_drug_movements_drug ON public.drug_movements(drug_id);    quantity INTEGER DEFAULT 0,

('انبار فرعی', 'انبار کمکی', 'آدرس انبار فرعی');

CREATE INDEX idx_drug_movements_warehouse ON public.drug_movements(warehouse_id);    unit_cost DECIMAL(10,2) DEFAULT 0,

-- تنظیمات پیش‌فرض سیستم

INSERT INTO public.system_settings (setting_key, setting_value, description) VALUESCREATE INDEX idx_drug_movements_type ON public.drug_movements(movement_type);    manufacture_date DATE,

('company_name', 'سیستم مدیریت موجودی داروخانه', 'نام شرکت'),

('company_address', 'آدرس شرکت', 'آدرس شرکت'),CREATE INDEX idx_drug_movements_date ON public.drug_movements(created_at);    expire_date DATE,

('company_phone', '021-12345678', 'تلفن شرکت'),

('low_stock_threshold', '10', 'حد آستانه کمبود موجودی'),    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

('expiry_alert_days', '90', 'تعداد روز هشدار انقضا');

-- =====================================================    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

-- =====================================================

-- RLS (Row Level Security) Policies-- جدول تنظیمات سیستم    

-- =====================================================

-- =====================================================    UNIQUE(warehouse_id, drug_id, batch_number)

-- فعال‌سازی RLS برای جداول حساس

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;CREATE TABLE public.system_settings ();

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- Policy برای دسترسی کاربران به اطلاعات خود

CREATE POLICY "Users can view their own data" ON public.users    setting_key VARCHAR(100) UNIQUE NOT NULL,-- ایندکس‌ها

    FOR SELECT USING (auth.uid()::text = id::text OR 

                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));    setting_value TEXT,CREATE INDEX idx_warehouse_inventory_warehouse ON public.warehouse_inventory(warehouse_id);



-- Policy برای دسترسی ادمین‌ها به تمام داده‌ها    description TEXT,CREATE INDEX idx_warehouse_inventory_drug ON public.warehouse_inventory(drug_id);

CREATE POLICY "Admins can manage all users" ON public.users

    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));    updated_by UUID REFERENCES public.users(id),CREATE INDEX idx_warehouse_inventory_expire ON public.warehouse_inventory(expire_date);



-- Policy برای لاگ‌ها    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLCREATE INDEX idx_warehouse_inventory_batch ON public.warehouse_inventory(batch_number);

CREATE POLICY "Users can view relevant logs" ON public.activity_logs

    FOR SELECT USING (user_id::text = auth.uid()::text OR );

                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));

-- =====================================================

-- =====================================================

-- اتمام Schema-- =====================================================-- جدول حرکات دارو

-- =====================================================

-- جدول گزارش فعالیت‌ها-- =====================================================

-- تایید نهایی

SELECT 'Database schema created successfully!' as result;-- =====================================================CREATE TABLE public.drug_movements (

CREATE TABLE public.activity_logs (    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,

    user_id UUID REFERENCES public.users(id),    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,

    action VARCHAR(100) NOT NULL,    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment')),

    table_name VARCHAR(50),    quantity INTEGER NOT NULL,

    record_id UUID,    unit_cost DECIMAL(10,2),

    old_data JSONB,    batch_number VARCHAR(100),

    new_data JSONB,    expire_date DATE,

    ip_address INET,    from_warehouse_id UUID REFERENCES public.warehouses(id),

    user_agent TEXT,    to_warehouse_id UUID REFERENCES public.warehouses(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    user_id UUID REFERENCES public.users(id),

);    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

-- ایندکس‌ها);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);

CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);-- ایندکس‌ها

CREATE INDEX idx_activity_logs_date ON public.activity_logs(created_at);CREATE INDEX idx_drug_movements_drug ON public.drug_movements(drug_id);

CREATE INDEX idx_drug_movements_warehouse ON public.drug_movements(warehouse_id);

-- =====================================================CREATE INDEX idx_drug_movements_type ON public.drug_movements(movement_type);

-- ویوها برای گزارش‌گیریCREATE INDEX idx_drug_movements_date ON public.drug_movements(created_at);

-- =====================================================

-- =====================================================

-- ویو موجودی کامل-- جدول تنظیمات سیستم

CREATE VIEW public.inventory_view AS-- =====================================================

SELECT CREATE TABLE public.system_settings (

    wi.id,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    d.id as drug_id,    setting_key VARCHAR(100) UNIQUE NOT NULL,

    d.name as drug_name,    setting_value TEXT,

    d.generic_name,    description TEXT,

    d.form,    updated_by UUID REFERENCES public.users(id),

    d.dosage,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    d.manufacturer,);

    dc.name as category_name,

    w.id as warehouse_id,-- =====================================================

    w.name as warehouse_name,-- جدول گزارش فعالیت‌ها

    wi.batch_number,-- =====================================================

    wi.quantity,CREATE TABLE public.activity_logs (

    wi.unit_cost,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    wi.manufacture_date,    user_id UUID REFERENCES public.users(id),

    wi.expire_date,    action VARCHAR(100) NOT NULL,

    d.min_stock_level,    table_name VARCHAR(50),

    d.max_stock_level,    record_id UUID,

    CASE     old_data JSONB,

        WHEN wi.expire_date <= CURRENT_DATE THEN 'expired'    new_data JSONB,

        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'expiring'    ip_address INET,

        ELSE 'valid'    user_agent TEXT,

    END as expiry_status,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    wi.created_at,);

    wi.last_updated

FROM public.warehouse_inventory wi-- ایندکس‌ها

JOIN public.drugs d ON wi.drug_id = d.idCREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);

JOIN public.warehouses w ON wi.warehouse_id = w.idCREATE INDEX idx_activity_logs_action ON public.activity_logs(action);

LEFT JOIN public.drug_categories dc ON d.category_id = dc.idCREATE INDEX idx_activity_logs_date ON public.activity_logs(created_at);

WHERE d.active = true AND w.active = true;

-- =====================================================

-- ویو حرکات کامل-- ویوها برای گزارش‌گیری

CREATE VIEW public.movements_view AS-- =====================================================

SELECT 

    dm.id,-- ویو موجودی کامل

    d.name as drug_name,CREATE VIEW public.inventory_view AS

    d.generic_name,SELECT 

    w.name as warehouse_name,    wi.id,

    dm.movement_type,    d.id as drug_id,

    dm.quantity,    d.name as drug_name,

    dm.unit_cost,    d.generic_name,

    dm.batch_number,    d.form,

    dm.expire_date,    d.dosage,

    fw.name as from_warehouse_name,    d.manufacturer,

    tw.name as to_warehouse_name,    dc.name as category_name,

    u.full_name as user_name,    w.id as warehouse_id,

    dm.notes,    w.name as warehouse_name,

    dm.created_at    wi.batch_number,

FROM public.drug_movements dm    wi.quantity,

JOIN public.drugs d ON dm.drug_id = d.id    wi.unit_cost,

JOIN public.warehouses w ON dm.warehouse_id = w.id    wi.manufacture_date,

LEFT JOIN public.warehouses fw ON dm.from_warehouse_id = fw.id    wi.expire_date,

LEFT JOIN public.warehouses tw ON dm.to_warehouse_id = tw.id    d.min_stock_level,

LEFT JOIN public.users u ON dm.user_id = u.id    d.max_stock_level,

ORDER BY dm.created_at DESC;    CASE 

        WHEN wi.expire_date <= CURRENT_DATE THEN 'expired'

-- =====================================================        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'expiring'

-- تریگرها برای بهروزرسانی خودکار        ELSE 'valid'

-- =====================================================    END as expiry_status,

    wi.created_at,

-- تریگر برای بهروزرسانی updated_at    wi.last_updated

CREATE OR REPLACE FUNCTION update_updated_at_column()FROM public.warehouse_inventory wi

RETURNS TRIGGER AS $$JOIN public.drugs d ON wi.drug_id = d.id

BEGINJOIN public.warehouses w ON wi.warehouse_id = w.id

    NEW.updated_at = timezone('utc'::text, now());LEFT JOIN public.drug_categories dc ON d.category_id = dc.id

    RETURN NEW;WHERE d.active = true AND w.active = true;

END;

$$ language 'plpgsql';-- ویو حرکات کامل

CREATE VIEW public.movements_view AS

-- اعمال تریگر به جداولSELECT 

CREATE TRIGGER update_drug_categories_updated_at BEFORE UPDATE ON public.drug_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    dm.id,

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    d.name as drug_name,

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    d.generic_name,

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    w.name as warehouse_name,

    dm.movement_type,

-- تریگر برای بهروزرسانی موجودی    dm.quantity,

CREATE OR REPLACE FUNCTION update_inventory_timestamp()    dm.unit_cost,

RETURNS TRIGGER AS $$    dm.batch_number,

BEGIN    dm.expire_date,

    NEW.last_updated = timezone('utc'::text, now());    fw.name as from_warehouse_name,

    RETURN NEW;    tw.name as to_warehouse_name,

END;    u.full_name as user_name,

$$ language 'plpgsql';    dm.notes,

    dm.created_at

CREATE TRIGGER update_warehouse_inventory_timestamp BEFORE UPDATE ON public.warehouse_inventory FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();FROM public.drug_movements dm

JOIN public.drugs d ON dm.drug_id = d.id

-- =====================================================JOIN public.warehouses w ON dm.warehouse_id = w.id

-- داده‌های اولیه ضروریLEFT JOIN public.warehouses fw ON dm.from_warehouse_id = fw.id

-- =====================================================LEFT JOIN public.warehouses tw ON dm.to_warehouse_id = tw.id

LEFT JOIN public.users u ON dm.user_id = u.id

-- دسته‌بندی‌های پایهORDER BY dm.created_at DESC;

INSERT INTO public.drug_categories (name, description) VALUES

('عمومی', 'داروهای عمومی'),-- =====================================================

('آنتی‌بیوتیک', 'داروهای ضد عفونی'),-- تریگرها برای بهروزرسانی خودکار

('ضد درد', 'داروهای تسکین درد'),-- =====================================================

('قلبی و عروقی', 'داروهای مربوط به قلب و عروق'),

('گوارشی', 'داروهای مربوط به دستگاه گوارش'),-- تریگر برای بهروزرسانی updated_at

('تنفسی', 'داروهای مربوط به دستگاه تنفسی'),CREATE OR REPLACE FUNCTION update_updated_at_column()

('هورمونی', 'داروهای هورمونی'),RETURNS TRIGGER AS $$

('ویتامین و مکمل', 'ویتامین‌ها و مکمل‌های غذایی');BEGIN

    NEW.updated_at = timezone('utc'::text, now());

-- کاربر سوپر ادمین پیش‌فرض    RETURN NEW;

INSERT INTO public.users (username, password, full_name, role) VALUESEND;

('superadmin', 'A25893Aa', 'مدیر کل سیستم', 'superadmin'),$$ language 'plpgsql';

('admin', 'admin123', 'مدیر سیستم', 'admin');

-- اعمال تریگر به جداول

-- انبار پیش‌فرضCREATE TRIGGER update_drug_categories_updated_at BEFORE UPDATE ON public.drug_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO public.warehouses (name, description, address) VALUESCREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

('انبار مرکزی', 'انبار اصلی داروخانه', 'آدرس انبار مرکزی'),CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

('انبار فرعی', 'انبار کمکی', 'آدرس انبار فرعی');CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- تنظیمات پیش‌فرض سیستم-- تریگر برای بهروزرسانی موجودی

INSERT INTO public.system_settings (setting_key, setting_value, description) VALUESCREATE OR REPLACE FUNCTION update_inventory_timestamp()

('company_name', 'سیستم مدیریت موجودی داروخانه', 'نام شرکت'),RETURNS TRIGGER AS $$

('company_address', 'آدرس شرکت', 'آدرس شرکت'),BEGIN

('company_phone', '021-12345678', 'تلفن شرکت'),    NEW.last_updated = timezone('utc'::text, now());

('low_stock_threshold', '10', 'حد آستانه کمبود موجودی'),    RETURN NEW;

('expiry_alert_days', '90', 'تعداد روز هشدار انقضا');END;

$$ language 'plpgsql';

-- =====================================================

-- RLS (Row Level Security) PoliciesCREATE TRIGGER update_warehouse_inventory_timestamp BEFORE UPDATE ON public.warehouse_inventory FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();

-- =====================================================

-- =====================================================

-- فعال‌سازی RLS برای جداول حساس-- داده‌های اولیه ضروری

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;-- =====================================================

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- دسته‌بندی‌های پایه

-- Policy برای دسترسی کاربران به اطلاعات خودINSERT INTO public.drug_categories (name, description) VALUES

CREATE POLICY "Users can view their own data" ON public.users('عمومی', 'داروهای عمومی'),

    FOR SELECT USING (auth.uid()::text = id::text OR ('آنتی‌بیوتیک', 'داروهای ضد عفونی'),

                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));('ضد درد', 'داروهای تسکین درد'),

('قلبی و عروقی', 'داروهای مربوط به قلب و عروق'),

-- Policy برای دسترسی ادمین‌ها به تمام داده‌ها('گوارشی', 'داروهای مربوط به دستگاه گوارش'),

CREATE POLICY "Admins can manage all users" ON public.users('تنفسی', 'داروهای مربوط به دستگاه تنفسی'),

    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));('هورمونی', 'داروهای هورمونی'),

('ویتامین و مکمل', 'ویتامین‌ها و مکمل‌های غذایی');

-- Policy برای لاگ‌ها

CREATE POLICY "Users can view relevant logs" ON public.activity_logs-- کاربر سوپر ادمین پیش‌فرض

    FOR SELECT USING (user_id::text = auth.uid()::text OR INSERT INTO public.users (username, password, full_name, role) VALUES

                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));('superadmin', 'A25893Aa', 'مدیر کل سیستم', 'superadmin'),

('admin', 'admin123', 'مدیر سیستم', 'admin');

-- =====================================================

-- اتمام Schema-- انبار پیش‌فرض

-- =====================================================INSERT INTO public.warehouses (name, description, address) VALUES

('انبار مرکزی', 'انبار اصلی داروخانه', 'آدرس انبار مرکزی'),

-- تایید نهایی('انبار فرعی', 'انبار کمکی', 'آدرس انبار فرعی');

SELECT 'Database schema created successfully!' as result;
-- تنظیمات پیش‌فرض سیستم
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('company_name', 'سیستم مدیریت موجودی داروخانه', 'نام شرکت'),
('company_address', 'آدرس شرکت', 'آدرس شرکت'),
('company_phone', '021-12345678', 'تلفن شرکت'),
('low_stock_threshold', '10', 'حد آستانه کمبود موجودی'),
('expiry_alert_days', '90', 'تعداد روز هشدار انقضا');

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- فعال‌سازی RLS برای جداول حساس
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy برای دسترسی کاربران به اطلاعات خود
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text OR 
                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));

-- Policy برای دسترسی ادمین‌ها به تمام داده‌ها
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));

-- Policy برای لاگ‌ها
CREATE POLICY "Users can view relevant logs" ON public.activity_logs
    FOR SELECT USING (user_id::text = auth.uid()::text OR 
                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')));

-- =====================================================
-- اتمام Schema
-- =====================================================

-- تایید نهایی
SELECT 'Database schema created successfully!' as result;

-- =====================================================

CREATE TABLE public.drug_categories (DROP TABLE IF EXISTS public.warehouse_inventory CASCADE;-- =====================================================-- پاک کردن جداول موجود برای شروع از صفر

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name VARCHAR(100) NOT NULL,DROP TABLE IF EXISTS public.drugs CASCADE;

    description TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLDROP TABLE IF EXISTS public.drug_categories CASCADE;DROP TABLE IF EXISTS public.activity_logs CASCADE;

);

DROP TABLE IF EXISTS public.system_settings CASCADE;

-- =====================================================

-- جدول انبارهاDROP TABLE IF EXISTS public.users CASCADE;-- ===== حذف جداول موجود =====DROP TABLE IF EXISTS public.drug_movements CASCADE;

-- =====================================================

CREATE TABLE public.warehouses (DROP TABLE IF EXISTS public.warehouses CASCADE;

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name VARCHAR(100) NOT NULL,DROP TABLE IF EXISTS notifications CASCADE;DROP TABLE IF EXISTS public.warehouse_inventory CASCADE;

    description TEXT,

    location VARCHAR(200),-- =====================================================

    manager_name VARCHAR(100),

    capacity INTEGER DEFAULT 1000,-- جدول دسته‌بندی داروهاDROP TABLE IF EXISTS transfers CASCADE;DROP TABLE IF EXISTS public.drugs CASCADE;

    current_stock INTEGER DEFAULT 0,

    active BOOLEAN DEFAULT true,-- =====================================================

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLCREATE TABLE public.drug_categories (DROP TABLE IF EXISTS inventory_movements CASCADE;DROP TABLE IF EXISTS public.drug_categories CASCADE;

);

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- =====================================================

-- جدول کاربران    name VARCHAR(100) NOT NULL,DROP TABLE IF EXISTS inventory CASCADE;DROP TABLE IF EXISTS public.system_settings CASCADE;

-- =====================================================

CREATE TABLE public.users (    description TEXT,

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLDROP TABLE IF EXISTS warehouse_inventory CASCADE;DROP TABLE IF EXISTS public.users CASCADE;

    name VARCHAR(100) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'operator',);

    warehouse_id UUID REFERENCES public.warehouses(id),

    active BOOLEAN DEFAULT true,DROP TABLE IF EXISTS drug_movements CASCADE;DROP TABLE IF EXISTS public.warehouses CASCADE;

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL-- =====================================================

);

-- جدول انبارهاDROP TABLE IF EXISTS activity_logs CASCADE;

-- =====================================================

-- جدول داروها-- =====================================================

-- =====================================================

CREATE TABLE public.drugs (CREATE TABLE public.warehouses (DROP TABLE IF EXISTS system_settings CASCADE;-- =====================================================

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name VARCHAR(200) NOT NULL,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    generic_name VARCHAR(200),

    description TEXT,    name VARCHAR(100) NOT NULL,DROP TABLE IF EXISTS drug_categories CASCADE;-- جدول دسته‌بندی داروها

    dosage VARCHAR(100),

    form VARCHAR(50),    description TEXT,

    manufacturer VARCHAR(100),

    category_id UUID REFERENCES public.drug_categories(id),    location VARCHAR(200),DROP TABLE IF EXISTS drugs CASCADE;-- =====================================================

    features TEXT,

    image_url VARCHAR(500),    manager_name VARCHAR(100),

    barcode VARCHAR(100),

    min_stock_level INTEGER DEFAULT 0,    capacity INTEGER DEFAULT 1000 CHECK (capacity > 0),DROP TABLE IF EXISTS warehouses CASCADE;CREATE TABLE public.drug_categories (

    max_stock_level INTEGER DEFAULT 1000,

    unit_price DECIMAL(10,2) DEFAULT 0,    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),

    active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    active BOOLEAN DEFAULT true,DROP TABLE IF EXISTS users CASCADE;    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,



-- =====================================================    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    name VARCHAR(100) NOT NULL,

-- جدول موجودی انبار

-- =====================================================);

CREATE TABLE public.warehouse_inventory (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,-- حذف enum ها    description TEXT,

    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,

    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,-- =====================================================

    batch_number VARCHAR(100),

    quantity INTEGER NOT NULL DEFAULT 0,-- جدول کاربرانDROP TYPE IF EXISTS notification_type CASCADE;    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    unit_cost DECIMAL(10,2) DEFAULT 0,

    manufacture_date DATE,-- =====================================================

    expire_date DATE,

    entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,CREATE TABLE public.users (DROP TYPE IF EXISTS transfer_status CASCADE;);

    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(warehouse_id, drug_id, batch_number)    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

);

    username VARCHAR(50) UNIQUE NOT NULL,DROP TYPE IF EXISTS movement_type CASCADE;

-- =====================================================

-- جدول انتقالات داروها    name VARCHAR(100) NOT NULL,

-- =====================================================

CREATE TABLE public.drug_movements (    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'admin', 'manager', 'operator')),DROP TYPE IF EXISTS user_role CASCADE;-- =====================================================

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    drug_id UUID NOT NULL REFERENCES public.drugs(id),    warehouse_id UUID REFERENCES public.warehouses(id),

    from_warehouse_id UUID REFERENCES public.warehouses(id),

    to_warehouse_id UUID REFERENCES public.warehouses(id),    active BOOLEAN DEFAULT true,-- جدول داروها

    batch_number VARCHAR(100),

    quantity INTEGER NOT NULL,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    movement_type VARCHAR(20) NOT NULL,

    status VARCHAR(20) DEFAULT 'pending',    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL-- =====================================================-- =====================================================

    reference_number VARCHAR(100),

    notes TEXT,);

    created_by UUID REFERENCES public.users(id),

    approved_by UUID REFERENCES public.users(id),-- جدول کاربرانCREATE TABLE public.drugs (

    movement_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    completed_date TIMESTAMP WITH TIME ZONE,-- =====================================================

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);-- جدول داروها-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,



-- =====================================================-- =====================================================

-- جدول تنظیمات سیستم

-- =====================================================CREATE TABLE public.drugs (CREATE TABLE IF NOT EXISTS public.users (    name VARCHAR(200) NOT NULL,

CREATE TABLE public.system_settings (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    setting_key VARCHAR(100) UNIQUE NOT NULL,

    setting_value TEXT,    name VARCHAR(200) NOT NULL,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    generic_name VARCHAR(200),

    setting_type VARCHAR(20) DEFAULT 'string',

    description TEXT,    generic_name VARCHAR(200),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    description TEXT,    username VARCHAR(50) UNIQUE NOT NULL,    description TEXT,

);

    dosage VARCHAR(100),

-- =====================================================

-- جدول لاگ فعالیت‌ها    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول    name VARCHAR(100) NOT NULL,    dosage VARCHAR(100),

-- =====================================================

CREATE TABLE public.activity_logs (    manufacturer VARCHAR(100),

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID REFERENCES public.users(id),    category_id UUID REFERENCES public.drug_categories(id),    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'admin', 'manager', 'operator')),    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول و...

    action VARCHAR(100) NOT NULL,

    table_name VARCHAR(50),    features TEXT,

    record_id UUID,

    old_values JSONB,    image_url VARCHAR(500),    warehouse_id UUID,    manufacturer VARCHAR(100),

    new_values JSONB,

    ip_address INET,    barcode VARCHAR(100),

    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    min_stock_level INTEGER DEFAULT 0,    active BOOLEAN DEFAULT true,    category_id UUID REFERENCES public.drug_categories(id),

);

    max_stock_level INTEGER DEFAULT 1000,

-- =====================================================

-- ایندکس‌ها برای بهبود عملکرد    unit_price DECIMAL(10,2) DEFAULT 0,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    features TEXT,

-- =====================================================

CREATE INDEX idx_users_username ON public.users(username);    active BOOLEAN DEFAULT true,

CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_warehouses_active ON public.warehouses(active);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    image_url VARCHAR(500),

CREATE INDEX idx_drugs_name ON public.drugs(name);

CREATE INDEX idx_drugs_active ON public.drugs(active);    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

CREATE INDEX idx_inventory_warehouse_drug ON public.warehouse_inventory(warehouse_id, drug_id);

CREATE INDEX idx_inventory_expire_date ON public.warehouse_inventory(expire_date);););    barcode VARCHAR(100),

CREATE INDEX idx_movements_drug_id ON public.drug_movements(drug_id);

CREATE INDEX idx_movements_date ON public.drug_movements(movement_date);



-- =====================================================-- =====================================================    min_stock_level INTEGER DEFAULT 0,

-- توابع Trigger

-- =====================================================-- جدول موجودی انبار

CREATE OR REPLACE FUNCTION public.update_updated_at_column()

RETURNS TRIGGER AS $$-- =====================================================-- ایندکس برای بهبود عملکرد    max_stock_level INTEGER DEFAULT 1000,

BEGIN

    NEW.updated_at = timezone('utc'::text, now());CREATE TABLE public.warehouse_inventory (

    RETURN NEW;

END;    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);    unit_price DECIMAL(10,2) DEFAULT 0,

$$ language 'plpgsql';

    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,

-- اعمال triggers

CREATE TRIGGER update_users_updated_at     drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);    active BOOLEAN DEFAULT true,

    BEFORE UPDATE ON public.users 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    batch_number VARCHAR(100),



CREATE TRIGGER update_warehouses_updated_at     quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),CREATE INDEX IF NOT EXISTS idx_users_warehouse_id ON public.users(warehouse_id);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    BEFORE UPDATE ON public.warehouses 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    unit_cost DECIMAL(10,2) DEFAULT 0,



CREATE TRIGGER update_drugs_updated_at     manufacture_date DATE,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    BEFORE UPDATE ON public.drugs 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    expire_date DATE,



CREATE TRIGGER update_inventory_updated_at     entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,-- =====================================================);

    BEFORE UPDATE ON public.warehouse_inventory 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,



CREATE TRIGGER update_settings_updated_at     UNIQUE(warehouse_id, drug_id, batch_number)-- جدول انبارها

    BEFORE UPDATE ON public.system_settings 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(););



-- =====================================================-- =====================================================-- =====================================================

-- Views

-- =====================================================-- =====================================================

CREATE OR REPLACE VIEW public.inventory_summary AS

SELECT -- جدول انتقالات داروهاCREATE TABLE IF NOT EXISTS public.warehouses (-- جدول انبارها

    w.name as warehouse_name,

    d.name as drug_name,-- =====================================================

    d.generic_name,

    wi.quantity,CREATE TABLE public.drug_movements (    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,-- =====================================================

    wi.expire_date,

    CASE     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

        WHEN wi.expire_date < CURRENT_DATE THEN 'expired'

        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'    drug_id UUID NOT NULL REFERENCES public.drugs(id),    name VARCHAR(100) NOT NULL,CREATE TABLE public.warehouses (

        ELSE 'active'

    END as status    from_warehouse_id UUID REFERENCES public.warehouses(id),

FROM public.warehouse_inventory wi

JOIN public.warehouses w ON wi.warehouse_id = w.id    to_warehouse_id UUID REFERENCES public.warehouses(id),    description TEXT,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

JOIN public.drugs d ON wi.drug_id = d.id

WHERE w.active = true AND d.active = true;    batch_number VARCHAR(100),



-- =====================================================    quantity INTEGER NOT NULL CHECK (quantity > 0),    location VARCHAR(200),    name VARCHAR(200) NOT NULL,

-- Row Level Security

-- =====================================================    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('transfer', 'entry', 'exit', 'adjustment', 'expired')),

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),    manager_name VARCHAR(100),    location VARCHAR(300),

ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;    reference_number VARCHAR(100),

ALTER TABLE public.drug_movements ENABLE ROW LEVEL SECURITY;

    notes TEXT,    capacity INTEGER DEFAULT 1000 CHECK (capacity > 0),    manager_name VARCHAR(100),

-- Basic Policies (allow all for now)

CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true);    created_by UUID REFERENCES public.users(id),

CREATE POLICY "Allow all operations" ON public.warehouses FOR ALL USING (true);

CREATE POLICY "Allow all operations" ON public.drugs FOR ALL USING (true);    approved_by UUID REFERENCES public.users(id),    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),    phone VARCHAR(20),

CREATE POLICY "Allow all operations" ON public.warehouse_inventory FOR ALL USING (true);

CREATE POLICY "Allow all operations" ON public.drug_movements FOR ALL USING (true);    movement_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,



-- =====================================================    completed_date TIMESTAMP WITH TIME ZONE,    active BOOLEAN DEFAULT true,    email VARCHAR(100),

-- داده‌های اولیه ضروری

-- =====================================================    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL



-- دسته‌بندی داروها);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    description TEXT,

INSERT INTO public.drug_categories (name, description) VALUES

('ضد درد', 'داروهای مسکن و ضد التهاب'),

('آنتی‌بیوتیک', 'داروهای ضد عفونی'),

('ویتامین', 'مکمل‌های ویتامین و مواد معدنی'),-- =====================================================    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    active BOOLEAN DEFAULT true,

('قلبی عروقی', 'داروهای مربوط به قلب و عروق'),

('گوارشی', 'داروهای مربوط به دستگاه گوارش');-- جدول تنظیمات سیستم



-- انبار پیش‌فرض-- =====================================================);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

INSERT INTO public.warehouses (name, description, location, active) VALUES

('انبار اصلی', 'انبار اصلی داروخانه', 'تهران', true);CREATE TABLE public.system_settings (



-- کاربر پیش‌فرض    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

INSERT INTO public.users (username, name, role, active) VALUES

('admin', 'مدیر سیستم', 'admin', true);    setting_key VARCHAR(100) UNIQUE NOT NULL,



-- تنظیمات پیش‌فرض    setting_value TEXT,-- ایندکس برای بهبود عملکرد);

INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES

('app_name', 'سیستم مدیریت انبار داروخانه', 'string', 'نام برنامه'),    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),

('version', '1.0.0', 'string', 'نسخه برنامه'),

('developer', 'علیرضا حامد', 'string', 'توسعه‌دهنده');    description TEXT,CREATE INDEX IF NOT EXISTS idx_warehouses_name ON public.warehouses(name);



-- =====================================================    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

-- پیام تکمیل

-- =====================================================    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLCREATE INDEX IF NOT EXISTS idx_warehouses_active ON public.warehouses(active);-- =====================================================

SELECT 

    '✅ سیستم مدیریت انبار داروخانه آماده است' as status,);

    '👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404' as developer;
-- جدول کاربران

-- =====================================================

-- جدول لاگ فعالیت‌ها-- =====================================================-- =====================================================

-- =====================================================

CREATE TABLE public.activity_logs (-- جدول دسته‌بندی داروهاCREATE TABLE public.users (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID REFERENCES public.users(id),-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    action VARCHAR(100) NOT NULL,

    table_name VARCHAR(50),CREATE TABLE IF NOT EXISTS public.drug_categories (    username VARCHAR(50) UNIQUE NOT NULL,

    record_id UUID,

    old_values JSONB,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    password VARCHAR(100) NOT NULL,

    new_values JSONB,

    ip_address INET,    name VARCHAR(100) NOT NULL,    full_name VARCHAR(100) NOT NULL,

    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    description TEXT,    email VARCHAR(100),

);

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    phone VARCHAR(20),

-- =====================================================

-- ایندکس‌ها برای بهبود عملکرد);    role VARCHAR(20) NOT NULL DEFAULT 'operator',

-- =====================================================

CREATE INDEX idx_users_username ON public.users(username);    warehouse_id UUID REFERENCES public.warehouses(id),

CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_users_warehouse_id ON public.users(warehouse_id);-- =====================================================    permissions JSONB DEFAULT '{}',

CREATE INDEX idx_warehouses_name ON public.warehouses(name);

CREATE INDEX idx_warehouses_active ON public.warehouses(active);-- جدول داروها    active BOOLEAN DEFAULT true,

CREATE INDEX idx_drugs_name ON public.drugs(name);

CREATE INDEX idx_drugs_barcode ON public.drugs(barcode);-- =====================================================    last_login TIMESTAMP WITH TIME ZONE,

CREATE INDEX idx_drugs_category_id ON public.drugs(category_id);

CREATE INDEX idx_drugs_active ON public.drugs(active);CREATE TABLE IF NOT EXISTS public.drugs (    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

CREATE INDEX idx_inventory_warehouse_id ON public.warehouse_inventory(warehouse_id);

CREATE INDEX idx_inventory_drug_id ON public.warehouse_inventory(drug_id);    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

CREATE INDEX idx_inventory_expire_date ON public.warehouse_inventory(expire_date);

CREATE INDEX idx_movements_drug_id ON public.drug_movements(drug_id);    name VARCHAR(200) NOT NULL,);

CREATE INDEX idx_movements_status ON public.drug_movements(status);

CREATE INDEX idx_movements_date ON public.drug_movements(movement_date);    generic_name VARCHAR(200),

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);    description TEXT,-- =====================================================



-- =====================================================    dosage VARCHAR(100),-- جدول موجودی انبار

-- توابع Trigger برای به‌روزرسانی timestamps

-- =====================================================    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول و...-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()

RETURNS TRIGGER AS $$    manufacturer VARCHAR(100),CREATE TABLE public.warehouse_inventory (

BEGIN

    NEW.updated_at = timezone('utc'::text, now());    category_id UUID REFERENCES public.drug_categories(id),    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    RETURN NEW;

END;    features TEXT,    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,

$$ language 'plpgsql';

    image_url VARCHAR(500),    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,

-- اعمال triggers

CREATE TRIGGER update_users_updated_at     barcode VARCHAR(100),    quantity INTEGER NOT NULL DEFAULT 0,

    BEFORE UPDATE ON public.users 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    min_stock_level INTEGER DEFAULT 0,    expiry_date DATE,



CREATE TRIGGER update_warehouses_updated_at     max_stock_level INTEGER DEFAULT 1000,    batch_number VARCHAR(50),

    BEFORE UPDATE ON public.warehouses 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    unit_price DECIMAL(10,2) DEFAULT 0,    supplier VARCHAR(100),



CREATE TRIGGER update_drugs_updated_at     active BOOLEAN DEFAULT true,    purchase_price DECIMAL(10,2),

    BEFORE UPDATE ON public.drugs 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    purchase_date DATE,



CREATE TRIGGER update_inventory_updated_at     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL    notes TEXT,

    BEFORE UPDATE ON public.warehouse_inventory 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(););    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,



CREATE TRIGGER update_settings_updated_at     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    BEFORE UPDATE ON public.system_settings 

    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();-- ایندکس برای بهبود عملکرد    UNIQUE(drug_id, warehouse_id, batch_number)



-- =====================================================CREATE INDEX IF NOT EXISTS idx_drugs_name ON public.drugs(name););

-- Views برای گزارش‌گیری

-- =====================================================CREATE INDEX IF NOT EXISTS idx_drugs_generic_name ON public.drugs(generic_name);

CREATE OR REPLACE VIEW public.inventory_view AS

SELECT CREATE INDEX IF NOT EXISTS idx_drugs_barcode ON public.drugs(barcode);-- =====================================================

    wi.id,

    w.name as warehouse_name,CREATE INDEX IF NOT EXISTS idx_drugs_category_id ON public.drugs(category_id);-- جدول حرکات داروها

    d.name as drug_name,

    d.generic_name,CREATE INDEX IF NOT EXISTS idx_drugs_active ON public.drugs(active);-- =====================================================

    d.dosage,

    d.form,CREATE TABLE public.drug_movements (

    wi.batch_number,

    wi.quantity,-- =====================================================    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    wi.unit_cost,

    wi.manufacture_date,-- جدول موجودی انبار    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,

    wi.expire_date,

    CASE -- =====================================================    from_warehouse_id UUID REFERENCES public.warehouses(id),

        WHEN wi.expire_date < CURRENT_DATE THEN 'expired'

        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'CREATE TABLE IF NOT EXISTS public.warehouse_inventory (    to_warehouse_id UUID REFERENCES public.warehouses(id),

        ELSE 'active'

    END as status,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,    movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'transfer'

    wi.entry_date,

    wi.last_updated    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,    quantity INTEGER NOT NULL,

FROM public.warehouse_inventory wi

JOIN public.warehouses w ON wi.warehouse_id = w.id    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,    reference_number VARCHAR(100),

JOIN public.drugs d ON wi.drug_id = d.id

WHERE w.active = true AND d.active = true;    batch_number VARCHAR(100),    batch_number VARCHAR(50),



-- =====================================================    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),    expiry_date DATE,

-- Row Level Security

-- =====================================================    unit_cost DECIMAL(10,2) DEFAULT 0,    supplier VARCHAR(100),

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;    manufacture_date DATE,    user_id UUID REFERENCES public.users(id),

ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;    expire_date DATE,    notes TEXT,

ALTER TABLE public.drug_movements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;    entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    status VARCHAR(20) DEFAULT 'completed',



-- Policies    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,    movement_date DATE DEFAULT CURRENT_DATE,

CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can view all warehouses" ON public.warehouses FOR SELECT USING (true);        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

CREATE POLICY "Users can view all drugs" ON public.drugs FOR SELECT USING (true);

    -- اطمینان از یکتا بودن ترکیب انبار + دارو + بچ);

-- =====================================================

-- پیام تکمیل    UNIQUE(warehouse_id, drug_id, batch_number)

-- =====================================================

SELECT );-- =====================================================

    '🎉 سیستم مدیریت انبار داروخانه با موفقیت نصب شد' as status,

    '👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404' as developer,-- جدول تنظیمات سیستم

    now() as installation_time;
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