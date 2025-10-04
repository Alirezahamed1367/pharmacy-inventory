-- Migration: add is_active to drugs & snapshot columns to receipt_items / transfer_items
-- تاریخ: 2025-10-04

ALTER TABLE public.drugs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Snapshot columns for denormalized history (nullable for old rows)
ALTER TABLE public.receipt_items ADD COLUMN IF NOT EXISTS drug_name_snapshot TEXT;
ALTER TABLE public.receipt_items ADD COLUMN IF NOT EXISTS expire_date_snapshot DATE;
ALTER TABLE public.transfer_items ADD COLUMN IF NOT EXISTS drug_name_snapshot TEXT;
ALTER TABLE public.transfer_items ADD COLUMN IF NOT EXISTS expire_date_snapshot DATE;

-- Backfill snapshots for existing receipt_items
UPDATE public.receipt_items ri
SET drug_name_snapshot = d.name,
    expire_date_snapshot = d.expire_date
FROM public.drugs d
WHERE ri.drug_id = d.id AND ri.drug_name_snapshot IS NULL;

-- Backfill snapshots for existing transfer_items using inventory->drugs join
UPDATE public.transfer_items ti
SET drug_name_snapshot = d.name,
    expire_date_snapshot = d.expire_date
FROM public.inventory inv
JOIN public.drugs d ON d.id = inv.drug_id
WHERE ti.inventory_id = inv.id AND ti.drug_name_snapshot IS NULL;

-- Index to help filter active drugs quickly
CREATE INDEX IF NOT EXISTS idx_drugs_is_active ON public.drugs(is_active);

SELECT '✅ Added is_active and snapshot columns' AS status;