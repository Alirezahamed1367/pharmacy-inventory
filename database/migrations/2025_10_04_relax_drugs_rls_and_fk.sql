-- Relax drugs RLS further (optional) and adjust FK warehouses.manager_user_id ON DELETE SET NULL
-- Use only if RLS blocking inserts due to missing auth session.
-- Safe to re-run (IF EXISTS guards) .

BEGIN;

-- Adjust FK (drop and recreate)
ALTER TABLE public.warehouses DROP CONSTRAINT IF EXISTS warehouses_manager_user_id_fkey;
ALTER TABLE public.warehouses
  ADD CONSTRAINT warehouses_manager_user_id_fkey
  FOREIGN KEY (manager_user_id)
  REFERENCES public.users(id)
  ON DELETE SET NULL;

-- Optional: broaden insert policy if previous one still failing due to auth.uid() null
DROP POLICY IF EXISTS drugs_insert_any_logged ON public.drugs;
CREATE POLICY drugs_insert_any_logged
  ON public.drugs FOR INSERT
  WITH CHECK (true); -- TEMPORARY: allow all (replace later when Supabase Auth integrated)

COMMIT;
