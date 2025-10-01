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
    const { data, error } = await supabase
      .from('drugs')
      .select(`
        *,
        warehouses (
          id,
          name
        )
      `)
      .eq('is_active', true)
      .order('name')

    return { data: data || [], error }
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
    const { data, error } = await supabase
      .from('drugs')
      .insert([{
        ...drugData,
        price: drugData.price ? parseFloat(drugData.price) : null,
        quantity: drugData.quantity ? parseInt(drugData.quantity) : 0,
        created_by: getCurrentUserId()
      }])
      .select()

    return { data: data?.[0], error }
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
    const { data, error } = await supabase
      .from('drugs')
      .update({
        ...drugData,
        price: drugData.price ? parseFloat(drugData.price) : null,
        quantity: drugData.quantity ? parseInt(drugData.quantity) : 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    return { data: data?.[0], error }
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
