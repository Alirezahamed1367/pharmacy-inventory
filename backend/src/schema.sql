-- Initial minimal schema (will expand)
-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  package_type TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drug_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id UUID NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  expire_date DATE NOT NULL,
  lot_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(drug_id, expire_date, lot_number)
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id UUID NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES drug_lots(id) ON DELETE CASCADE,
  batch_number TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(drug_id, warehouse_id, lot_id, batch_number)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  destination_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  document_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  drug_id UUID NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES drug_lots(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  batch_number TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  drug_name_snapshot TEXT,
  expire_date_snapshot DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  destination_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_transit',
  notes TEXT,
  created_by_user_id UUID,
  document_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES drug_lots(id) ON DELETE SET NULL,
  quantity_sent NUMERIC NOT NULL,
  quantity_received NUMERIC,
  drug_name_snapshot TEXT,
  expire_date_snapshot DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Basic seed (optional minimal admin)
INSERT INTO users (username, password_hash, full_name, role)
VALUES ('superadmin', '$2a$10$y5sKkUHD5dlzmpr9uuvt6OnlLjTCAI8KH6yOD87mpy4V/mQJu1WDW', 'مدیر ارشد', 'super_admin')
ON CONFLICT (username) DO NOTHING;
