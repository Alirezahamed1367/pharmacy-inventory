import { createClient } from '@supabase/supabase-js'

// استفاده از environment variables برای امنیت
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// ایجاد کلاینت Supabase
export const supabase = import.meta.env.VITE_SUPABASE_URL ? 
  createClient(supabaseUrl, supabaseKey) : null

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

// تابع آپلود تصویر
export const uploadImage = async (file, bucket = 'drug-images') => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    return { data: null, error }
  }

  const { data: publicURL } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return { data: { ...data, publicUrl: publicURL.publicUrl }, error: null }
}

// تابع دریافت تصویر
export const getImageUrl = (path, bucket = 'drug-images') => {
  if (!supabase) return null
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  return data.publicUrl
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
