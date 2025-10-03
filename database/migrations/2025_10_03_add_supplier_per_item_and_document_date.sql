-- Migration: Add supplier per receipt item and document_date to receipts & transfers
-- تاریخ: 1404-07-11
-- نویسنده: علیرضا حامد

-- 1) افزودن ستون supplier_id به receipt_items (اختیاری – هر آیتم می‌تواند تامین‌کننده مستقل داشته باشد)
ALTER TABLE public.receipt_items ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id);

-- 2) افزودن ستون document_date به receipts و transfers برای تاریخ سند (پیش‌فرض تاریخ ایجاد)
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS document_date DATE DEFAULT (CURRENT_DATE);
ALTER TABLE public.transfers ADD COLUMN IF NOT EXISTS document_date DATE DEFAULT (CURRENT_DATE);

-- ایندکس کمکی برای گزارش‌گیری بر اساس تاریخ سند
CREATE INDEX IF NOT EXISTS idx_receipts_document_date ON public.receipts(document_date);
CREATE INDEX IF NOT EXISTS idx_transfers_document_date ON public.transfers(document_date);

-- نمایش پیام
SELECT '✅ Migration 2025_10_03 applied (supplier per item + document_date).' as status;
