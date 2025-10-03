-- Phase 2: Enforce NOT NULL on lot_id columns after successful backfill
-- Preconditions: Run scripts/auditLots.mjs and ensure all checks PASS
-- If any NULL exists this migration will abort with an exception.

BEGIN;

-- Safety checks
DO $$
DECLARE
  inv_nulls int;
  rec_nulls int;
  trf_nulls int;
BEGIN
  SELECT count(*) INTO inv_nulls FROM inventory WHERE lot_id IS NULL;
  SELECT count(*) INTO rec_nulls FROM receipt_items WHERE lot_id IS NULL;
  SELECT count(*) INTO trf_nulls FROM transfer_items WHERE lot_id IS NULL;

  IF inv_nulls > 0 OR rec_nulls > 0 OR trf_nulls > 0 THEN
    RAISE EXCEPTION USING MESSAGE = format('Cannot enforce NOT NULL: NULL counts => inventory=%s receipt_items=%s transfer_items=%s', inv_nulls, rec_nulls, trf_nulls);
  END IF;
END$$;

-- Apply NOT NULL constraints
ALTER TABLE inventory      ALTER COLUMN lot_id SET NOT NULL;
ALTER TABLE receipt_items  ALTER COLUMN lot_id SET NOT NULL;
ALTER TABLE transfer_items ALTER COLUMN lot_id SET NOT NULL;

COMMIT;
