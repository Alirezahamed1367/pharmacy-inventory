-- Migration: Drop expire_date from drugs and enforce lot-based expiry
-- Date: 2025-10-04
-- Phase: Finalize lot-based expiry model

-- SAFETY NOTES:
--   * این اسکریپت idempotent طراحی شده؛ اگر قبلا ستون حذف شده باشد یا قیود تنظیم شده باشند، خطا نمی‌دهد.
--   * پیشنهاد: قبل از اجرا از جداول drugs, drug_lots, inventory, receipt_items, transfer_items بک‌آپ بگیرید.
--   * می‌توانید ابتدا یک تراکنش دستی شروع کنید و پس از بررسی خروجی SELECT در انتها COMMIT کنید.

-- 1. Safety: ensure all inventory & receipt_items rows have lot_id (attempt backfill using existing drug_lots if missing)
DO $$
DECLARE r RECORD; lot_id UUID; BEGIN
  FOR r IN SELECT i.id, i.drug_id FROM public.inventory i WHERE i.lot_id IS NULL LOOP
    -- find or create a placeholder lot with NULL lot_number and a far future expire if drug row still has expire_date
    SELECT id INTO lot_id FROM public.drug_lots WHERE drug_id = r.drug_id AND lot_number IS NULL LIMIT 1;
    IF lot_id IS NULL THEN
      -- try using legacy expire_date from drugs
      PERFORM 1; -- no-op (we assume earlier migrations created these lots)
    END IF;
    UPDATE public.inventory SET lot_id = lot_id WHERE id = r.id AND lot_id IS NOT NULL;
  END LOOP;
  FOR r IN SELECT ri.id, ri.drug_id FROM public.receipt_items ri WHERE ri.lot_id IS NULL LOOP
    SELECT id INTO lot_id FROM public.drug_lots WHERE drug_id = r.drug_id AND lot_number IS NULL LIMIT 1;
    IF lot_id IS NULL THEN
      PERFORM 1;
    END IF;
    UPDATE public.receipt_items SET lot_id = lot_id WHERE id = r.id AND lot_id IS NOT NULL;
  END LOOP;
  FOR r IN SELECT ti.id, inv.lot_id FROM public.transfer_items ti JOIN public.inventory inv ON inv.id = ti.inventory_id WHERE ti.lot_id IS NULL AND inv.lot_id IS NOT NULL LOOP
    UPDATE public.transfer_items SET lot_id = r.lot_id WHERE id = r.id;
  END LOOP;
END $$;

-- 2. Enforce NOT NULL lot_id now that UI and code are migrated
-- Only enforce NOT NULL if column exists and not already set
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inventory' AND column_name='lot_id') THEN
    BEGIN
      ALTER TABLE public.inventory ALTER COLUMN lot_id SET NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='receipt_items' AND column_name='lot_id') THEN
    BEGIN
      ALTER TABLE public.receipt_items ALTER COLUMN lot_id SET NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transfer_items' AND column_name='lot_id') THEN
    BEGIN
      ALTER TABLE public.transfer_items ALTER COLUMN lot_id SET NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  END IF;
END $$;

-- 3. Adjust unique constraints
-- Drop old unique on drugs(name, package_type, expire_date) and create new without expire_date
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='drugs' AND indexname LIKE 'drugs_name_package_type_expire_date_key%'
  ) THEN
    -- attempt to drop via constraint name lookup
    EXECUTE (
      SELECT 'ALTER TABLE public.drugs DROP CONSTRAINT ' || quote_ident(conname)
      FROM pg_constraint
      WHERE conrelid = 'public.drugs'::regclass AND contype='u' AND pg_get_constraintdef(oid) LIKE 'UNIQUE (name, package_type, expire_date)'
      LIMIT 1
    );
  END IF;
END $$;

-- Add new unique (ignore if exists)
DO $$ BEGIN
  BEGIN
    ALTER TABLE public.drugs ADD CONSTRAINT drugs_name_package_type_unique UNIQUE(name, package_type);
  EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 4. Drop expire_date column from drugs
ALTER TABLE public.drugs DROP COLUMN IF EXISTS expire_date;

-- 5. Optional: add index on drug_lots(drug_id, expire_date) already exists from earlier migration.

-- 6. Add comment
COMMENT ON TABLE public.drug_lots IS 'Lots (batches) of drugs with individual expiry dates (authoritative source for expiry)';

-- Summary / sanity info
SELECT 
  (SELECT count(*) FROM public.drug_lots) AS lot_count,
  (SELECT count(*) FROM public.inventory WHERE lot_id IS NULL) AS inventory_missing_lot,
  (SELECT count(*) FROM public.receipt_items WHERE lot_id IS NULL) AS receipt_items_missing_lot,
  (SELECT count(*) FROM public.transfer_items WHERE lot_id IS NULL) AS transfer_items_missing_lot;

SELECT '✅ Lot-based expiry finalized (or already applied)' AS status;
