-- Migration: Enable RLS Phase 1 (policies for admin/manager)
-- Date: 2025-10-03
-- NOTE: Apply after confirming lot adoption.

-- 1. Helper functions
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE AS $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_manager() RETURNS boolean LANGUAGE sql STABLE AS $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'manager');
$$;

-- 2. Enable RLS on target tables
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_lots ENABLE ROW LEVEL SECURITY;

-- 3. Base policies
-- Warehouses
CREATE POLICY wh_select_admin ON public.warehouses FOR SELECT USING (is_admin());
CREATE POLICY wh_select_manager ON public.warehouses FOR SELECT USING (is_manager() AND manager_user_id = auth.uid());

-- Inventory
CREATE POLICY inv_select_admin ON public.inventory FOR SELECT USING (is_admin());
CREATE POLICY inv_select_manager ON public.inventory FOR SELECT USING (
  is_manager() AND warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
);
CREATE POLICY inv_update_admin ON public.inventory FOR UPDATE USING (is_admin()) WITH CHECK (true);
CREATE POLICY inv_update_manager ON public.inventory FOR UPDATE USING (
  is_manager() AND warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
) WITH CHECK (warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid()));

-- Receipts
CREATE POLICY receipts_select_admin ON public.receipts FOR SELECT USING (is_admin());
CREATE POLICY receipts_select_manager ON public.receipts FOR SELECT USING (
  is_manager() AND destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
);
CREATE POLICY receipts_insert_admin ON public.receipts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY receipts_insert_manager ON public.receipts FOR INSERT WITH CHECK (
  is_manager() AND destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
);
CREATE POLICY receipts_update_admin ON public.receipts FOR UPDATE USING (is_admin()) WITH CHECK (true);
CREATE POLICY receipts_update_manager ON public.receipts FOR UPDATE USING (
  is_manager() AND destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
) WITH CHECK (destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid()));

-- Receipt Items (inherit parent)
CREATE POLICY receipt_items_select_admin ON public.receipt_items FOR SELECT USING (is_admin());
CREATE POLICY receipt_items_select_manager ON public.receipt_items FOR SELECT USING (
  is_manager() AND receipt_id IN (
    SELECT id FROM public.receipts WHERE destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
  )
);
CREATE POLICY receipt_items_insert_admin ON public.receipt_items FOR INSERT WITH CHECK (is_admin());
CREATE POLICY receipt_items_insert_manager ON public.receipt_items FOR INSERT WITH CHECK (
  is_manager() AND receipt_id IN (
    SELECT id FROM public.receipts WHERE destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
  )
);
CREATE POLICY receipt_items_update_admin ON public.receipt_items FOR UPDATE USING (is_admin()) WITH CHECK (true);
CREATE POLICY receipt_items_update_manager ON public.receipt_items FOR UPDATE USING (
  is_manager() AND receipt_id IN (
    SELECT id FROM public.receipts WHERE destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
  )
) WITH CHECK (receipt_id IN (
  SELECT id FROM public.receipts WHERE destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
));

-- Transfers
CREATE POLICY transfers_select_admin ON public.transfers FOR SELECT USING (is_admin());
CREATE POLICY transfers_select_manager ON public.transfers FOR SELECT USING (
  is_manager() AND (
    source_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid()) OR
    destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
  )
);
CREATE POLICY transfers_insert_admin ON public.transfers FOR INSERT WITH CHECK (is_admin());
CREATE POLICY transfers_insert_manager ON public.transfers FOR INSERT WITH CHECK (
  is_manager() AND source_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
);
CREATE POLICY transfers_update_admin ON public.transfers FOR UPDATE USING (is_admin()) WITH CHECK (true);
CREATE POLICY transfers_update_manager ON public.transfers FOR UPDATE USING (
  is_manager() AND (
    source_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid()) OR
    destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
  )
) WITH CHECK (true);

-- Transfer Items
CREATE POLICY transfer_items_select_admin ON public.transfer_items FOR SELECT USING (is_admin());
CREATE POLICY transfer_items_select_manager ON public.transfer_items FOR SELECT USING (
  is_manager() AND transfer_id IN (
    SELECT id FROM public.transfers WHERE (
      source_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid()) OR
      destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
    )
  )
);
CREATE POLICY transfer_items_insert_admin ON public.transfer_items FOR INSERT WITH CHECK (is_admin());
CREATE POLICY transfer_items_insert_manager ON public.transfer_items FOR INSERT WITH CHECK (
  is_manager() AND transfer_id IN (
    SELECT id FROM public.transfers WHERE source_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
  )
);
CREATE POLICY transfer_items_update_admin ON public.transfer_items FOR UPDATE USING (is_admin()) WITH CHECK (true);
CREATE POLICY transfer_items_update_manager ON public.transfer_items FOR UPDATE USING (
  is_manager() AND transfer_id IN (
    SELECT id FROM public.transfers WHERE (
      source_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid()) OR
      destination_warehouse_id IN (SELECT id FROM public.warehouses WHERE manager_user_id = auth.uid())
    )
  )
) WITH CHECK (true);

-- Drugs (read-only to all logged-in; write admin)
CREATE POLICY drugs_select_admin ON public.drugs FOR SELECT USING (is_admin());
CREATE POLICY drugs_select_all ON public.drugs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY drugs_write_admin ON public.drugs FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Drug Lots (read all logged-in, write admin)
CREATE POLICY lots_select_admin ON public.drug_lots FOR SELECT USING (is_admin());
CREATE POLICY lots_select_all ON public.drug_lots FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY lots_write_admin ON public.drug_lots FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 4. Prevent negative inventory (trigger)
CREATE OR REPLACE FUNCTION public.prevent_negative_inventory() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.quantity < 0 THEN
    RAISE EXCEPTION 'Inventory cannot be negative';
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_no_negative_inventory ON public.inventory;
CREATE TRIGGER trg_no_negative_inventory BEFORE INSERT OR UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.prevent_negative_inventory();

COMMENT ON FUNCTION public.is_admin IS 'Checks if current auth user has admin role';
COMMENT ON FUNCTION public.is_manager IS 'Checks if current auth user has manager role';
COMMENT ON FUNCTION public.prevent_negative_inventory IS 'Disallow inventory rows with negative quantity';

-- End of RLS Phase 1