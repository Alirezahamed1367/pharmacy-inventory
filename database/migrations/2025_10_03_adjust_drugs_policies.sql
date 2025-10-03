-- Adjust drugs RLS policies to allow admins and managers to INSERT while keeping UPDATE/DELETE admin-only
-- This is a patch after Phase 1 RLS where ALL operations were restricted to admins.
-- Safe to run multiple times (DROP POLICY IF EXISTS used).

BEGIN;

-- Drop old broad policy
DROP POLICY IF EXISTS drugs_write_admin ON public.drugs;

-- Insert: admin OR manager (assuming auth.uid() provided by future auth integration)
CREATE POLICY drugs_insert_admin_manager
  ON public.drugs FOR INSERT
  WITH CHECK (is_admin() OR is_manager());

-- Update: only admin
CREATE POLICY drugs_update_admin
  ON public.drugs FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Delete: only admin
CREATE POLICY drugs_delete_admin
  ON public.drugs FOR DELETE
  USING (is_admin());

COMMIT;
