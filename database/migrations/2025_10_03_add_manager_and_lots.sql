-- Migration: add manager_user_id to warehouses and introduce drug_lots & lot_id columns
-- Date: 2025-10-03
-- Phase 1 of lot-level redesign

-- 1. Add manager_user_id to warehouses (nullable for now)
ALTER TABLE public.warehouses
  ADD COLUMN IF NOT EXISTS manager_user_id UUID REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_warehouses_manager_user_id ON public.warehouses(manager_user_id);

-- 2. Create drug_lots table (initial). We keep expire_date also still in drugs until phase 3.
CREATE TABLE IF NOT EXISTS public.drug_lots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  lot_number VARCHAR(50),
  expire_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (drug_id, lot_number, expire_date)
);

CREATE INDEX IF NOT EXISTS idx_drug_lots_expire_date ON public.drug_lots(expire_date);
CREATE INDEX IF NOT EXISTS idx_drug_lots_drug_expire ON public.drug_lots(drug_id, expire_date);

-- 3. Add lot_id to inventory & receipt_items & transfer_items (nullable now)
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS lot_id UUID REFERENCES public.drug_lots(id);
ALTER TABLE public.receipt_items ADD COLUMN IF NOT EXISTS lot_id UUID REFERENCES public.drug_lots(id);
ALTER TABLE public.transfer_items ADD COLUMN IF NOT EXISTS lot_id UUID REFERENCES public.drug_lots(id);

-- 4. Backfill: create a lot per drug using existing drugs.expire_date if inventory rows without lot exist.
-- (Idempotent: skip if already created)
-- Revised backfill: production schema may not have drug_id on transfer_items; instead we later map via inventory join.
DO $$
DECLARE r RECORD; new_lot_id UUID; BEGIN
  FOR r IN SELECT id, expire_date FROM public.drugs WHERE expire_date IS NOT NULL LOOP
    SELECT id INTO new_lot_id FROM public.drug_lots 
      WHERE drug_id = r.id AND expire_date = r.expire_date AND lot_number IS NULL LIMIT 1;
    IF new_lot_id IS NULL THEN
      INSERT INTO public.drug_lots(drug_id, lot_number, expire_date)
        VALUES (r.id, NULL, r.expire_date)
        RETURNING id INTO new_lot_id;
    END IF;
    -- inventory & receipt_items have drug_id
    UPDATE public.inventory SET lot_id = new_lot_id WHERE lot_id IS NULL AND drug_id = r.id;
    UPDATE public.receipt_items SET lot_id = new_lot_id WHERE lot_id IS NULL AND drug_id = r.id;
  END LOOP;
END$$;

-- Populate transfer_items.lot_id via inventory link (transfer_items has inventory_id)
UPDATE public.transfer_items ti
SET lot_id = inv.lot_id
FROM public.inventory inv
WHERE ti.lot_id IS NULL AND ti.inventory_id = inv.id AND inv.lot_id IS NOT NULL;

-- If any transfer_items still without lot, attempt fallback using a default lot per inventory drug (if inventory holds drug_id)
-- (Optional; uncomment if needed)
-- UPDATE public.transfer_items ti
-- SET lot_id = dl.id
-- FROM public.inventory inv
-- JOIN public.drug_lots dl ON dl.drug_id = inv.drug_id AND dl.lot_number IS NULL
-- WHERE ti.lot_id IS NULL AND ti.inventory_id = inv.id;

-- Note: Later phases will enforce NOT NULL and drop old columns after code adjustment.

COMMENT ON TABLE public.drug_lots IS 'Lots (batches) of drugs with individual expiry dates';
COMMENT ON COLUMN public.warehouses.manager_user_id IS 'User (manager) responsible for this warehouse';
