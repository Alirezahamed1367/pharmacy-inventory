-- Local SQLite schema equivalent
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drugs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  package_type TEXT,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS drug_lots (
  id TEXT PRIMARY KEY,
  drug_id TEXT NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  expire_date TEXT NOT NULL,
  lot_number TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(drug_id, expire_date, lot_number)
);

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  drug_id TEXT NOT NULL REFERENCES drugs(id),
  warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
  lot_id TEXT NOT NULL REFERENCES drug_lots(id),
  batch_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(drug_id, warehouse_id, lot_id, batch_number)
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  destination_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
  supplier_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  document_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  drug_id TEXT NOT NULL REFERENCES drugs(id),
  lot_id TEXT NOT NULL REFERENCES drug_lots(id),
  quantity INTEGER NOT NULL,
  batch_number TEXT,
  supplier_id TEXT,
  drug_name_snapshot TEXT,
  expire_date_snapshot TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfers (
  id TEXT PRIMARY KEY,
  source_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
  destination_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
  status TEXT NOT NULL DEFAULT 'in_transit',
  notes TEXT,
  created_by_user_id TEXT,
  document_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS transfer_items (
  id TEXT PRIMARY KEY,
  transfer_id TEXT NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
  inventory_id TEXT NOT NULL,
  lot_id TEXT NOT NULL REFERENCES drug_lots(id),
  quantity_sent INTEGER NOT NULL,
  quantity_received INTEGER,
  discrepancy_notes TEXT,
  drug_name_snapshot TEXT,
  expire_date_snapshot TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Seed superadmin if not exists
INSERT INTO users (id, username, password_hash, full_name, role) 
SELECT lower(hex(randomblob(16))), 'superadmin', '$2a$10$4fUprb6z8uEXAMPLEHASHp5pmVq2', 'کاربر ارشد', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='superadmin');
