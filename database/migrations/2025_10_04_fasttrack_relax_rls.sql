-- Fast Track Migration: disable RLS for rapid deployment & testing
-- NOTE: This reduces security. Re-enable and apply fine-grained policies when Supabase Auth integration is complete.

BEGIN;

-- Disable RLS on core domain tables (idempotent safe if already disabled)
ALTER TABLE IF EXISTS public.drugs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.drug_lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipt_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transfer_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.warehouses DISABLE ROW LEVEL SECURITY;

-- Keep negative inventory trigger intact (no change here)
-- (Assumes trigger already created in prior migration.)

COMMIT;
