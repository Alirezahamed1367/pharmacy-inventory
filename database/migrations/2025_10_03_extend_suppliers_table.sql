-- Migration: Extend suppliers table with additional optional fields used by UI
-- Date: 2025-10-03
-- Description: Adds code/email/contact_phone/specialties/rating/is_active columns
-- Safe to run multiple times (IF NOT EXISTS guards where possible)

ALTER TABLE public.suppliers
    ADD COLUMN IF NOT EXISTS code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS email VARCHAR(150),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS specialties TEXT, -- comma separated values
    ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index to speed lookup by code if used later
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON public.suppliers(code);

-- Confirmation message
SELECT '✅ Migration extend_suppliers_table applied' AS status;
