-- Migration: performance indexes for lot-centric queries
-- Date: 2025-10-04
-- Adds helpful indexes if not present (idempotent)

-- inventory lookups by (warehouse, drug, lot)
CREATE INDEX IF NOT EXISTS idx_inventory_wh_drug_lot ON public.inventory(warehouse_id, drug_id, lot_id);
-- inventory FEFO ordering by lot expiry (via join) can benefit from partial index on lot_id for non-zero qty
CREATE INDEX IF NOT EXISTS idx_inventory_lot_id_qty ON public.inventory(lot_id) WHERE quantity > 0;
-- receipt_items filtering per receipt
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON public.receipt_items(receipt_id);
-- transfer_items filtering per transfer
CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer_id ON public.transfer_items(transfer_id);
-- drug_lots expiry scans
CREATE INDEX IF NOT EXISTS idx_drug_lots_expire_lotnum ON public.drug_lots(expire_date, lot_number);

SELECT '✅ Performance indexes applied (or already existed).' AS status;
