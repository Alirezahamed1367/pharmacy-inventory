-- Recommended performance indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_drugs_expire_date ON public.drugs(expire_date);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON public.inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_drug_warehouse ON public.inventory(drug_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.transfers(status);
