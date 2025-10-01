-- 📊 داده‌های نمونه برای تست سیستم
-- 👨‍💻 طراحی: علیرضا حامد - پاییز 1404
-- 🎯 هدف: تست عملکرد سیستم با داده‌های واقعی

-- ⚠️  این فایل فقط برای تست و آموزش است
-- در محیط production اجرا نکنید

-- ===== داروهای نمونه =====
INSERT INTO drugs (
    name, generic_name, category, form, strength, unit, 
    manufacturer, price, minimum_stock, description
) VALUES 
-- مسکن‌ها
('استامینوفن', 'Acetaminophen', 'مسکن', 'قرص', '500mg', 'عدد', 
 'شرکت دارو پخش', 1500, 50, 'مسکن و تب‌بر عمومی'),

('ایبوپروفن', 'Ibuprofen', 'مسکن', 'قرص', '400mg', 'عدد',
 'داروسازی البرز', 2000, 30, 'ضد التهاب و مسکن'),

('آسپرین', 'Aspirin', 'مسکن', 'قرص', '80mg', 'عدد',
 'شرکت سینا دارو', 800, 100, 'مسکن و ضد انعقاد'),

-- آنتی‌بیوتیک‌ها
('آموکسی‌سیلین', 'Amoxicillin', 'آنتی‌بیوتیک', 'کپسول', '500mg', 'عدد',
 'شرکت طب داری', 5000, 20, 'آنتی‌بیوتیک پنی‌سیلینی'),

('آزیترومایسین', 'Azithromycin', 'آنتی‌بیوتیک', 'قرص', '250mg', 'عدد',
 'داروسازی پارس', 8000, 15, 'آنتی‌بیوتیک ماکرولید'),

-- ویتامین‌ها
('ویتامین D3', 'Cholecalciferol', 'ویتامین', 'قرص', '1000IU', 'عدد',
 'شرکت زهراوی', 3000, 40, 'تقویت استخوان و ایمنی'),

('ویتامین C', 'Ascorbic Acid', 'ویتامین', 'قرص جویدنی', '500mg', 'عدد',
 'داروسازی کیمیا', 1200, 60, 'تقویت سیستم ایمنی'),

-- داروهای گوارشی
('امپرازول', 'Omeprazole', 'گوارشی', 'کپسول', '20mg', 'عدد',
 'شرکت دارو پخش', 4500, 25, 'درمان زخم معده'),

('سیمتیکون', 'Simethicone', 'گوارشی', 'قرص', '40mg', 'عدد',
 'داروسازی البرز', 2200, 35, 'رفع نفخ شکم'),

-- داروهای قلبی
('آتورواستاتین', 'Atorvastatin', 'قلبی-عروقی', 'قرص', '20mg', 'عدد',
 'شرکت سینا دارو', 12000, 10, 'کاهش کلسترول');

-- ===== موجودی انبار =====
INSERT INTO inventory (
    drug_id, warehouse_id, quantity, batch_number, expiry_date, cost_price, selling_price
) 
SELECT 
    d.id,
    w.id,
    CASE 
        WHEN d.name = 'استامینوفن' THEN 150
        WHEN d.name = 'ایبوپروفن' THEN 80
        WHEN d.name = 'آسپرین' THEN 200
        WHEN d.name = 'آموکسی‌سیلین' THEN 45
        WHEN d.name = 'آزیترومایسین' THEN 30
        WHEN d.name = 'ویتامین D3' THEN 120
        WHEN d.name = 'ویتامین C' THEN 180
        WHEN d.name = 'امپرازول' THEN 60
        WHEN d.name = 'سیمتیکون' THEN 90
        WHEN d.name = 'آتورواستاتین' THEN 25
        ELSE 50
    END as quantity,
    'BATCH-' || UPPER(SUBSTRING(d.name FROM 1 FOR 3)) || '-2024',
    CURRENT_DATE + INTERVAL '1 year',
    d.price * 0.7, -- قیمت خرید 70% قیمت فروش
    d.price
FROM drugs d
CROSS JOIN warehouses w
WHERE w.code = 'MAIN';

-- ===== تحرکات موجودی نمونه =====
INSERT INTO inventory_movements (
    inventory_id, movement_type, quantity, remaining_quantity, 
    unit_price, total_price, reference_number, notes
)
SELECT 
    i.id,
    'in',
    i.quantity,
    i.quantity,
    i.cost_price,
    i.cost_price * i.quantity,
    'REC-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-001',
    'موجودی اولیه'
FROM inventory i
LIMIT 10;

-- ===== اعلانات نمونه =====
INSERT INTO notifications (
    user_id, type, title, message
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'system',
    'خوش آمدید',
    'سیستم مدیریت انبار با موفقیت راه‌اندازی شد'
),
(
    '00000000-0000-0000-0000-000000000002',
    'low_stock',
    'موجودی کم',
    'موجودی برخی داروها کمتر از حد مجاز است'
);

-- ===== گزارش نهایی =====
DO $$
DECLARE
    drug_count INTEGER;
    inventory_count INTEGER;
    movement_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO drug_count FROM drugs;
    SELECT COUNT(*) INTO inventory_count FROM inventory;
    SELECT COUNT(*) INTO movement_count FROM inventory_movements;
    
    RAISE NOTICE '📊 داده‌های نمونه با موفقیت اضافه شد:';
    RAISE NOTICE '   💊 داروها: %', drug_count;
    RAISE NOTICE '   📦 موجودی: %', inventory_count;
    RAISE NOTICE '   📈 تحرکات: %', movement_count;
    RAISE NOTICE '✅ سیستم آماده تست است!';
END $$;

-- ===== نکات مهم =====
/*
💡 راهنمای استفاده:

1️⃣ ابتدا schema.sql را اجرا کنید
2️⃣ سپس این فایل را اجرا کنید
3️⃣ با کاربر superadmin وارد شوید
4️⃣ عملکرد سیستم را تست کنید

📋 موارد تست شده:
✅ 10 دارو در دسته‌های مختلف
✅ موجودی در انبار اصلی
✅ تحرکات ورودی
✅ اعلانات سیستم

⚠️  توجه:
- این داده‌ها فقط برای تست هستند
- در production حذف کنید
- با داده‌های واقعی جایگزین کنید

👨‍💻 توسعه‌دهنده: علیرضا حامد
📧 ایمیل: alireza.h67@gmail.com
*/