# پایش روابط و استراتژی حذف (ON DELETE) جداول اصلی

این سند پیشنهادهای به‌روزشده برای سیاست‌های حذف (ON DELETE ...) و رفتار ایمن در سیستم فعلی (نسخه Fast Track بدون RLS فعال) را مستند می‌کند.

## اهداف طراحی
- حفظ تاریخچه اسناد (رسید / حواله) حتی پس از حذف/غیرفعالسازی رکوردهای مرجع
- جلوگیری از حذف ناخواسته و از دست رفتن داده با ارزش (اثر آبشاری ناخواسته)
- امکان پاکسازی آسان «موجودی» یتیم و داده‌های موقتی
- ساده نگه‌داشتن منطق فرانت‌اند: پیام‌های کاربرپسند هنگام تلاش برای حذف موجودی مرجع‌دار

## جداول و روابط کلیدی
| جدول | مراجع به | توسط چه جدولی ارجاع می‌شود | اهمیت تاریخچه |
|------|-----------|-----------------------------|----------------|
| drugs | — | inventory, receipt_items | متوسط (receipt_items تاریخچه را می‌سازد) |
| inventory | drugs, warehouses | transfer_items | پایین تا متوسط (قابل بازسازی از اسناد) |
| receipts | warehouses, suppliers | receipt_items | بالا (سند رسمی ورود) |
| receipt_items | receipts, drugs | — | بالا (جزئیات سند) |
| transfers | warehouses, users | transfer_items | بالا (سند جابجایی) |
| transfer_items | transfers, inventory | — | بالا (جزئیات جابجایی + مغایرت) |
| drug_lots (در نسخه lot) | drugs | inventory (lot_id), receipt_items? | متوسط تا بالا |

## وضعیت فعلی (schema.sql اصلی V2)
- inventory.drug_id ON DELETE RESTRICT (مانع حذف دارو در صورت وجود موجودی)
- receipt_items.drug_id بدون ON DELETE (پیش‌فرض RESTRICT)
- transfer_items.inventory_id بدون ON DELETE (پیش‌فرض RESTRICT)
- receipt_items.receipt_id ON DELETE CASCADE (حذف receipt آیتم‌ها را پاک می‌کند)
- transfer_items.transfer_id ON DELETE CASCADE

## مشکلات مشاهده‌شده
1. "حذف دارو" خطای FK (طبیعی به خاطر موجودی؛ نیاز به پیام دوستانه – پیاده‌سازی شد).
2. نیاز به حذف رسید/حواله در حالت پیش‌نویس: پیاده‌سازی حذف فقط در وضعیت pending/in_transit انجام شد.
3. احتمال باقی‌ماندن رکوردهای inventory با quantity=0 (تمیزکاری دوره‌ای لازم است).

## پیشنهاد استراتژی نهایی
| رابطه | پیشنهاد ON DELETE | دلیل |
|-------|-------------------|-------|
| inventory.drug_id -> drugs.id | RESTRICT (فعلی) | جلوگیری از حذف دارویی که هنوز موجودی دارد؛ کاربر باید موجودی را صفر کند.
| receipt_items.drug_id -> drugs.id | RESTRICT | حفظ تاریخچه؛ حذف دارو مانع می‌شود → راهکار: «غیرفعالسازی» آتی.
| transfer_items.inventory_id -> inventory.id | CASCADE یا SET NULL + آرشیو | اگر inventory بعداً پاکسازی شود، آیتم حواله نباید بلا استفاده بماند. گزینه بهتر: snapshot داده در transfer_items.
| inventory.warehouse_id -> warehouses.id | CASCADE (فعلی) | حذف کامل انبار باید موجودی مرتبط را ببرد.
| receipts.destination_warehouse_id | RESTRICT | جلوگیری از orphan تاریخی؛ قبل از حذف انبار باید اسناد منتقل/بسته شوند.
| transfers.source_warehouse_id/destination_warehouse_id | RESTRICT | عدم از دست رفتن ردیابی مسیر.
| transfer_items.transfer_id | CASCADE (فعلی) | حذف پیش‌نویس حواله، آیتم‌ها را حذف می‌کند.
| receipt_items.receipt_id | CASCADE (فعلی) | حذف پیش‌نویس رسید، آیتم‌ها را حذف می‌کند.
| inventory.lot_id -> drug_lots.id | RESTRICT | جلوگیری از حذف lot که هنوز موجودی دارد.
| drug_lots.drug_id -> drugs.id | RESTRICT | یک lot بدون داروی مادر بی‌معنی است.

## تغییرات بالقوه آینده
1. ستون `is_active` (افزوده شد) برای «غیرفعال‌سازی» به جای حذف فیزیکی.
2. Snapshot فیلدهای حیاتی (name, expire_date) داخل `receipt_items` و `transfer_items` (افزوده شد) — در آینده می‌توان lot_number را هم اضافه کرد.
3. اسکریپت پاکسازی `cleanupZeroInventory.mjs` (افزوده شد) برای حذف امن موجودی صفر بدون ارجاع.
4. گسترش احتمالی snapshot با lot_number و package_type.
5. افزودن ایندکس‌های ترکیبی بیشتر برای عملکرد FEFO (lot_id, expire_date) در صورت حجم بالا.

## الگوی حذف پیشنهادی (Pseudo Flow)
- حذف دارو: اگر موجودی یا receipt_items → مسدود و پیام؛ در غیر این صورت حذف.
- حذف رسید pending: CASCADE روی receipt_items → انجام می‌شود.
- حذف حواله in_transit: CASCADE روی transfer_items → انجام می‌شود؛ اگر وضعیت completed/discrepancy → مسدود.

## پیام‌های کاربرپسند (Already Implemented / To Implement)
- Drug deletion blocked: "این دارو در موجودی یا اسناد استفاده شده است..."
- Receipt deletion blocked (backend rule): "رسید تکمیل شده قابل حذف نیست."
- Transfer deletion blocked: "حواله تکمیل/مغایرت قابل حذف نیست."

## اسکریپت‌های پشتیبان پیشنهادی
ایجاد فایل scripts/cleanupZeroInventory.mjs:
1. انتخاب inventory با quantity=0
2. بررسی عدم وجود reference در transfer_items
3. حذف رکورد

(در فاز بعد اضافه می‌شود.)

## جمع‌بندی
الگوی فعلی با حداقل تغییر در ساختار پایگاه داده و افزوده شدن پیام‌های توصیفی در لایه سرویس، نیاز عملیاتی فعلی (Fast Track) را پوشش می‌دهد. برای مرحله امنیت/RLS کامل، «غیرفعال‌سازی منطقی» داروها و snapshot داده‌های حیاتی در آیتم‌های اسناد توصیه می‌شود.

---
طراحی و توسعه نرم‌افزار توسط علیرضا حامد در پاییز 1404
