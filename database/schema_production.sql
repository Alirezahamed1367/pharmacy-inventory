-- Schema نهایی برای سیستم مدیریت انبار داروخانه
-- با دو کاربر دائمی: سوپر ادمین (توسعه دهنده) و ادمین (مدیر سیستم)
-- طراحی و توسعه: علیرضا حامد - پاییز 1404

-- حذف جداول موجود اگر وجود دارند
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS drugs CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ایجاد enum ها
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'warehouse_manager', 'operator');
CREATE TYPE movement_type AS ENUM ('in', 'out', 'transfer', 'adjustment', 'expired');
CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE notification_type AS ENUM ('low_stock', 'expiry_warning', 'transfer_request', 'system');

-- ===== جدول کاربران =====
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    is_active BOOLEAN DEFAULT true,
    is_permanent BOOLEAN DEFAULT false, -- برای کاربران دائمی که قابل حذف نیستند
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id)
);

-- ===== جدول انبارها =====
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ===== جدول داروها =====
CREATE TABLE drugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    brand_name VARCHAR(200),
    category VARCHAR(100),
    form VARCHAR(50), -- قرص، شربت، آمپول و غیره
    strength VARCHAR(50), -- قدرت دارو
    unit VARCHAR(20), -- واحد شمارش
    barcode VARCHAR(100) UNIQUE,
    description TEXT,
    manufacturer VARCHAR(100),
    supplier VARCHAR(100),
    price DECIMAL(12,2),
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    reorder_level INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_prescription BOOLEAN DEFAULT false,
    storage_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ===== جدول موجودی =====
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    batch_number VARCHAR(50),
    expiry_date DATE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0, -- موجودی رزرو شده
    cost_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    supplier_id VARCHAR(100),
    received_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(drug_id, warehouse_id, batch_number)
);

-- ===== جدول تحرکات موجودی =====
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    remaining_quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    reference_number VARCHAR(100),
    notes TEXT,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ===== جدول انتقالات بین انبار =====
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    to_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    drug_id UUID NOT NULL REFERENCES drugs(id),
    batch_number VARCHAR(50),
    quantity INTEGER NOT NULL,
    status transfer_status DEFAULT 'pending',
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    CHECK (from_warehouse_id != to_warehouse_id)
);

-- ===== جدول اعلانات =====
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id UUID, -- ممکن است به drug_id، transfer_id و غیره اشاره کند
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ایجاد ایندکس ها =====
CREATE INDEX idx_inventory_drug_warehouse ON inventory(drug_id, warehouse_id);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);
CREATE INDEX idx_movements_inventory ON inventory_movements(inventory_id);
CREATE INDEX idx_movements_date ON inventory_movements(movement_date);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfers_warehouses ON transfers(from_warehouse_id, to_warehouse_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_drugs_category ON drugs(category);
CREATE INDEX idx_drugs_name ON drugs(name);

-- ===== ایجاد تریگرها برای updated_at =====
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_warehouses_modtime BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_drugs_modtime BEFORE UPDATE ON drugs FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ===== درج کاربران دائمی =====
INSERT INTO users (
    id,
    username, 
    email,
    password_hash, 
    full_name, 
    role, 
    is_active, 
    is_permanent,
    phone,
    created_at
) VALUES 
-- سوپر ادمین (توسعه دهنده) - غیر قابل تغییر و حذف
(
    '00000000-0000-0000-0000-000000000001',
    'superadmin',
    'alireza.h67@gmail.com',
    '$2b$10$8K1p/a9eLJ3QaOjHfLq5jOo9O4tZILp7QKuP9J.dKV7LkCqP3/ixe', -- A25893Aa
    'علیرضا حامد (توسعه دهنده)',
    'super_admin',
    true,
    true, -- دائمی - غیر قابل حذف
    '',
    '2024-10-01 00:00:00+00'
),
-- ادمین سیستم - برای مدیریت کاربران
(
    '00000000-0000-0000-0000-000000000002',
    'admin',
    'admin@pharmacy.local',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'مدیر سیستم',
    'admin',
    true,
    true, -- دائمی - غیر قابل حذف
    '',
    '2024-10-01 00:00:00+00'
);

-- ===== ایجاد انبار پیش فرض =====
INSERT INTO warehouses (
    id,
    name,
    code,
    description,
    created_by,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'انبار اصلی',
    'MAIN',
    'انبار اصلی داروخانه',
    '00000000-0000-0000-0000-000000000001',
    '2024-10-01 00:00:00+00'
);

-- ===== تنظیم Row Level Security =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ===== سیاست های امنیتی =====

-- سیاست برای جدول کاربران
CREATE POLICY "کاربران می‌توانند اطلاعات خود را مشاهده کنند" ON users
FOR SELECT USING (auth.uid()::text = id::text OR 
                  EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role IN ('super_admin', 'admin')));

CREATE POLICY "فقط ادمین‌ها می‌توانند کاربر ایجاد کنند" ON users
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role IN ('super_admin', 'admin'))
);

CREATE POLICY "فقط ادمین‌ها می‌توانند کاربران را ویرایش کنند" ON users
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role IN ('super_admin', 'admin'))
    AND (is_permanent = false OR auth.uid()::text = '00000000-0000-0000-0000-000000000001') -- فقط سوپر ادمین می‌تواند کاربران دائمی را ویرایش کند
);

CREATE POLICY "کاربران دائمی قابل حذف نیستند" ON users
FOR DELETE USING (
    is_permanent = false AND
    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'super_admin')
);

-- سیاست عمومی برای سایر جداول
CREATE POLICY "دسترسی کامل برای کاربران احراز هویت شده" ON warehouses
FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));

CREATE POLICY "دسترسی کامل برای کاربران احراز هویت شده" ON drugs
FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));

CREATE POLICY "دسترسی کامل برای کاربران احراز هویت شده" ON inventory
FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));

CREATE POLICY "دسترسی کامل برای کاربران احراز هویت شده" ON inventory_movements
FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));

CREATE POLICY "دسترسی کامل برای کاربران احراز هویت شده" ON transfers
FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.is_active = true));

CREATE POLICY "کاربران فقط اعلانات خود را می‌بینند" ON notifications
FOR ALL USING (user_id::text = auth.uid()::text);

-- ===== توابع کمکی =====

-- تابع بررسی موجودی کم
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TABLE(
    drug_name VARCHAR,
    warehouse_name VARCHAR,
    current_stock BIGINT,
    minimum_stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.name as drug_name,
        w.name as warehouse_name,
        COALESCE(SUM(i.quantity), 0) as current_stock,
        d.minimum_stock
    FROM drugs d
    CROSS JOIN warehouses w
    LEFT JOIN inventory i ON d.id = i.drug_id AND w.id = i.warehouse_id
    WHERE d.is_active = true AND w.is_active = true
    GROUP BY d.id, d.name, w.id, w.name, d.minimum_stock
    HAVING COALESCE(SUM(i.quantity), 0) <= d.minimum_stock AND d.minimum_stock > 0;
END;
$$ LANGUAGE plpgsql;

-- تابع بررسی داروهای منقضی شده
CREATE OR REPLACE FUNCTION check_expired_drugs()
RETURNS TABLE(
    drug_name VARCHAR,
    warehouse_name VARCHAR,
    batch_number VARCHAR,
    expiry_date DATE,
    quantity INTEGER,
    days_expired INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.name as drug_name,
        w.name as warehouse_name,
        i.batch_number,
        i.expiry_date,
        i.quantity,
        (CURRENT_DATE - i.expiry_date)::INTEGER as days_expired
    FROM inventory i
    JOIN drugs d ON i.drug_id = d.id
    JOIN warehouses w ON i.warehouse_id = w.id
    WHERE i.expiry_date < CURRENT_DATE
    AND i.quantity > 0
    ORDER BY i.expiry_date;
END;
$$ LANGUAGE plpgsql;

-- ===== نظرات نهایی =====
COMMENT ON TABLE users IS 'جدول کاربران سیستم با دو کاربر دائمی';
COMMENT ON COLUMN users.is_permanent IS 'کاربران دائمی که قابل حذف نیستند';
COMMENT ON TABLE drugs IS 'جدول اطلاعات داروها';
COMMENT ON TABLE warehouses IS 'جدول انبارها';
COMMENT ON TABLE inventory IS 'جدول موجودی انبار';
COMMENT ON TABLE inventory_movements IS 'جدول تحرکات موجودی';
COMMENT ON TABLE transfers IS 'جدول انتقالات بین انبار';
COMMENT ON TABLE notifications IS 'جدول اعلانات سیستم';

-- اتمام نصب - سیستم آماده استفاده است
SELECT 'سیستم مدیریت انبار داروخانه با موفقیت نصب شد - طراحی و توسعه: علیرضا حامد - پاییز 1404' as status;