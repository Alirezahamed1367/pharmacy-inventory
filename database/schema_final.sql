-- =====================================================
-- سیستم انبارداری دارو - اسکریپت دیتابیس (نسخه نهایی و صحیح)
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
-- جدول دسته‌بندی داروها
-- =====================================================
CREATE TABLE public.drug_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
-- جدول انبارها
-- =====================================================
CREATE TABLE public.warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(300),
    manager_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    description TEXT,
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
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'operator',
    warehouse_id UUID REFERENCES public.warehouses(id),
    permissions JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- جدول موجودی انبار
-- =====================================================
CREATE TABLE public.warehouse_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    batch_number VARCHAR(50),
    supplier VARCHAR(100),
    purchase_price DECIMAL(10,2),
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(drug_id, warehouse_id, batch_number)
);

-- =====================================================
-- جدول حرکات داروها
-- =====================================================
CREATE TABLE public.drug_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,
    from_warehouse_id UUID REFERENCES public.warehouses(id),
    to_warehouse_id UUID REFERENCES public.warehouses(id),
    movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'transfer'
    quantity INTEGER NOT NULL,
    reference_number VARCHAR(100),
    batch_number VARCHAR(50),
    expiry_date DATE,
    supplier VARCHAR(100),
    user_id UUID REFERENCES public.users(id),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    movement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- جدول تنظیمات سیستم
-- =====================================================
CREATE TABLE public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
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
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- ایجاد فانکشن trigger برای updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- اضافه کردن trigger برای جداول
-- =====================================================
CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_warehouse_inventory_updated_at BEFORE UPDATE ON public.warehouse_inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- ایجاد indexes برای بهبود کارایی
-- =====================================================
CREATE INDEX idx_drugs_name ON public.drugs(name);
CREATE INDEX idx_drugs_category ON public.drugs(category_id);
CREATE INDEX idx_drugs_active ON public.drugs(active);
CREATE INDEX idx_warehouses_active ON public.warehouses(active);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_warehouse_inventory_drug ON public.warehouse_inventory(drug_id);
CREATE INDEX idx_warehouse_inventory_warehouse ON public.warehouse_inventory(warehouse_id);
CREATE INDEX idx_warehouse_inventory_expiry ON public.warehouse_inventory(expiry_date);
CREATE INDEX idx_drug_movements_drug ON public.drug_movements(drug_id);
CREATE INDEX idx_drug_movements_date ON public.drug_movements(movement_date);
CREATE INDEX idx_drug_movements_type ON public.drug_movements(movement_type);

-- =====================================================
-- ایجاد views مفید
-- =====================================================

-- نمای موجودی انبار با جزئیات
CREATE VIEW inventory_view AS
SELECT 
    wi.id,
    d.name as drug_name,
    d.generic_name,
    d.dosage,
    d.form,
    w.name as warehouse_name,
    wi.quantity,
    wi.expiry_date,
    wi.batch_number,
    wi.supplier,
    wi.purchase_price,
    wi.purchase_date,
    CASE 
        WHEN wi.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN wi.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'good'
    END as status
FROM public.warehouse_inventory wi
JOIN public.drugs d ON wi.drug_id = d.id
JOIN public.warehouses w ON wi.warehouse_id = w.id
WHERE d.active = true AND w.active = true;

-- نمای حرکات داروها با جزئیات
CREATE VIEW movements_view AS
SELECT 
    dm.id,
    d.name as drug_name,
    wf.name as from_warehouse,
    wt.name as to_warehouse,
    dm.movement_type,
    dm.quantity,
    dm.reference_number,
    dm.batch_number,
    dm.expiry_date,
    dm.supplier,
    u.full_name as user_name,
    dm.notes,
    dm.status,
    dm.movement_date,
    dm.created_at
FROM public.drug_movements dm
JOIN public.drugs d ON dm.drug_id = d.id
LEFT JOIN public.warehouses wf ON dm.from_warehouse_id = wf.id
LEFT JOIN public.warehouses wt ON dm.to_warehouse_id = wt.id
LEFT JOIN public.users u ON dm.user_id = u.id
ORDER BY dm.created_at DESC;

-- =====================================================
-- درج کاربران پیش‌فرض سیستم
-- =====================================================
INSERT INTO public.users (username, password, full_name, role) VALUES
('superadmin', 'A25893Aa', 'مدیر کل سیستم', 'superadmin'),
('admin1', '123456', 'مدیر کل', 'admin'),
('manager1', '123456', 'مدیر انبار', 'manager'),
('operator1', '123456', 'کارمند', 'operator');

-- =====================================================
-- درج دسته‌بندی‌های پیش‌فرض
-- =====================================================
INSERT INTO public.drug_categories (name, description) VALUES
('مسکن و ضد التهاب', 'داروهای مسکن و ضد التهاب'),
('آنتی‌بیوتیک', 'داروهای ضد باکتری'),
('قلبی و عروقی', 'داروهای مربوط به قلب و عروق'),
('تنفسی', 'داروهای مربوط به دستگاه تنفس'),
('گوارشی', 'داروهای مربوط به دستگاه گوارش');

-- =====================================================
-- تنظیمات پیش‌فرض سیستم
-- =====================================================
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('suppliers', '[]', 'لیست تأمین‌کنندگان'),
('notification_settings', '{"expiry_days": 30, "low_stock_threshold": 10}', 'تنظیمات اعلان‌ها'),
('system_info', '{"name": "سیستم مدیریت انبار دارو", "version": "1.0.0", "developer": "علیرضا حامد"}', 'اطلاعات سیستم');

-- =====================================================
-- فعال‌سازی RLS (Row Level Security)
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- پایان اسکریپت
-- =====================================================