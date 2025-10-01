// داده‌های پایه سیستم - دارو، تامین‌کنندگان، انبارها
// Base System Data - Drugs, Suppliers, Warehouses

// بانک اطلاعات داروها با تاریخ انقضا
export const DRUGS_DATABASE = [
  // استامینوفن با تاریخ‌های مختلف
  {
    id: 'acetaminophen_500_2024_12_15',
    name: 'استامینوفن 500mg',
    genericName: 'استامینوفن',
    dosage: '500mg',
    form: 'قرص',
    expiryDate: '2024-12-15',
    manufacturer: 'شرکت داروسازی سینا',
    batchNumber: 'ACT-500-001',
    barcode: '6260123456789',
    category: 'مسکن',
    activeIngredient: 'استامینوفن',
    unit: 'جعبه'
  },
  {
    id: 'acetaminophen_500_2025_03_10',
    name: 'استامینوفن 500mg',
    genericName: 'استامینوفن',
    dosage: '500mg',
    form: 'قرص',
    expiryDate: '2026-03-10',
    manufacturer: 'شرکت داروسازی سینا',
    batchNumber: 'ACT-500-002',
    barcode: '6260123456790',
    category: 'مسکن',
    activeIngredient: 'استامینوفن',
    unit: 'جعبه'
  },
  {
    id: 'acetaminophen_500_2025_06_22',
    name: 'استامینوفن 500mg',
    genericName: 'استامینوفن',
    dosage: '500mg',
    form: 'قرص',
    expiryDate: '2026-06-22',
    manufacturer: 'شرکت داروسازی سینا',
    batchNumber: 'ACT-500-003',
    barcode: '6260123456791',
    category: 'مسکن',
    activeIngredient: 'استامینوفن',
    unit: 'جعبه'
  },
  
  // ایبوپروفن با تاریخ‌های مختلف
  {
    id: 'ibuprofen_400_2024_11_30',
    name: 'ایبوپروفن 400mg',
    genericName: 'ایبوپروفن',
    dosage: '400mg',
    form: 'قرص',
    expiryDate: '2024-11-30',
    manufacturer: 'شرکت طب داری',
    batchNumber: 'IBU-400-001',
    barcode: '6260234567890',
    category: 'ضد التهاب',
    activeIngredient: 'ایبوپروفن',
    unit: 'جعبه'
  },
  {
    id: 'ibuprofen_400_2025_04_15',
    name: 'ایبوپروفن 400mg',
    genericName: 'ایبوپروفن',
    dosage: '400mg',
    form: 'قرص',
    expiryDate: '2025-04-15',
    manufacturer: 'شرکت طب داری',
    batchNumber: 'IBU-400-002',
    barcode: '6260234567891',
    category: 'ضد التهاب',
    activeIngredient: 'ایبوپروفن',
    unit: 'جعبه'
  },
  
  // پنی‌سیلین با تاریخ‌های مختلف
  {
    id: 'penicillin_250_2024_10_20',
    name: 'پنی‌سیلین 250mg',
    genericName: 'پنی‌سیلین',
    dosage: '250mg',
    form: 'کپسول',
    expiryDate: '2024-10-20',
    manufacturer: 'داروخانه مرکزی ایران',
    batchNumber: 'PEN-250-001',
    barcode: '6260345678901',
    category: 'آنتی بیوتیک',
    activeIngredient: 'پنی‌سیلین جی',
    unit: 'عدد'
  },
  {
    id: 'penicillin_250_2025_02_28',
    name: 'پنی‌سیلین 250mg',
    genericName: 'پنی‌سیلین',
    dosage: '250mg',
    form: 'کپسول',
    expiryDate: '2025-02-28',
    manufacturer: 'داروخانه مرکزی ایران',
    batchNumber: 'PEN-250-002',
    barcode: '6260345678902',
    category: 'آنتی بیوتیک',
    activeIngredient: 'پنی‌سیلین جی',
    unit: 'عدد'
  },
  
  // آموکسی‌سیلین
  {
    id: 'amoxicillin_500_2025_01_10',
    name: 'آموکسی‌سیلین 500mg',
    genericName: 'آموکسی‌سیلین',
    dosage: '500mg',
    form: 'کپسول',
    expiryDate: '2025-01-10',
    manufacturer: 'شرکت پخش البرز',
    batchNumber: 'AMX-500-001',
    barcode: '6260456789012',
    category: 'آنتی بیوتیک',
    activeIngredient: 'آموکسی‌سیلین',
    unit: 'جعبه'
  },
  
  // سیپروفلوکساسین
  {
    id: 'ciprofloxacin_500_2025_03_20',
    name: 'سیپروفلوکساسین 500mg',
    genericName: 'سیپروفلوکساسین',
    dosage: '500mg',
    form: 'قرص',
    expiryDate: '2025-03-20',
    manufacturer: 'شرکت داروسازی سینا',
    batchNumber: 'CIP-500-001',
    barcode: '6260567890123',
    category: 'آنتی بیوتیک',
    activeIngredient: 'سیپروفلوکساسین',
    unit: 'جعبه'
  },
  
  // لوپرامید
  {
    id: 'loperamide_2_2025_05_15',
    name: 'لوپرامید 2mg',
    genericName: 'لوپرامید',
    dosage: '2mg',
    form: 'قرص',
    expiryDate: '2025-05-15',
    manufacturer: 'شرکت طب داری',
    batchNumber: 'LOP-2-001',
    barcode: '6260678901234',
    category: 'گوارشی',
    activeIngredient: 'لوپرامید هیدروکلراید',
    unit: 'جعبه'
  },
  
  // اومپرازول
  {
    id: 'omeprazole_20_2025_04_30',
    name: 'اومپرازول 20mg',
    genericName: 'اومپرازول',
    dosage: '20mg',
    form: 'کپسول',
    expiryDate: '2025-04-30',
    manufacturer: 'داروخانه مرکزی ایران',
    batchNumber: 'OMP-20-001',
    barcode: '6260789012345',
    category: 'گوارشی',
    activeIngredient: 'اومپرازول',
    unit: 'جعبه'
  },
  
  // متفورمین
  {
    id: 'metformin_500_2025_06_10',
    name: 'متفورمین 500mg',
    genericName: 'متفورمین',
    dosage: '500mg',
    form: 'قرص',
    expiryDate: '2025-06-10',
    manufacturer: 'شرکت پخش البرز',
    batchNumber: 'MET-500-001',
    barcode: '6260890123456',
    category: 'دیابت',
    activeIngredient: 'متفورمین هیدروکلراید',
    unit: 'جعبه'
  }
];

// تامین‌کنندگان
export const SUPPLIERS = [
  {
    id: 1,
    name: 'شرکت داروسازی سینا',
    code: 'SINA-001',
    phone: '021-12345678',
    email: 'info@sina-pharma.com',
    address: 'تهران، خیابان ولیعصر، پلاک 123',
    contact: 'احمد رضایی',
    contactPhone: '0912-1234567',
    specialties: ['مسکن', 'آنتی بیوتیک'],
    rating: 4.8,
    isActive: true
  },
  {
    id: 2,
    name: 'شرکت طب داری',
    code: 'TEBDARI-002',
    phone: '021-87654321',
    email: 'sales@tebdari.com',
    address: 'تهران، خیابان کریمخان، پلاک 456',
    contact: 'فاطمه کریمی',
    contactPhone: '0912-2345678',
    specialties: ['ضد التهاب', 'گوارشی'],
    rating: 4.6,
    isActive: true
  },
  {
    id: 3,
    name: 'داروخانه مرکزی ایران',
    code: 'CENTRAL-003',
    phone: '021-11223344',
    email: 'orders@central-pharma.ir',
    address: 'تهران، میدان تجریش، پلاک 789',
    contact: 'محمد حسینی',
    contactPhone: '0912-3456789',
    specialties: ['آنتی بیوتیک', 'گوارشی'],
    rating: 4.7,
    isActive: true
  },
  {
    id: 4,
    name: 'شرکت پخش البرز',
    code: 'ALBORZ-004',
    phone: '021-55667788',
    email: 'info@alborz-dist.com',
    address: 'کرج، خیابان فردوسی، پلاک 321',
    contact: 'علی محمدی',
    contactPhone: '0912-4567890',
    specialties: ['دیابت', 'قلبی عروقی'],
    rating: 4.5,
    isActive: true
  }
];

// انبارها
export const WAREHOUSES = [
  {
    id: 1,
    name: 'انبار مرکزی',
    code: 'WH-001',
    address: 'تهران، شهرک صنعتی شمس آباد',
    manager: 'سارا احمدی',
    phone: '021-44556677',
    capacity: 10000,
    currentOccupancy: 7500,
    type: 'primary',
    isActive: true,
    climateControlled: true
  },
  {
    id: 2,
    name: 'انبار شعبه شرق',
    code: 'WH-002',
    address: 'تهران، خیابان دماوند',
    manager: 'رضا موسوی',
    phone: '021-33445566',
    capacity: 5000,
    currentOccupancy: 3200,
    type: 'branch',
    isActive: true,
    climateControlled: true
  },
  {
    id: 3,
    name: 'انبار شعبه غرب',
    code: 'WH-003',
    address: 'تهران، خیابان ستاری',
    manager: 'مینا کریمی',
    phone: '021-22334455',
    capacity: 4000,
    currentOccupancy: 2800,
    type: 'branch',
    isActive: true,
    climateControlled: false
  },
  {
    id: 4,
    name: 'انبار شعبه شمال',
    code: 'WH-004',
    address: 'تهران، خیابان شریعتی',
    manager: 'امیر حسینی',
    phone: '021-11223344',
    capacity: 3000,
    currentOccupancy: 1900,
    type: 'branch',
    isActive: true,
    climateControlled: true
  },
  {
    id: 5,
    name: 'انبار شعبه جنوب',
    code: 'WH-005',
    address: 'تهران، خیابان آزادگان',
    manager: 'لیلا رضایی',
    phone: '021-99887766',
    capacity: 3500,
    currentOccupancy: 2100,
    type: 'branch',
    isActive: true,
    climateControlled: false
  },
  {
    id: 99,
    name: 'انبار کالا در راه',
    code: 'WH-TRANSIT',
    address: 'انبار موقت',
    manager: 'سیستم',
    phone: '-',
    capacity: 999999,
    currentOccupancy: 0,
    type: 'transit',
    isActive: true,
    climateControlled: false
  }
];

// واحدهای اندازه‌گیری
export const UNITS = [
  { id: 'box', name: 'جعبه', symbol: 'جعبه' },
  { id: 'piece', name: 'عدد', symbol: 'عدد' },
  { id: 'bottle', name: 'شیشه', symbol: 'شیشه' },
  { id: 'tube', name: 'تیوب', symbol: 'تیوب' },
  { id: 'vial', name: 'ویال', symbol: 'ویال' },
  { id: 'ampoule', name: 'آمپول', symbol: 'آمپول' },
  { id: 'sachet', name: 'ساشه', symbol: 'ساشه' },
  { id: 'strip', name: 'استریپ', symbol: 'استریپ' }
];

// دسته‌بندی داروها
export const DRUG_CATEGORIES = [
  { id: 'analgesic', name: 'مسکن', color: 'blue' },
  { id: 'antibiotic', name: 'آنتی بیوتیک', color: 'green' },
  { id: 'anti_inflammatory', name: 'ضد التهاب', color: 'orange' },
  { id: 'gastrointestinal', name: 'گوارشی', color: 'purple' },
  { id: 'diabetes', name: 'دیابت', color: 'red' },
  { id: 'cardiovascular', name: 'قلبی عروقی', color: 'pink' },
  { id: 'respiratory', name: 'تنفسی', color: 'cyan' },
  { id: 'neurological', name: 'عصبی', color: 'indigo' },
  { id: 'vitamins', name: 'ویتامین و مکمل', color: 'yellow' },
  { id: 'other', name: 'سایر', color: 'gray' }
];

// Helper Functions برای کار با داده‌ها

// گرفتن لیست داروها بر اساس تاریخ انقضا (نزدیک‌ترین تاریخ اول)
export const getDrugsSortedByExpiry = () => {
  return [...DRUGS_DATABASE].sort((a, b) => {
    const dateA = new Date(a.expiryDate.replace(/\//g, '-'));
    const dateB = new Date(b.expiryDate.replace(/\//g, '-'));
    return dateA - dateB;
  });
};

// گرفتن لیست داروها بر اساس نام (الفبایی)
export const getDrugsSortedByName = () => {
  return [...DRUGS_DATABASE].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
};

// گرفتن لیست داروها بر اساس موجودی و تاریخ انقضا (اولویت‌بندی هوشمند)
export const getDrugsSortedSmart = () => {
  return [...DRUGS_DATABASE].sort((a, b) => {
    // ابتدا بر اساس تاریخ انقضا (نزدیک‌ترین اول)
    const dateA = new Date(a.expiryDate); // حالا که فرمت میلادی است نیازی به replace نیست
    const dateB = new Date(b.expiryDate);
    const dateDiff = dateA - dateB;
    
    // اگر تفاوت تاریخ کمتر از 30 روز باشد، بر اساس موجودی مرتب کن
    if (Math.abs(dateDiff) < 30 * 24 * 60 * 60 * 1000) {
      const qtyA = a.quantity || 0;
      const qtyB = b.quantity || 0;
      return qtyB - qtyA; // موجودی بیشتر اول
    }
    
    return dateDiff;
  });
};

// جستجوی دارو بر اساس نام
export const searchDrugs = (searchTerm) => {
  return DRUGS_DATABASE.filter(drug => 
    drug.name.includes(searchTerm) || 
    drug.genericName.includes(searchTerm) ||
    drug.activeIngredient.includes(searchTerm)
  );
};

// گرفتن داروها بر اساس دسته‌بندی
export const getDrugsByCategory = (category) => {
  return DRUGS_DATABASE.filter(drug => drug.category === category);
};

// گرفتن داروهای منقضی شده یا نزدیک به انقضا
export const getExpiringDrugs = (daysThreshold = 30) => {
  const today = new Date();
  const threshold = new Date();
  threshold.setDate(today.getDate() + daysThreshold);
  
  return DRUGS_DATABASE.filter(drug => {
    const expiryDate = new Date(drug.expiryDate); // حالا که فرمت میلادی است نیازی به replace نیست
    return expiryDate <= threshold;
  });
};

// ساخت نام نمایشی دارو (نام + تاریخ انقضا)
export const getDrugDisplayName = (drug) => {
  return `${drug.name} (انقضا: ${drug.expiryDate})`;
};

// گرفتن دارو بر اساس ID
export const getDrugById = (id) => {
  return DRUGS_DATABASE.find(drug => drug.id === id);
};

// گرفتن تامین‌کننده بر اساس ID
export const getSupplierById = (id) => {
  return SUPPLIERS.find(supplier => supplier.id === id);
};

// گرفتن انبار بر اساس ID
export const getWarehouseById = (id) => {
  return WAREHOUSES.find(warehouse => warehouse.id === id);
};