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
    // Get drugs with basic information
    const { data, error } = await supabase
      .from('drugs')
      .select(`
        *,
        drug_categories (
          name
        )
      `)
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Error fetching drugs:', error)
      return { data: [], error }
    }

    // Transform data to match expected format
    const transformedData = data?.map(drug => ({
      id: drug.id,
      name: drug.name,
      generic_name: drug.generic_name,
      description: drug.description,
      dosage: drug.dosage,
      form: drug.form,
      manufacturer: drug.manufacturer,
      category: drug.drug_categories?.name || 'عمومی',
      features: drug.features,
      image_url: drug.image_url,
      barcode: drug.barcode,
      min_stock_level: drug.min_stock_level,
      max_stock_level: drug.max_stock_level,
      price: drug.unit_price,
      unit_price: drug.unit_price,
      active: drug.active,
      created_at: drug.created_at,
      updated_at: drug.updated_at
    })) || []

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Exception in getDrugs:', error)
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

// حذف دارو
export const deleteDrug = async (id) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    const { error } = await supabase
      .from('drugs')
      .update({ active: false })
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

// دریافت لیست انبارها
export const getWarehouses = async () => {
  if (!supabase) {
    return { data: [], error: null }
  }

  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('active', true)
      .order('name')

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت انبارها: ' + error.message } }
  }
}

// دریافت تمام انبارها (شامل غیرفعال)
export const getAllWarehouses = async () => {
  if (!supabase) {
    return { data: [], error: null }
  }

  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('name')

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت انبارها: ' + error.message } }
  }
}

// افزودن انبار جدید
export const addWarehouse = async (warehouseData) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    const { data, error } = await supabase
      .from('warehouses')
      .insert([{ ...warehouseData, active: true }])
      .select()

    if (error) {
      return { error }
    }

    return { data: data[0], error: null }
  } catch (error) {
    return { error: { message: 'خطا در افزودن انبار: ' + error.message } }
  }
}

// ویرایش انبار
export const updateWarehouse = async (id, warehouseData) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    const { data, error } = await supabase
      .from('warehouses')
      .update({ ...warehouseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) {
      return { error }
    }

    return { data: data[0], error: null }
  } catch (error) {
    return { error: { message: 'خطا در ویرایش انبار: ' + error.message } }
  }
}

// حذف انبار
export const deleteWarehouse = async (id) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id)

    if (error) {
      return { error }
    }

    return { error: null }
  } catch (error) {
    return { error: { message: 'خطا در حذف انبار: ' + error.message } }
  }
}

// دریافت مدیران انبار
export const getWarehouseManagers = async () => {
  if (!supabase) {
    return { data: [], error: null }
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role, phone')
      .eq('role', 'manager')
      .eq('active', true)
      .order('full_name')

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت مدیران: ' + error.message } }
  }
}

// =====================================================
// توابع گزارش‌گیری
// =====================================================

// دریافت موجودی از view
export const getInventoryView = async () => {
  if (!supabase) {
    return { data: [], error: null }
  }

  try {
    const { data, error } = await supabase
      .from('inventory_view')
      .select('*')

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت موجودی: ' + error.message } }
  }
}

// دریافت حرکات از view
export const getMovementsView = async () => {
  if (!supabase) {
    return { data: [], error: null }
  }

  try {
    const { data, error } = await supabase
      .from('movements_view')
      .select('*')
      .order('created_at', { ascending: false })

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت حرکات: ' + error.message } }
  }
}

// دریافت تمام داروهای فعال (برای گزارش‌ها)
export const getActiveDrugs = async () => {
  if (!supabase) {
    return { data: [], error: null }
  }

  try {
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .eq('active', true)
      .order('name')

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت داروها: ' + error.message } }
  }
}
