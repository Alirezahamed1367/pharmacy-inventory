-- اسکریپت ساخت دیتابیس سیستم مدیریت انبار داروخانه
-- Database Setup Script for Pharmacy Inventory Management System

-- جدول تامین‌کنندگان (Suppliers)
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    contact VARCHAR(255),
    contact_phone VARCHAR(20),
    specialties TEXT[],
    rating DECIMAL(2,1) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول مسئولان انبار (Managers)  
CREATE TABLE managers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول انبارها (Warehouses)
CREATE TABLE warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location TEXT,
    manager_id BIGINT REFERENCES managers(id),
    capacity INTEGER DEFAULT 1000,
    current_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول داروها (Drugs)
CREATE TABLE drugs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    description TEXT,
    dosage VARCHAR(100),
    form VARCHAR(100), -- قرص، کپسول، شربت
    manufacturer VARCHAR(255),
    batch_number VARCHAR(100),
    barcode VARCHAR(50),
    category VARCHAR(100),
    active_ingredient VARCHAR(255),
    unit VARCHAR(50) DEFAULT 'عدد',
    features TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول موجودی داروها در انبارها (Drug Inventory)
CREATE TABLE drug_inventory (
    id BIGSERIAL PRIMARY KEY,
    drug_id BIGINT REFERENCES drugs(id) ON DELETE CASCADE,
    warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    expire_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, expiring, expired
    batch_number VARCHAR(100),
    purchase_price DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(drug_id, warehouse_id, batch_number, expire_date)
);

-- جدول رسیدهای کالا (Receipts)
CREATE TABLE receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id BIGINT REFERENCES suppliers(id),
    warehouse_id BIGINT REFERENCES warehouses(id),
    receipt_date DATE NOT NULL,
    total_value DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول آیتم‌های رسید (Receipt Items)
CREATE TABLE receipt_items (
    id BIGSERIAL PRIMARY KEY,
    receipt_id BIGINT REFERENCES receipts(id) ON DELETE CASCADE,
    drug_id BIGINT REFERENCES drugs(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    expire_date DATE,
    batch_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول انتقالات بین انبارها (Transfers)
CREATE TABLE transfers (
    id BIGSERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_warehouse_id BIGINT REFERENCES warehouses(id),
    to_warehouse_id BIGINT REFERENCES warehouses(id),
    transfer_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_transit, completed, cancelled
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول آیتم‌های انتقال (Transfer Items)
CREATE TABLE transfer_items (
    id BIGSERIAL PRIMARY KEY,
    transfer_id BIGINT REFERENCES transfers(id) ON DELETE CASCADE,
    drug_id BIGINT REFERENCES drugs(id),
    quantity INTEGER NOT NULL,
    unit VARCHAR(50),
    expire_date DATE,
    batch_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول کاربران (Users)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user', -- superadmin, admin, manager, user
    warehouse_id BIGINT REFERENCES warehouses(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایندکس‌ها برای بهبود عملکرد
CREATE INDEX idx_drugs_name ON drugs(name);
CREATE INDEX idx_drugs_category ON drugs(category);
CREATE INDEX idx_drug_inventory_expire_date ON drug_inventory(expire_date);
CREATE INDEX idx_drug_inventory_status ON drug_inventory(status);
CREATE INDEX idx_receipts_date ON receipts(receipt_date);
CREATE INDEX idx_transfers_date ON transfers(transfer_date);
CREATE INDEX idx_users_username ON users(username);

-- درج داده‌های نمونه

-- مسئولان انبار
INSERT INTO managers (name, position, phone) VALUES
('علی احمدی', 'مدیر انبار اصلی', '09121234567'),
('فاطمه رضایی', 'مسئول انبار شعبه شرق', '09129876543'),
('محمد حسینی', 'مسئول انبار شعبه غرب', '09123456789'),
('مریم کریمی', 'مسئول انبار شعبه شمال', '09127654321');

-- تامین‌کنندگان
INSERT INTO suppliers (name, code, phone, email, contact, contact_phone, specialties, rating) VALUES
('شرکت داروسازی سینا', 'SINA-001', '021-12345678', 'info@sina-pharma.com', 'احمد رضایی', '09121234567', '{"مسکن","آنتی بیوتیک"}', 4.8),
('شرکت طب داری', 'TEBDARI-002', '021-87654321', 'sales@tebdari.com', 'فاطمه کریمی', '09129876543', '{"ضد التهاب","گوارشی"}', 4.6),
('داروخانه مرکزی ایران', 'CENTRAL-003', '021-11223344', 'orders@central-pharma.ir', 'محمد حسینی', '09123456789', '{"آنتی بیوتیک","ویتامین"}', 4.9),
('شرکت پخش البرز', 'ALBORZ-004', '021-55667788', 'contact@alborz-pharma.com', 'علی محمدی', '09127654321', '{"تخصصی","عمومی"}', 4.7);

-- انبارها
INSERT INTO warehouses (name, description, location, manager_id, capacity) VALUES
('انبار مرکزی', 'انبار اصلی داروخانه', 'تهران، خیابان ولیعصر', 1, 10000),
('انبار شعبه شرق', 'انبار شعبه شرق تهران', 'تهران، میدان تجریش', 2, 5000),
('انبار شعبه غرب', 'انبار شعبه غرب تهران', 'تهران، میدان آزادی', 3, 5000),
('انبار شعبه شمال', 'انبار شعبه شمال تهران', 'تهران، ونک', 4, 3000);

-- داروهای نمونه
INSERT INTO drugs (name, generic_name, description, dosage, form, manufacturer, category, active_ingredient) VALUES
('آسپرین', 'استیل سالیسیلیک اسید', 'ضد درد و تب‌بر', '500mg', 'قرص', 'شرکت داروسازی سینا', 'مسکن', 'استیل سالیسیلیک اسید'),
('ایبوپروفن', 'ایبوپروفن', 'ضد التهاب و تب‌بر', '400mg', 'قرص', 'شرکت طب داری', 'ضد التهاب', 'ایبوپروفن'),
('پنی‌سیلین', 'پنی‌سیلین', 'آنتی‌بیوتیک', '250mg', 'کپسول', 'داروخانه مرکزی ایران', 'آنتی بیوتیک', 'پنی‌سیلین'),
('آموکسی‌سیلین', 'آموکسی‌سیلین', 'آنتی‌بیوتیک پنی‌سیلینی', '500mg', 'کپسول', 'شرکت پخش البرز', 'آنتی بیوتیک', 'آموکسی‌سیلین');

-- موجودی نمونه
INSERT INTO drug_inventory (drug_id, warehouse_id, quantity, expire_date, status, batch_number) VALUES
(1, 1, 100, '2025-12-15', 'active', 'ASP-001-2025'),
(1, 2, 50, '2025-11-10', 'active', 'ASP-002-2025'),
(2, 1, 75, '2025-09-20', 'expiring', 'IBU-001-2025'),
(2, 3, 40, '2025-10-15', 'active', 'IBU-002-2025'),
(3, 2, 25, '2025-08-10', 'expired', 'PEN-001-2025'),
(4, 4, 60, '2026-01-12', 'active', 'AMX-001-2026');

-- کاربر Super Admin
INSERT INTO users (username, email, full_name, role) VALUES
('superadmin', 'admin@pharmacy.com', 'مدیر سیستم', 'superadmin');

-- فعال‌سازی Row Level Security (RLS)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سیاست‌های دسترسی (RLS Policies)
-- برای سادگی، دسترسی عمومی برای authenticated users
CREATE POLICY "Enable all for authenticated users" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON managers FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON warehouses FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON drugs FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON drug_inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON receipts FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON receipt_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON transfers FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON transfer_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON users FOR ALL TO authenticated USING (true);

-- دسترسی عمومی خواندن برای anon users (برای لاگین)
CREATE POLICY "Enable read for anon users" ON users FOR SELECT TO anon USING (true);