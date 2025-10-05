// Automated PocketBase Collections Setup
// نویسنده: علیرضا حامد - پاییز 1404
// این اسکریپت خودکار همه collections مورد نیاز را می‌سازد

console.log('🚀 شروع راه‌اندازی خودکار Collections...')
console.log('طراحی و توسعه نرم‌افزار توسط علیرضا حامد در پاییز 1404')
console.log('')

const PB_URL = process.env.VITE_PB_URL || 'https://pharmacy-inventory-lz6l.onrender.com'
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'superadmin@pharmacy.local'
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'A25893Aa'

// Collection definitions
const collections = [
  {
    name: 'users',
    type: 'auth',
    description: 'مدیریت کاربران و احراز هویت',
    fields: [
      {
        name: 'role',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['admin', 'user', 'warehouse_manager']
        }
      },
      {
        name: 'full_name', 
        type: 'text',
        required: true
      },
      {
        name: 'is_active',
        type: 'bool',
        options: { default: true }
      }
    ]
  },
  {
    name: 'drugs',
    type: 'base',
    description: 'اطلاعات داروها و محصولات',
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'brand', type: 'text' },
      { name: 'generic_name', type: 'text' },
      {
        name: 'package_type',
        type: 'select',
        options: {
          maxSelect: 1,
          values: ['bottle', 'box', 'blister', 'vial', 'tube', 'ampule', 'syringe', 'other']
        }
      },
      { name: 'strength', type: 'text' },
      {
        name: 'image',
        type: 'file',
        options: {
          maxSelect: 1,
          maxSize: 5242880, // 5MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        }
      },
      { name: 'description', type: 'text' },
      { name: 'price', type: 'number' },
      { name: 'unit', type: 'text' },
      { name: 'is_active', type: 'bool', options: { default: true } }
    ]
  },
  {
    name: 'warehouses',
    type: 'base', 
    description: 'انبارها و مکان‌های نگهداری',
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'location', type: 'text' },
      { name: 'manager_name', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'is_active', type: 'bool', options: { default: true } }
    ]
  },
  {
    name: 'drug_lots',
    type: 'base',
    description: 'بچ‌ها و لات‌های داروها',
    fields: [
      {
        name: 'drug',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'drugs',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      { name: 'lot_number', type: 'text', required: true },
      { name: 'expire_date', type: 'date', required: true },
      { name: 'supplier_name', type: 'text' },
      { name: 'production_date', type: 'date' },
      { name: 'notes', type: 'text' }
    ]
  },
  {
    name: 'inventory',
    type: 'base',
    description: 'موجودی انبارها',
    fields: [
      {
        name: 'warehouse',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'warehouses',
          maxSelect: 1
        }
      },
      {
        name: 'drug_lot',
        type: 'relation', 
        required: true,
        options: {
          collectionId: 'drug_lots',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      { name: 'quantity', type: 'number', required: true },
      { name: 'last_updated', type: 'date' }
    ]
  },
  {
    name: 'receipts',
    type: 'base',
    description: 'رسیدهای ورود کالا',
    fields: [
      {
        name: 'destination_warehouse',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'warehouses',
          maxSelect: 1
        }
      },
      { name: 'supplier_name', type: 'text' },
      { name: 'notes', type: 'text' },
      { name: 'document_date', type: 'date' },
      {
        name: 'status',
        type: 'select',
        options: {
          maxSelect: 1,
          values: ['pending', 'completed']
        }
      },
      {
        name: 'created_by',
        type: 'relation',
        options: {
          collectionId: 'users',
          maxSelect: 1
        }
      }
    ]
  },
  {
    name: 'transfers',
    type: 'base',
    description: 'حواله‌های انتقال بین انبارها',
    fields: [
      {
        name: 'source_warehouse',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'warehouses',
          maxSelect: 1
        }
      },
      {
        name: 'destination_warehouse',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'warehouses',
          maxSelect: 1
        }
      },
      { name: 'notes', type: 'text' },
      { name: 'document_date', type: 'date' },
      {
        name: 'status',
        type: 'select',
        options: {
          maxSelect: 1,
          values: ['pending', 'completed']
        }
      },
      {
        name: 'created_by',
        type: 'relation',
        options: {
          collectionId: 'users',
          maxSelect: 1
        }
      }
    ]
  }
]

// Manual setup instructions
function displaySetupInstructions() {
  console.log('📋 راهنمای ساخت Collections در PocketBase Admin:')
  console.log('')
  
  collections.forEach((collection, index) => {
    console.log(`📁 ${index + 1}. Collection: ${collection.name} (${collection.type})`)
    console.log(`   📝 توضیح: ${collection.description}`)
    console.log(`   🔧 Type: ${collection.type === 'auth' ? 'Auth Collection' : 'Base Collection'}`)
    console.log('   📋 Fields:')
    
    collection.fields.forEach(field => {
      let fieldDesc = `      • ${field.name}: ${field.type}`
      if (field.required) fieldDesc += ' (Required)'
      if (field.options?.values) fieldDesc += ` - Options: [${field.options.values.join(', ')}]`
      if (field.options?.collectionId) fieldDesc += ` - Relation to: ${field.options.collectionId}`
      if (field.options?.maxSize) fieldDesc += ` - Max size: ${Math.round(field.options.maxSize / 1024 / 1024)}MB`
      console.log(fieldDesc)
    })
    console.log('')
  })
  
  console.log('🎯 نکات مهم:')
  console.log('  • Collection ها را به ترتیب بالا بسازید (وابستگی‌ها مهم است)')
  console.log('  • برای فیلدهای Relation، ابتدا collection هدف باید وجود داشته باشد')
  console.log('  • فیلد image در drugs: حتماً file type انتخاب کنید')
  console.log('  • برای select fields، مقادیر را دقیقاً کپی کنید')
  console.log('')
  console.log('🔗 PocketBase Admin Panel:')
  console.log(`   ${PB_URL}/_/`)
  console.log('')
  console.log('👤 Admin Credentials:')
  console.log(`   📧 Email: ${ADMIN_EMAIL}`)
  console.log(`   🔐 Password: ${ADMIN_PASSWORD}`)
  console.log('')
  console.log('✨ بعد از ساخت همه collections، سیستم آماده استفاده خواهد بود!')
  console.log('')
  console.log('طراحی و توسعه نرم‌افزار توسط علیرضا حامد در پاییز 1404')
}

// نمایش راهنما
displaySetupInstructions()

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { collections, PB_URL, ADMIN_EMAIL, ADMIN_PASSWORD }
}