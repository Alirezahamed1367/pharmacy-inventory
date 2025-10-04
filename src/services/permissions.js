// Registry of available permissions (front-end authoritative for now)
// گروه‌بندی مجوزها برای UI
export const PERMISSION_GROUPS = [
  {
    key: 'core',
    label: 'هسته سیستم',
    permissions: [
      { key: 'view_dashboard', label: 'مشاهده داشبورد' },
    ]
  },
  {
    key: 'inventory',
    label: 'موجودی و دارو',
    permissions: [
      { key: 'manage_drugs', label: 'مدیریت داروها' },
      { key: 'manage_warehouses', label: 'مدیریت انبارها' },
      { key: 'view_inventory', label: 'مشاهده موجودی' }
    ]
  },
  {
    key: 'receipts',
    label: 'رسیدها',
    permissions: [
      { key: 'create_receipt', label: 'ایجاد رسید' },
      { key: 'complete_receipt', label: 'تکمیل رسید' }
    ]
  },
  {
    key: 'transfers',
    label: 'حواله‌ها',
    permissions: [
      { key: 'create_transfer', label: 'ایجاد حواله' },
      { key: 'complete_transfer', label: 'تکمیل حواله' }
    ]
  },
  {
    key: 'users',
    label: 'کاربران و نقش‌ها',
    permissions: [
      { key: 'manage_users', label: 'مدیریت کاربران' },
      { key: 'manage_roles', label: 'مدیریت گروه‌های دسترسی' }
    ]
  },
  {
    key: 'reports',
    label: 'گزارش‌ها',
    permissions: [
      { key: 'view_reports', label: 'مشاهده گزارش‌ها' }
    ]
  },
  {
    key: 'settings',
    label: 'تنظیمات',
    permissions: [
      { key: 'sms_settings', label: 'تنظیمات پیامک' },
      { key: 'system_settings', label: 'تنظیمات سیستم' }
    ]
  }
]

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key))

export const isValidPermission = (key) => ALL_PERMISSIONS.includes(key)