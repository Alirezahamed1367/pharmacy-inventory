-- 🏥 سیستم مدیریت انبار داروخانه - Schema نهایی-- =====================================================

-- 👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404-- سیستم انبارداری دارو - اسکریپت دیتابیس

-- 📧 Email: alireza.h67@gmail.com-- طراحی و توسعه: علیرضا حامد - پاییز 1404

-- 🎯 نسخه: Production Ready-- =====================================================



-- ===== حذف جداول موجود =====-- فعال‌سازی Row Level Security

DROP TABLE IF EXISTS notifications CASCADE;ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters-long';

DROP TABLE IF EXISTS transfers CASCADE;

DROP TABLE IF EXISTS inventory_movements CASCADE;-- =====================================================

DROP TABLE IF EXISTS inventory CASCADE;-- جدول کاربران

DROP TABLE IF EXISTS drugs CASCADE;-- =====================================================

DROP TABLE IF EXISTS warehouses CASCADE;CREATE TABLE IF NOT EXISTS public.users (

DROP TABLE IF EXISTS users CASCADE;    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,

-- حذف enum ها    name VARCHAR(100) NOT NULL,

DROP TYPE IF EXISTS notification_type CASCADE;    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'admin', 'manager', 'operator')),

DROP TYPE IF EXISTS transfer_status CASCADE;    warehouse_id UUID,

DROP TYPE IF EXISTS movement_type CASCADE;    active BOOLEAN DEFAULT true,

DROP TYPE IF EXISTS user_role CASCADE;    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

-- ===== تعریف enum ها =====);

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'warehouse_manager', 'operator');

CREATE TYPE movement_type AS ENUM ('in', 'out', 'transfer', 'adjustment', 'expired');-- ایندکس برای بهبود عملکرد

CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'rejected', 'completed');CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

CREATE TYPE notification_type AS ENUM ('low_stock', 'expiry_warning', 'transfer_request', 'system');CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_users_warehouse_id ON public.users(warehouse_id);

-- ===== جدول کاربران =====

CREATE TABLE users (-- =====================================================

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),-- جدول انبارها

    username VARCHAR(50) UNIQUE NOT NULL,-- =====================================================

    email VARCHAR(100) UNIQUE,CREATE TABLE IF NOT EXISTS public.warehouses (

    password_hash VARCHAR(255) NOT NULL,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,    name VARCHAR(100) NOT NULL,

    role user_role NOT NULL DEFAULT 'operator',    description TEXT,

    is_active BOOLEAN DEFAULT true,    location VARCHAR(200),

    is_permanent BOOLEAN DEFAULT false, -- کاربران دائمی (غیر قابل حذف)    manager_name VARCHAR(100),

    phone VARCHAR(20),    capacity INTEGER DEFAULT 1000 CHECK (capacity > 0),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    active BOOLEAN DEFAULT true,

    last_login TIMESTAMP WITH TIME ZONE,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    created_by UUID REFERENCES users(id)    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

););



-- ===== جدول انبارها =====-- ایندکس برای بهبود عملکرد

CREATE TABLE warehouses (CREATE INDEX IF NOT EXISTS idx_warehouses_name ON public.warehouses(name);

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),CREATE INDEX IF NOT EXISTS idx_warehouses_active ON public.warehouses(active);

    name VARCHAR(100) NOT NULL,

    code VARCHAR(20) UNIQUE NOT NULL,-- =====================================================

    description TEXT,-- جدول دسته‌بندی داروها

    address TEXT,-- =====================================================

    phone VARCHAR(20),CREATE TABLE IF NOT EXISTS public.drug_categories (

    manager_id UUID REFERENCES users(id),    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    is_active BOOLEAN DEFAULT true,    name VARCHAR(100) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    description TEXT,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    created_by UUID REFERENCES users(id));

);

-- =====================================================

-- ===== جدول داروها =====-- جدول داروها

CREATE TABLE drugs (-- =====================================================

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),CREATE TABLE IF NOT EXISTS public.drugs (

    name VARCHAR(200) NOT NULL,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    generic_name VARCHAR(200),    name VARCHAR(200) NOT NULL,

    brand_name VARCHAR(200),    generic_name VARCHAR(200),

    category VARCHAR(100),    description TEXT,

    form VARCHAR(50), -- قرص، شربت، آمپول    dosage VARCHAR(100),

    strength VARCHAR(50), -- قدرت دارو    form VARCHAR(50), -- قرص، کپسول، شربت، آمپول و...

    unit VARCHAR(20), -- واحد شمارش    manufacturer VARCHAR(100),

    barcode VARCHAR(100) UNIQUE,    category_id UUID REFERENCES public.drug_categories(id),

    description TEXT,    features TEXT,

    manufacturer VARCHAR(100),    image_url VARCHAR(500),

    supplier VARCHAR(100),    barcode VARCHAR(100),

    price DECIMAL(12,2),    min_stock_level INTEGER DEFAULT 0,

    minimum_stock INTEGER DEFAULT 0,    max_stock_level INTEGER DEFAULT 1000,

    maximum_stock INTEGER,    unit_price DECIMAL(10,2) DEFAULT 0,

    reorder_level INTEGER DEFAULT 0,    active BOOLEAN DEFAULT true,

    image_url TEXT,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    is_active BOOLEAN DEFAULT true,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    requires_prescription BOOLEAN DEFAULT false,);

    storage_conditions TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),-- ایندکس برای بهبود عملکرد

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),CREATE INDEX IF NOT EXISTS idx_drugs_name ON public.drugs(name);

    created_by UUID REFERENCES users(id)CREATE INDEX IF NOT EXISTS idx_drugs_generic_name ON public.drugs(generic_name);

);CREATE INDEX IF NOT EXISTS idx_drugs_barcode ON public.drugs(barcode);

CREATE INDEX IF NOT EXISTS idx_drugs_category_id ON public.drugs(category_id);

-- ===== جدول موجودی =====CREATE INDEX IF NOT EXISTS idx_drugs_active ON public.drugs(active);

CREATE TABLE inventory (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),-- =====================================================

    drug_id UUID NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,-- جدول موجودی انبار

    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,-- =====================================================

    batch_number VARCHAR(50),CREATE TABLE IF NOT EXISTS public.warehouse_inventory (

    expiry_date DATE,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    quantity INTEGER NOT NULL DEFAULT 0,    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,

    reserved_quantity INTEGER NOT NULL DEFAULT 0,    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,

    cost_price DECIMAL(12,2),    batch_number VARCHAR(100),

    selling_price DECIMAL(12,2),    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),

    supplier_id VARCHAR(100),    unit_cost DECIMAL(10,2) DEFAULT 0,

    received_date DATE,    manufacture_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    expire_date DATE,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    created_by UUID REFERENCES users(id),    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(drug_id, warehouse_id, batch_number)    

);    -- اطمینان از یکتا بودن ترکیب انبار + دارو + بچ

    UNIQUE(warehouse_id, drug_id, batch_number)

-- ===== جدول تحرکات موجودی =====);

CREATE TABLE inventory_movements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),-- ایندکس برای بهبود عملکرد

    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON public.warehouse_inventory(warehouse_id);

    movement_type movement_type NOT NULL,CREATE INDEX IF NOT EXISTS idx_inventory_drug_id ON public.warehouse_inventory(drug_id);

    quantity INTEGER NOT NULL,CREATE INDEX IF NOT EXISTS idx_inventory_expire_date ON public.warehouse_inventory(expire_date);

    remaining_quantity INTEGER NOT NULL,CREATE INDEX IF NOT EXISTS idx_inventory_batch_number ON public.warehouse_inventory(batch_number);

    unit_price DECIMAL(12,2),

    total_price DECIMAL(12,2),-- =====================================================

    reference_number VARCHAR(100),-- جدول انتقالات داروها

    notes TEXT,-- =====================================================

    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),CREATE TABLE IF NOT EXISTS public.drug_movements (

    created_by UUID REFERENCES users(id)    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

);    drug_id UUID NOT NULL REFERENCES public.drugs(id),

    from_warehouse_id UUID REFERENCES public.warehouses(id),

-- ===== جدول انتقالات بین انبار =====    to_warehouse_id UUID REFERENCES public.warehouses(id),

CREATE TABLE transfers (    batch_number VARCHAR(100),

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    quantity INTEGER NOT NULL CHECK (quantity > 0),

    from_warehouse_id UUID NOT NULL REFERENCES warehouses(id),    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('transfer', 'entry', 'exit', 'adjustment', 'expired')),

    to_warehouse_id UUID NOT NULL REFERENCES warehouses(id),    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),

    drug_id UUID NOT NULL REFERENCES drugs(id),    reference_number VARCHAR(100),

    batch_number VARCHAR(50),    notes TEXT,

    quantity INTEGER NOT NULL,    created_by UUID REFERENCES public.users(id),

    status transfer_status DEFAULT 'pending',    approved_by UUID REFERENCES public.users(id),

    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    movement_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    approved_date TIMESTAMP WITH TIME ZONE,    completed_date TIMESTAMP WITH TIME ZONE,

    completed_date TIMESTAMP WITH TIME ZONE,    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    notes TEXT,);

    requested_by UUID REFERENCES users(id),

    approved_by UUID REFERENCES users(id),-- ایندکس برای بهبود عملکرد

    completed_by UUID REFERENCES users(id),CREATE INDEX IF NOT EXISTS idx_movements_drug_id ON public.drug_movements(drug_id);

    CHECK (from_warehouse_id != to_warehouse_id)CREATE INDEX IF NOT EXISTS idx_movements_from_warehouse ON public.drug_movements(from_warehouse_id);

);CREATE INDEX IF NOT EXISTS idx_movements_to_warehouse ON public.drug_movements(to_warehouse_id);

CREATE INDEX IF NOT EXISTS idx_movements_status ON public.drug_movements(status);

-- ===== جدول اعلانات =====CREATE INDEX IF NOT EXISTS idx_movements_type ON public.drug_movements(movement_type);

CREATE TABLE notifications (CREATE INDEX IF NOT EXISTS idx_movements_date ON public.drug_movements(movement_date);

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),CREATE INDEX IF NOT EXISTS idx_movements_reference ON public.drug_movements(reference_number);

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    type notification_type NOT NULL,-- =====================================================

    title VARCHAR(200) NOT NULL,-- جدول تنظیمات سیستم

    message TEXT NOT NULL,-- =====================================================

    is_read BOOLEAN DEFAULT false,CREATE TABLE IF NOT EXISTS public.system_settings (

    related_id UUID,    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()    setting_key VARCHAR(100) UNIQUE NOT NULL,

);    setting_value TEXT,

    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),

-- ===== ایندکس‌ها =====    description TEXT,

CREATE INDEX idx_inventory_drug_warehouse ON inventory(drug_id, warehouse_id);    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

CREATE INDEX idx_inventory_quantity ON inventory(quantity););

CREATE INDEX idx_movements_inventory ON inventory_movements(inventory_id);

CREATE INDEX idx_movements_date ON inventory_movements(movement_date);-- =====================================================

CREATE INDEX idx_transfers_status ON transfers(status);-- جدول لاگ فعالیت‌ها

CREATE INDEX idx_transfers_warehouses ON transfers(from_warehouse_id, to_warehouse_id);-- =====================================================

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);CREATE TABLE IF NOT EXISTS public.activity_logs (

CREATE INDEX idx_drugs_category ON drugs(category);    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

CREATE INDEX idx_drugs_name ON drugs(name);    user_id UUID REFERENCES public.users(id),

CREATE INDEX idx_users_username ON users(username);    action VARCHAR(100) NOT NULL,

CREATE INDEX idx_users_email ON users(email);    table_name VARCHAR(50),

    record_id UUID,

-- ===== تریگرها برای updated_at =====    old_values JSONB,

CREATE OR REPLACE FUNCTION update_modified_column()    new_values JSONB,

RETURNS TRIGGER AS $$    ip_address INET,

BEGIN    user_agent TEXT,

    NEW.updated_at = NOW();    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    RETURN NEW;);

END;

$$ language 'plpgsql';-- ایندکس برای بهبود عملکرد

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

CREATE TRIGGER update_warehouses_modtime BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_modified_column();CREATE INDEX IF NOT EXISTS idx_activity_logs_table_name ON public.activity_logs(table_name);

CREATE TRIGGER update_drugs_modtime BEFORE UPDATE ON drugs FOR EACH ROW EXECUTE FUNCTION update_modified_column();CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =====================================================

-- ===== درج کاربران دائمی =====-- Foreign Key برای users.warehouse_id

INSERT INTO users (-- =====================================================

    id,ALTER TABLE public.users ADD CONSTRAINT fk_users_warehouse_id 

    username,     FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);

    email,

    password_hash, -- =====================================================

    full_name, -- توابع Trigger برای به‌روزرسانی automatic timestamps

    role, -- =====================================================

    is_active, CREATE OR REPLACE FUNCTION public.update_updated_at_column()

    is_permanent,RETURNS TRIGGER AS $$

    phone,BEGIN

    created_at    NEW.updated_at = timezone('utc'::text, now());

) VALUES     RETURN NEW;

-- سوپر ادمین (توسعه دهنده) - غیر قابل تغییرEND;

($$ language 'plpgsql';

    '00000000-0000-0000-0000-000000000001',

    'superadmin',-- اعمال trigger به جداول

    'alireza.h67@gmail.com',CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users

    '$2b$10$8K1p/a9eLJ3QaOjHfLq5jOo9O4tZILp7QKuP9J.dKV7LkCqP3/ixe', -- A25893Aa    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    'علیرضا حامد (توسعه دهنده)',

    'super_admin',CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses

    true,    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    true,

    '',CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs

    '2024-10-01 00:00:00+00'    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

),

-- ادمین سیستم - برای مدیریت کاربرانCREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.warehouse_inventory

(    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    '00000000-0000-0000-0000-000000000002',

    'admin',CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.system_settings

    'admin@pharmacy.local',    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password

    'مدیر سیستم',-- =====================================================

    'admin',-- Views برای گزارش‌گیری

    true,-- =====================================================

    true,

    '',-- نمای موجودی کامل

    '2024-10-01 00:00:00+00'CREATE OR REPLACE VIEW public.inventory_view AS

);SELECT 

    wi.id,

-- ===== ایجاد انبار پیش فرض =====    w.name as warehouse_name,

INSERT INTO warehouses (    d.name as drug_name,

    id,    d.generic_name,

    name,    d.dosage,

    code,    d.form,

    description,    wi.batch_number,

    created_by,    wi.quantity,

    created_at    wi.unit_cost,

) VALUES (    wi.manufacture_date,

    '00000000-0000-0000-0000-000000000001',    wi.expire_date,

    'انبار اصلی',    CASE 

    'MAIN',        WHEN wi.expire_date < CURRENT_DATE THEN 'expired'

    'انبار اصلی داروخانه',        WHEN wi.expire_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'

    '00000000-0000-0000-0000-000000000001',        ELSE 'active'

    '2024-10-01 00:00:00+00'    END as status,

);    wi.entry_date,

    wi.last_updated

-- ===== فعال‌سازی Row Level Security =====FROM public.warehouse_inventory wi

ALTER TABLE users ENABLE ROW LEVEL SECURITY;JOIN public.warehouses w ON wi.warehouse_id = w.id

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;JOIN public.drugs d ON wi.drug_id = d.id

ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;WHERE w.active = true AND d.active = true;

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;-- نمای انتقالات کامل

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;CREATE OR REPLACE VIEW public.movements_view AS

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;SELECT 

    dm.id,

-- ===== سیاست‌های امنیتی =====    d.name as drug_name,

    fw.name as from_warehouse,

-- سیاست کاربران    tw.name as to_warehouse,

CREATE POLICY "users_select_policy" ON users    dm.batch_number,

FOR SELECT USING (    dm.quantity,

    auth.uid()::text = id::text OR     dm.movement_type,

    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role IN ('super_admin', 'admin'))    dm.status,

);    dm.reference_number,

    dm.notes,

CREATE POLICY "users_insert_policy" ON users    cu.name as created_by_name,

FOR INSERT WITH CHECK (    au.name as approved_by_name,

    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role IN ('super_admin', 'admin'))    dm.movement_date,

);    dm.completed_date,

    dm.created_at

CREATE POLICY "users_update_policy" ON usersFROM public.drug_movements dm

FOR UPDATE USING (JOIN public.drugs d ON dm.drug_id = d.id

    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role IN ('super_admin', 'admin'))LEFT JOIN public.warehouses fw ON dm.from_warehouse_id = fw.id

    AND (is_permanent = false OR auth.uid()::text = '00000000-0000-0000-0000-000000000001')LEFT JOIN public.warehouses tw ON dm.to_warehouse_id = tw.id

);LEFT JOIN public.users cu ON dm.created_by = cu.id

LEFT JOIN public.users au ON dm.approved_by = au.id;

CREATE POLICY "users_delete_policy" ON users

FOR DELETE USING (-- =====================================================

    is_permanent = false AND-- داده‌های نمونه

    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'super_admin')-- =====================================================

);

-- دسته‌بندی داروها

-- سیاست عمومی برای سایر جداولINSERT INTO public.drug_categories (name, description) VALUES

CREATE POLICY "authenticated_all_policy" ON warehouses('ضد درد', 'داروهای مسکن و ضد التهاب'),

FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));('آنتی‌بیوتیک', 'داروهای ضد عفونی'),

('ویتامین', 'مکمل‌های ویتامین و مواد معدنی'),

CREATE POLICY "authenticated_all_policy" ON drugs('قلبی عروقی', 'داروهای مربوط به قلب و عروق'),

FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));('گوارشی', 'داروهای مربوط به دستگاه گوارش')

ON CONFLICT DO NOTHING;

CREATE POLICY "authenticated_all_policy" ON inventory

FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));-- انبارهای نمونه

INSERT INTO public.warehouses (name, description, location, manager_name, capacity) VALUES

CREATE POLICY "authenticated_all_policy" ON inventory_movements('انبار مرکزی', 'انبار اصلی شرکت', 'تهران، میدان ولیعصر', 'علی احمدی', 2000),

FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));('انبار شعبه شرق', 'انبار منطقه شرقی', 'تهران، نارمک', 'فاطمه محمدی', 800),

('انبار شعبه غرب', 'انبار منطقه غربی', 'تهران، اکباتان', 'محمد رضایی', 600),

CREATE POLICY "authenticated_all_policy" ON transfers('انبار شعبه شمال', 'انبار منطقه شمالی', 'تهران، تجریش', 'زهرا کریمی', 500)

FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));ON CONFLICT DO NOTHING;



CREATE POLICY "notifications_user_policy" ON notifications-- کاربران نمونه

FOR ALL USING (user_id::text = auth.uid()::text);INSERT INTO public.users (username, name, role, active) VALUES

('superadmin', 'سوپر ادمین', 'superadmin', true),

-- ===== توابع کمکی =====('admin1', 'مدیر کل', 'admin', true),

('manager1', 'علی احمدی', 'manager', true),

-- تابع بررسی موجودی کم('operator1', 'فاطمه محمدی', 'operator', true),

CREATE OR REPLACE FUNCTION check_low_stock()('operator2', 'محمد رضایی', 'operator', true)

RETURNS TABLE(ON CONFLICT (username) DO NOTHING;

    drug_name VARCHAR,

    warehouse_name VARCHAR,-- تنظیمات سیستم

    current_stock BIGINT,INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES

    minimum_stock INTEGER('app_name', 'سیستم انبارداری دارو', 'string', 'نام برنامه'),

) AS $$('version', '1.0.0', 'string', 'نسخه برنامه'),

BEGIN('developer', 'علیرضا حامد', 'string', 'توسعه‌دهنده'),

    RETURN QUERY('development_year', 'پاییز 1404', 'string', 'زمان توسعه'),

    SELECT ('session_timeout', '1800', 'number', 'مدت زمان نشست به ثانیه'),

        d.name as drug_name,('max_file_size', '5242880', 'number', 'حداکثر اندازه فایل آپلود (5MB)'),

        w.name as warehouse_name,('enable_notifications', 'true', 'boolean', 'فعال‌سازی اعلان‌ها'),

        COALESCE(SUM(i.quantity), 0) as current_stock,('backup_frequency', 'daily', 'string', 'فرکانس پشتیبان‌گیری')

        d.minimum_stockON CONFLICT (setting_key) DO UPDATE SET 

    FROM drugs d    setting_value = EXCLUDED.setting_value,

    CROSS JOIN warehouses w    updated_at = timezone('utc'::text, now());

    LEFT JOIN inventory i ON d.id = i.drug_id AND w.id = i.warehouse_id

    WHERE d.is_active = true AND w.is_active = true-- =====================================================

    GROUP BY d.id, d.name, w.id, w.name, d.minimum_stock-- Row Level Security (RLS) Policies

    HAVING COALESCE(SUM(i.quantity), 0) <= d.minimum_stock AND d.minimum_stock > 0;-- =====================================================

END;ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

$$ LANGUAGE plpgsql;ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;

-- تابع بررسی داروهای منقضی شدهALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION check_expired_drugs()ALTER TABLE public.drug_movements ENABLE ROW LEVEL SECURITY;

RETURNS TABLE(ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

    drug_name VARCHAR,

    warehouse_name VARCHAR,-- Policy برای دسترسی کاربران

    batch_number VARCHAR,CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);

    expiry_date DATE,CREATE POLICY "Only admins can modify users" ON public.users FOR ALL USING (

    quantity INTEGER,    EXISTS (

    days_expired INTEGER        SELECT 1 FROM public.users 

) AS $$        WHERE id = auth.uid() AND role IN ('superadmin', 'admin')

BEGIN    )

    RETURN QUERY);

    SELECT 

        d.name as drug_name,-- Policy برای انبارها

        w.name as warehouse_name,CREATE POLICY "Users can view all warehouses" ON public.warehouses FOR SELECT USING (true);

        i.batch_number,CREATE POLICY "Only admins can modify warehouses" ON public.warehouses FOR ALL USING (

        i.expiry_date,    EXISTS (

        i.quantity,        SELECT 1 FROM public.users 

        (CURRENT_DATE - i.expiry_date)::INTEGER as days_expired        WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')

    FROM inventory i    )

    JOIN drugs d ON i.drug_id = d.id);

    JOIN warehouses w ON i.warehouse_id = w.id

    WHERE i.expiry_date < CURRENT_DATE-- Policy برای داروها

    AND i.quantity > 0CREATE POLICY "Users can view all drugs" ON public.drugs FOR SELECT USING (true);

    ORDER BY i.expiry_date;CREATE POLICY "Authorized users can modify drugs" ON public.drugs FOR ALL USING (

END;    EXISTS (

$$ LANGUAGE plpgsql;        SELECT 1 FROM public.users 

        WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')

-- ===== کامنت‌ها =====    )

COMMENT ON TABLE users IS 'کاربران سیستم با دو کاربر دائمی';);

COMMENT ON COLUMN users.is_permanent IS 'کاربران دائمی که قابل حذف نیستند';

COMMENT ON TABLE drugs IS 'اطلاعات داروها';-- =====================================================

COMMENT ON TABLE warehouses IS 'انبارها';-- Storage Buckets برای تصاویر

COMMENT ON TABLE inventory IS 'موجودی انبار';-- =====================================================

COMMENT ON TABLE inventory_movements IS 'تحرکات موجودی';-- این دستور در Supabase Console اجرا شود

COMMENT ON TABLE transfers IS 'انتقالات بین انبار';-- INSERT INTO storage.buckets (id, name, public) VALUES ('drug-images', 'drug-images', true);

COMMENT ON TABLE notifications IS 'اعلانات سیستم';

-- =====================================================

-- اتمام نصب-- تکمیل اسکریپت

SELECT '🎉 سیستم مدیریت انبار داروخانه با موفقیت نصب شد' as status,-- =====================================================

       '👨‍💻 طراحی و توسعه: علیرضا حامد - پاییز 1404' as developer;-- این اسکریپت آماده اجرا در Supabase SQL Editor است
