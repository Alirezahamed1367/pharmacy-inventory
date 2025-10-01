import { createClient } from '@supabase/supabase-js'

// استفاده از environment variables برای امنیت
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// ایجاد کلاینت Supabase
export const supabase = import.meta.env.VITE_SUPABASE_URL ? 
  createClient(supabaseUrl, supabaseKey) : null

// =====================================================
// تنظیمات Storage برای تصاویر
// =====================================================
export const STORAGE_CONFIG = {
  drugImagesBucket: 'drug-images',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  uploadPath: 'drugs' // پوشه داخل bucket
}

// تابع احراز هویت
export const signIn = async (username, password) => {
  if (!supabase) {
    throw new Error('Supabase اتصال به دیتابیس برقرار نیست. لطفاً متغیرهای محیطی را بررسی کنید')
  }

  try {
    // ورود با جستجوی کاربر در جدول users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('active', true)
      .single()

    if (userError || !userData) {
      return { data: null, error: { message: 'نام کاربری یا رمز عبور اشتباه است' } }
    }

    return { data: { user: userData }, error: null }
  } catch (error) {
    return { data: null, error: { message: 'خطا در ورود به سیستم: ' + error.message } }
  }
}

// تابع خروج از سیستم
export const signOut = async () => {
  if (!supabase) {
    return { error: null }
  }
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

// تابع ثبت‌نام کاربر جدید
export const signUp = async (username, password, userData) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const { data, error } = await supabase.auth.signUp({
    email: username + '@pharmacy-inventory.app',
    password: password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

// API های دیتابیس
export const dbAPI = {
  // کاربران
  users: {
    getAll: async () => {
      if (!supabase) return { data: [], error: null }
      return await supabase.from('users').select('*')
    },
    create: async (userData) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('users').insert([userData])
    },
    update: async (id, userData) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('users').update(userData).eq('id', id)
    },
    delete: async (id) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('users').delete().eq('id', id)
    }
  },

  // انبارها
  warehouses: {
    getAll: async () => {
      if (!supabase) return { data: [], error: null }
      return await supabase.from('warehouses').select('*')
    },
    create: async (warehouseData) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('warehouses').insert([warehouseData])
    },
    update: async (id, warehouseData) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('warehouses').update(warehouseData).eq('id', id)
    },
    delete: async (id) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('warehouses').delete().eq('id', id)
    }
  },

  // داروها
  drugs: {
    getAll: async () => {
      if (!supabase) return { data: [], error: null }
      return await supabase.from('drugs').select('*')
    },
    create: async (drugData) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('drugs').insert([drugData])
    },
    update: async (id, drugData) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('drugs').update(drugData).eq('id', id)
    },
    delete: async (id) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('drugs').delete().eq('id', id)
    }
  },

  // انتقالات
  movements: {
    getAll: async () => {
      if (!supabase) return { data: [], error: null }
      return await supabase
        .from('drug_movements')
        .select(`
          *,
          drugs(name),
          from_warehouse:warehouses!drug_movements_from_warehouse_id_fkey(name),
          to_warehouse:warehouses!drug_movements_to_warehouse_id_fkey(name),
          users(name)
        `)
    },
    create: async (movementData) => {
      if (!supabase) return { data: null, error: null }
      return await supabase.from('drug_movements').insert([movementData])
    }
  }
}

// تابع آپلود تصویر
export const uploadImage = async (file, bucket = 'drug-images') => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  try {
    // ایجاد نام یکتا برای فایل
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${bucket}/${fileName}`

    // آپلود فایل
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // دریافت URL عمومی
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { 
      data: { 
        url: urlData.publicUrl,
        path: filePath,
        fileName: fileName
      }, 
      error: null 
    }
  } catch (error) {
    return { 
      data: null, 
      error: { message: 'خطا در آپلود تصویر: ' + error.message } 
    }
  }
}

// تابع حذف تصویر
export const deleteImage = async (filePath, bucket = 'drug-images') => {
  if (!supabase) {
    return { error: null }
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    return { error }
  } catch (error) {
    return { error: { message: 'خطا در حذف تصویر: ' + error.message } }
  }
}

// تابع دریافت URL تصویر
export const getImageUrl = (filePath, bucket = 'drug-images') => {
  if (!supabase || !filePath) {
    return null
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

// ===== توابع مدیریت داروها =====

// دریافت لیست داروها
export const getDrugs = async () => {
  if (!supabase) {
    return { data: [], error: null }
  }

  try {
    // Get drugs with their inventory information from the view
    const { data, error } = await supabase
      .from('inventory_view')
      .select('*')
      .order('drug_name')

    // If the view doesn't exist yet, fall back to joining tables manually
    if (error && error.message.includes('does not exist')) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('drugs')
        .select(`
          *,
          warehouse_inventory (
            id,
            warehouse_id,
            quantity,
            unit_cost,
            expire_date,
            warehouses (
              id,
              name
            )
          )
        `)
        .eq('active', true)
        .order('name')

      // Transform the data to match expected format
      const transformedData = fallbackData?.map(drug => {
        const inventory = drug.warehouse_inventory?.[0] || {}
        return {
          ...drug,
          warehouse_id: inventory.warehouse_id,
          warehouse_name: inventory.warehouses?.name,
          quantity: inventory.quantity || 0,
          expiry_date: inventory.expire_date,
          price: drug.unit_price
        }
      }) || []

      return { data: transformedData, error: fallbackError }
    }

    // Transform view data to match expected format
    const transformedData = data?.map(item => ({
      id: item.id,
      name: item.drug_name,
      generic_name: item.generic_name,
      description: item.description,
      dosage: item.dosage,
      form: item.form,
      manufacturer: item.manufacturer,
      category: item.category_name || 'عمومی',
      image_url: item.image_url,
      barcode: item.barcode,
      warehouse_id: item.warehouse_id,
      warehouse_name: item.warehouse_name,
      quantity: item.quantity || 0,
      expiry_date: item.expire_date,
      price: item.unit_cost,
      unit_price: item.unit_cost,
      active: true
    })) || []

    return { data: transformedData, error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت داروها: ' + error.message } }
  }
}

// افزودن دارو جدید
export const addDrug = async (drugData) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    // Insert drug into drugs table
    const { data: drugResult, error: drugError } = await supabase
      .from('drugs')
      .insert([{
        name: drugData.name,
        generic_name: drugData.generic_name,
        description: drugData.description,
        dosage: drugData.dosage,
        form: drugData.form,
        manufacturer: drugData.manufacturer,
        features: drugData.features,
        image_url: drugData.image_url,
        barcode: drugData.barcode,
        min_stock_level: drugData.min_stock_level || 0,
        max_stock_level: drugData.max_stock_level || 1000,
        unit_price: drugData.price ? parseFloat(drugData.price) : 0,
        active: true
      }])
      .select()

    if (drugError) {
      return { error: drugError }
    }

    // If warehouse_id and quantity are provided, add to inventory
    if (drugData.warehouse_id && drugData.quantity) {
      const { error: inventoryError } = await supabase
        .from('warehouse_inventory')
        .insert([{
          warehouse_id: drugData.warehouse_id,
          drug_id: drugResult[0].id,
          batch_number: drugData.batch_number || 'BATCH-' + Date.now(),
          quantity: parseInt(drugData.quantity) || 0,
          unit_cost: drugData.price ? parseFloat(drugData.price) : 0,
          manufacture_date: drugData.manufacture_date || null,
          expire_date: drugData.expiry_date || null
        }])

      if (inventoryError) {
        // If inventory insert fails, we might want to delete the drug too
        console.error('خطا در افزودن به موجودی:', inventoryError)
      }
    }

    return { data: drugResult[0], error: null }
  } catch (error) {
    return { error: { message: 'خطا در افزودن دارو: ' + error.message } }
  }
}

// ویرایش دارو
export const updateDrug = async (id, drugData) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    // Update drug in drugs table
    const { data: drugResult, error: drugError } = await supabase
      .from('drugs')
      .update({
        name: drugData.name,
        generic_name: drugData.generic_name,
        description: drugData.description,
        dosage: drugData.dosage,
        form: drugData.form,
        manufacturer: drugData.manufacturer,
        features: drugData.features,
        image_url: drugData.image_url,
        barcode: drugData.barcode,
        min_stock_level: drugData.min_stock_level || 0,
        max_stock_level: drugData.max_stock_level || 1000,
        unit_price: drugData.price ? parseFloat(drugData.price) : 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (drugError) {
      return { error: drugError }
    }

    // Update inventory if warehouse_id and quantity are provided
    if (drugData.warehouse_id && drugData.quantity !== undefined) {
      // Check if inventory record exists
      const { data: existingInventory } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('drug_id', id)
        .eq('warehouse_id', drugData.warehouse_id)
        .single()

      if (existingInventory) {
        // Update existing inventory
        await supabase
          .from('warehouse_inventory')
          .update({
            quantity: parseInt(drugData.quantity) || 0,
            unit_cost: drugData.price ? parseFloat(drugData.price) : 0,
            expire_date: drugData.expiry_date || null,
            last_updated: new Date().toISOString()
          })
          .eq('drug_id', id)
          .eq('warehouse_id', drugData.warehouse_id)
      } else {
        // Create new inventory record
        await supabase
          .from('warehouse_inventory')
          .insert([{
            warehouse_id: drugData.warehouse_id,
            drug_id: id,
            batch_number: drugData.batch_number || 'BATCH-' + Date.now(),
            quantity: parseInt(drugData.quantity) || 0,
            unit_cost: drugData.price ? parseFloat(drugData.price) : 0,
            expire_date: drugData.expiry_date || null
          }])
      }
    }

    return { data: drugResult[0], error: null }
  } catch (error) {
    return { error: { message: 'خطا در ویرایش دارو: ' + error.message } }
  }
}
  } catch (error) {
    return { error: { message: 'خطا در ویرایش دارو: ' + error.message } }
  }
}

// حذف دارو
export const deleteDrug = async (id) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    const { error } = await supabase
      .from('drugs')
      .update({ is_active: false })
      .eq('id', id)

    return { error }
  } catch (error) {
    return { error: { message: 'خطا در حذف دارو: ' + error.message } }
  }
}

// تابع کمکی برای دریافت ID کاربر فعلی
const getCurrentUserId = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    return currentUser.id || null
  } catch {
    return null
  }
}
