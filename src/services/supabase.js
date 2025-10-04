import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { translateDbError } from '../utils/errorUtils'
import { ALL_PERMISSIONS } from './permissions'

// استفاده از environment variables برای امنیت
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// ایجاد کلاینت Supabase
export const supabase = import.meta.env.VITE_SUPABASE_URL ? 
  createClient(supabaseUrl, supabaseKey) : null

export const isBackendAvailable = () => !!(import.meta.env.VITE_SUPABASE_URL && supabase)

// =====================================================
// تنظیمات Storage برای تصاویر
// =====================================================
export const STORAGE_CONFIG = {
  drugImagesBucket: 'drug-images',
  maxFileSize: 1 * 1024 * 1024, // 1MB
  allowedTypes: ['image/jpeg'],
  uploadPath: 'drugs' // پوشه داخل bucket
}

// تابع احراز هویت
export const signIn = async (username, password) => {
  if (!supabase) throw new Error('Supabase پیکربندی نشده است')
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, full_name, role, is_active')
      .eq('username', username)
      .single()
    if (error || !user) return { data: null, error: { message: 'نام کاربری یا رمز عبور اشتباه است' } }
    if (user.is_active === false) return { data: null, error: { message: 'کاربر غیرفعال است' } }
    const ok = await bcrypt.compare(password, user.password_hash || '')
    if (!ok) return { data: null, error: { message: 'نام کاربری یا رمز عبور اشتباه است' } }
  // بارگذاری گروه‌ها و مجوزها
  const enriched = await loadUserAccess(user.id, user)
  return { data: { user: enriched }, error: null }
  } catch (e) {
    return { data: null, error: { message: 'خطا در ورود: ' + e.message } }
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

// =====================================================
// Access Control Helpers
// =====================================================
export const loadUserAccess = async (userId, baseUser) => {
  if (!supabase) return baseUser
  try {
    const [grpRes, permRes, whRes] = await Promise.all([
      supabase.from('user_access_groups').select('group_id').eq('user_id', userId),
      supabase.rpc ? Promise.resolve({ data: null }) : Promise.resolve({ data: null }),
      supabase.from('access_group_warehouses').select('group_id, warehouse_id').in('group_id',
        supabase.from('user_access_groups').select('group_id').eq('user_id', userId)
      )
    ])
    const groupIds = grpRes.data?.map(g => g.group_id) || []
    let permissions = new Set()
    if (groupIds.length) {
      const { data: gp } = await supabase.from('access_group_permissions').select('permission_key').in('group_id', groupIds)
      gp?.forEach(r => { if (ALL_PERMISSIONS.includes(r.permission_key)) permissions.add(r.permission_key) })
      const { data: wh } = await supabase.from('access_group_warehouses').select('warehouse_id').in('group_id', groupIds)
      const warehouses = Array.from(new Set(wh?.map(w => w.warehouse_id)))
      return { ...baseUser, access: { permissions: Array.from(permissions), warehouses, groups: groupIds } }
    }
    return { ...baseUser, access: { permissions: [], warehouses: [], groups: [] } }
  } catch {
    return { ...baseUser, access: { permissions: [], warehouses: [], groups: [] } }
  }
}

export const accessControlAPI = {
  listGroups: async () => {
    if (!supabase) return { data: [], error: null }
    return supabase.from('access_groups').select('*').order('created_at', { ascending: true })
  },
  createGroup: async ({ name, code, description, permissions = [], warehouseIds = [] }) => {
    if (!supabase) return { error: { message: 'اتصال برقرار نیست' } }
    const tName = name?.trim(); const tCode = code?.trim()
    if (!tName || !tCode) return { error: { message: 'نام و کد گروه الزامی است' } }
    try {
      const { data: group, error } = await supabase.from('access_groups').insert([{ name: tName, code: tCode, description }]).select().single()
      if (error) return { error: { message: translateDbError(error.message) } }
      if (permissions.length) {
        const rows = permissions.filter(p => ALL_PERMISSIONS.includes(p)).map(p => ({ group_id: group.id, permission_key: p }))
        if (rows.length) await supabase.from('access_group_permissions').insert(rows)
      }
      if (warehouseIds.length) {
        const wrows = warehouseIds.map(w => ({ group_id: group.id, warehouse_id: w }))
        if (wrows.length) await supabase.from('access_group_warehouses').insert(wrows)
      }
      return { data: group }
    } catch (e) {
      return { error: { message: translateDbError(e.message) } }
    }
  },
  updateGroup: async (groupId, { name, description, permissions, warehouseIds }) => {
    if (!supabase) return { error: { message: 'اتصال برقرار نیست' } }
    try {
      if (name || description) {
        const { error: upErr } = await supabase.from('access_groups').update({ name, description }).eq('id', groupId)
        if (upErr) return { error: { message: translateDbError(upErr.message) } }
      }
      if (permissions) {
        await supabase.from('access_group_permissions').delete().eq('group_id', groupId)
        const rows = permissions.filter(p => ALL_PERMISSIONS.includes(p)).map(p => ({ group_id: groupId, permission_key: p }))
        if (rows.length) await supabase.from('access_group_permissions').insert(rows)
      }
      if (warehouseIds) {
        await supabase.from('access_group_warehouses').delete().eq('group_id', groupId)
        const wrows = warehouseIds.map(w => ({ group_id: groupId, warehouse_id: w }))
        if (wrows.length) await supabase.from('access_group_warehouses').insert(wrows)
      }
      return { data: true }
    } catch (e) {
      return { error: { message: translateDbError(e.message) } }
    }
  },
  deleteGroup: async (groupId) => {
    if (!supabase) return { error: { message: 'اتصال برقرار نیست' } }
    try {
      const { error } = await supabase.from('access_groups').delete().eq('id', groupId)
      if (error) return { error: { message: translateDbError(error.message) } }
      return { data: true }
    } catch (e) {
      return { error: { message: translateDbError(e.message) } }
    }
  },
  assignGroupsToUser: async (userId, groupIds) => {
    if (!supabase) return { error: { message: 'اتصال برقرار نیست' } }
    try {
      await supabase.from('user_access_groups').delete().eq('user_id', userId)
      if (groupIds.length) {
        await supabase.from('user_access_groups').insert(groupIds.map(g => ({ user_id: userId, group_id: g })))
      }
      return { data: true }
    } catch (e) {
      return { error: { message: translateDbError(e.message) } }
    }
  }
}

// =====================================================
// Users with Groups Aggregation Helpers
// =====================================================
export const listUsersWithGroups = async () => {
  if (!supabase) return { data: [] }
  try {
    const { data: users } = await supabase.from('users').select('id, username, full_name, role, is_active, created_at')
    if (!users?.length) return { data: [] }
    const ids = users.map(u => u.id)
    const { data: ug } = await supabase.from('user_access_groups').select('user_id, group_id').in('user_id', ids)
    const groupIds = Array.from(new Set(ug?.map(r => r.group_id) || []))
    let groupsMap = {}
    if (groupIds.length) {
      const { data: groups } = await supabase.from('access_groups').select('id, name, code').in('id', groupIds)
      groups?.forEach(g => { groupsMap[g.id] = g })
    }
    const aggregated = users.map(u => {
      const gForUser = ug?.filter(r => r.user_id === u.id).map(r => groupsMap[r.group_id]).filter(Boolean) || []
      return { ...u, groups: gForUser }
    })
    return { data: aggregated }
  } catch (e) {
    return { data: [], error: { message: e.message } }
  }
}

export const createUserWithGroups = async (userData, passwordPlain, groupIds=[]) => {
  if (!supabase) return { error: { message: 'اتصال برقرار نیست' } }
  try {
    const hash = await bcrypt.hash(passwordPlain, 10)
    const insertData = { username: userData.username, password_hash: hash, full_name: userData.full_name || userData.name || userData.username, role: userData.role || 'manager', is_active: userData.is_active !== false }
    const { data: u, error } = await supabase.from('users').insert([insertData]).select().single()
    if (error) return { error: { message: translateDbError(error.message) } }
    if (groupIds.length) await accessControlAPI.assignGroupsToUser(u.id, groupIds)
    return { data: u }
  } catch (e) {
    return { error: { message: translateDbError(e.message) } }
  }
}

export const updateUserGroups = async (userId, groupIds=[]) => {
  return await accessControlAPI.assignGroupsToUser(userId, groupIds)
}

// تغییر رمز عبور
export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    // دریافت password_hash برای کاربر
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, password_hash, username')
      .eq('id', userId)
      .single()
    if (userErr || !user) return { error: { message: 'کاربر یافت نشد' } }
    if (user.username === 'superadmin') return { error: { message: 'تغییر رمز عبور کاربر سوپر ادمین مجاز نیست' } }

    const valid = await bcrypt.compare(currentPassword, user.password_hash || '')
    if (!valid) return { error: { message: 'رمز عبور فعلی اشتباه است' } }

    const newHash = await bcrypt.hash(newPassword, 10)
    const { error: updErr } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId)
    if (updErr) return { error: { message: 'خطا در تغییر رمز عبور: ' + translateDbError(updErr.message) } }
    return { error: null }
  } catch (e) {
    return { error: { message: 'خطا در تغییر رمز عبور: ' + translateDbError(e.message) } }
  }
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
    return { data: null, error: { message: 'اتصال پایگاه داده برقرار نیست (حالت آفلاین)' } }
  }

  try {
    // اعتبارسنجی اندازه و نوع
    if (!STORAGE_CONFIG.allowedTypes.includes(file.type)) {
      return { data: null, error: { message: 'فرمت فایل مجاز نیست' } }
    }
    if (file.size > STORAGE_CONFIG.maxFileSize) {
      return { data: null, error: { message: 'حجم فایل بزرگ‌تر از حد مجاز است' } }
    }

    const fileExt = file.name.split('.').pop()
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`
    const fileName = `${unique}.${fileExt}`
    // مسیر داخل باکت (نباید نام باکت تکرار شود)
    const filePath = `${STORAGE_CONFIG.uploadPath}/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { data: null, error: { message: 'خطا در آپلود تصویر: ' + error.message } }
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      data: {
        url: urlData.publicUrl,
        path: filePath,
        fileName
      },
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: { message: 'خطای غیرمنتظره آپلود: ' + error.message }
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

// NOTE: ستون expire_date از جدول drugs در مدل نهایی حذف می‌شود؛ دارو فقط ویژگی‌های عمومی دارد.

// دریافت لیست داروها (موقت: فقط بر اساس نام، تاریخ انقضا دیگر در تعریف دارو استفاده نمی‌شود)
export const getDrugs = async () => {
  if (!supabase) return { data: [], error: null }
  try {
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .order('name', { ascending: true })
    if (error) return { data: [], error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت داروها: ' + error.message } }
  }
}

// افزودن دارو جدید
export const addDrug = async (drugData) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    const { name, description, package_type, image_url } = drugData || {}
    if (!name) return { error: { message: 'نام دارو الزامی است' } }
    // تلاش برای درج با یا بدون ستون expire_date (برای سازگاری قبل/بعد از migration)
    let insertPayload = { name: name.trim(), description: description?.trim() || null, package_type: package_type || null, image_url: image_url || null }
    let data, error
    try {
      ({ data, error } = await supabase.from('drugs').insert([insertPayload]).select())
    } catch (e) {
      return { error: { message: translateDbError(e.message) } }
    }
    if (error) {
      if (error.message && (error.message.includes('duplicate key') || error.message.includes('unique constraint')) ) {
        return { error: { message: 'این ترکیب (نام + بسته‌بندی) قبلاً وجود دارد' } }
      }
      return { error: { message: translateDbError(error.message) } }
    }
    return { data: data[0], error: null }
  } catch (error) {
    return { error: { message: 'خطا در افزودن دارو: ' + translateDbError(error.message) } }
  }
}

// ویرایش دارو
export const updateDrug = async (id, drugData) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    const { name, description, package_type, image_url } = drugData || {}
    if (!name) return { error: { message: 'نام دارو الزامی است' } }
    const { data, error } = await supabase
        .from('drugs')
        .update({ name, description: description || null, package_type: package_type || null })
      .eq('id', id)
      .select()
    if (error) return { error: { message: translateDbError(error.message) } }
    return { data: data[0], error: null }
  } catch (error) {
    return { error: { message: 'خطا در ویرایش دارو: ' + translateDbError(error.message) } }
  }
}

// حذف دارو
export const deleteDrug = async (id) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    // واکشی رکورد برای دسترسی به تصویر
    const { data: drugRow, error: fetchErr } = await supabase.from('drugs').select('id,image_url').eq('id', id).single()
    if (fetchErr) return { error: { message: 'خطا در یافتن دارو: ' + translateDbError(fetchErr.message) } }
    // قبل از حذف بررسی می‌کنیم آیا رکورد در موجودی یا اسناد استفاده شده است
    // 1. موجودی
    const { data: invRef, error: invErr } = await supabase.from('inventory').select('id').eq('drug_id', id).limit(1)
    if (invErr) return { error: { message: 'خطا در بررسی موجودی: ' + invErr.message } }
    if (invRef && invRef.length > 0) {
      return { error: { message: 'این دارو در موجودی انبارها استفاده شده است و قابل حذف مستقیم نیست (ابتدا موجودی را صفر و رکورد را پاک کنید یا انقضا را ویرایش کنید).' } }
    }
    // 2. آیتم‌های رسید
    const { data: recRef, error: recErr } = await supabase.from('receipt_items').select('id').eq('drug_id', id).limit(1)
    if (recErr) return { error: { message: 'خطا در بررسی رسیدها: ' + recErr.message } }
    if (recRef && recRef.length > 0) {
      return { error: { message: 'این دارو در رسیدهای ثبت‌شده استفاده شده است؛ حذف باعث از دست رفتن تاریخچه می‌شود. پیشنهاد: غیرفعال‌سازی یا عدم استفاده در آینده.' } }
    }
    // 3. انتقالات (از طریق inventory شناخته می‌شد؛ ولی اگر در طراحی بعدی مستقیما ارتباط داشت اینجا جداگانه بررسی می‌شود)
    // فعلا نیازی نیست چون transfer_items به inventory رجوع می‌کند.

    const { error } = await supabase
      .from('drugs')
      .delete()
      .eq('id', id)
    if (!error && drugRow?.image_url) {
      try {
        // استخراج مسیر نسبی داخل باکت
        const marker = '/drug-images/'
        if (drugRow.image_url.includes(marker)) {
          const relative = drugRow.image_url.split(marker)[1] // drugs/filename.ext یا فقط filename
          // اگر مسیر شامل 'drugs/' نبود اضافه می‌کنیم
          const path = relative.startsWith('drugs/') ? relative : 'drugs/' + relative
          await supabase.storage.from('drug-images').remove([path])
        }
      } catch (_) { /* عدم موفقیت حذف تصویر بحرانی نیست */ }
    }
    return { error }
  } catch (error) {
    return { error: { message: translateDbError(error.message) } }
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
  .select('id,name,location,manager_user_id,created_at')
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
  .select('id,name,location,manager_user_id,created_at')
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
    // فقط ستون‌های مجاز
    const payload = {
      name: warehouseData.name?.trim(),
      location: warehouseData.location?.trim() || null,
      manager_user_id: warehouseData.manager_user_id || null
    }
    const { data: inserted, error } = await supabase
      .from('warehouses')
      .insert([ payload ])
  .select('id,name,location,manager_user_id,created_at')

    if (error) {
      return { error: { message: translateDbError(error.message) } }
    }

    return { data: inserted[0], error: null }
  } catch (error) {
    return { error: { message: translateDbError(error.message) } }
  }
}

// ویرایش انبار
export const updateWarehouse = async (id, warehouseData) => {
  if (!supabase) {
    return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  }

  try {
    const payload = {
      name: warehouseData.name?.trim(),
      location: warehouseData.location?.trim() || null,
      manager_user_id: warehouseData.manager_user_id || null,
      updated_at: new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('warehouses')
      .update(payload)
      .eq('id', id)
      .select('id,name,location,manager_user_id,created_at,updated_at')
    if (error) {
      return { error: { message: translateDbError(error.message) } }
    }

    return { data: data[0], error: null }
  } catch (error) {
    return { error: { message: translateDbError(error.message) } }
  }
}

// ======================= LOT / EXPIRY HELPERS (Phase 1 placeholders) =======================
// Fetch lots for a drug in a warehouse (after inventory.lot_id adoption)
export const getLotsByWarehouseDrug = async (warehouse_id, drug_id) => {
  if (!supabase) return { data: [], error: null }
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, quantity, lot:drug_lots(id, lot_number, expire_date, drug_id)')
      .eq('warehouse_id', warehouse_id)
      .eq('lot.drug_id', drug_id)
    return { data: data || [], error }
  } catch (e) {
    return { data: [], error: { message: 'خطا در دریافت لات‌ها: ' + e.message } }
  }
}

export const getLotsExpiringSummary = async () => {
  if (!supabase) return { data: [], error: null }
  try {
    const { data, error } = await supabase
      .from('drug_lots')
      .select('id, drug_id, expire_date')
    return { data: data || [], error }
  } catch (e) {
    return { data: [], error: { message: 'خطا در خلاصه لات‌ها: ' + e.message } }
  }
}

// Helper: create or fetch an existing lot for (drug_id, expire_date, lot_number)
// Returns { data: lot_id, error }
export const getOrCreateLot = async ({ drug_id, expire_date, lot_number = null }) => {
  if (!supabase) return { data: null, error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  if (!drug_id || !expire_date) return { data: null, error: { message: 'شناسه دارو و تاریخ انقضا الزامی است' } }
  try {
    const { data: existing, error: findErr } = await supabase
      .from('drug_lots')
      .select('id')
      .eq('drug_id', drug_id)
      .eq('expire_date', expire_date)
      .eq('lot_number', lot_number || null)
      .maybeSingle()
    if (findErr) return { data: null, error: findErr }
    if (existing) return { data: existing.id, error: null }
    const { data: inserted, error: insErr } = await supabase
      .from('drug_lots')
      .insert([{ drug_id, expire_date, lot_number: lot_number || null }])
      .select('id')
      .single()
    if (insErr) return { data: null, error: insErr }
    return { data: inserted.id, error: null }
  } catch (e) {
    return { data: null, error: { message: 'خطا در ایجاد lot: ' + e.message } }
  }
}

// Aggregated expiry report grouped by lot expiry (and drug)
// Returns rows: { drug_id, lot_id, drug_name, package_type, expire_date, total_quantity }
export const getExpiryReport = async () => {
  if (!supabase) return { data: [], error: null }
  try {
    // Join inventory -> drug_lots -> drugs; group by lot
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        lot_id,
        quantity,
        drug:drugs(id,name,package_type),
        lot:drug_lots(expire_date, lot_number, drug_id)
      `)
    if (error) return { data: [], error }
    const map = {}
    for (const row of data || []) {
      const lot = row.lot || {}
      if (!lot?.expire_date) continue
      const key = row.lot_id || `${row.drug?.id}-${lot.expire_date}-${lot.lot_number || 'NULL'}`
      if (!map[key]) {
        map[key] = {
          lot_id: row.lot_id,
            drug_id: lot.drug_id || row.drug?.id,
          drug_name: row.drug?.name,
          package_type: row.drug?.package_type,
          expire_date: lot.expire_date,
          lot_number: lot.lot_number || null,
          total_quantity: 0
        }
      }
      map[key].total_quantity += row.quantity || 0
    }
    const rows = Object.values(map).sort((a,b)=> new Date(a.expire_date) - new Date(b.expire_date))
    return { data: rows, error: null }
  } catch (e) {
    return { data: [], error: { message: 'خطا در دریافت گزارش انقضا: ' + e.message } }
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
      return { error: { message: translateDbError(error.message) } }
    }

    return { error: null }
  } catch (error) {
    return { error: { message: translateDbError(error.message) } }
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
  .select('id, full_name, role')
  .eq('role', 'manager')
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
    // ابتدا تلاش با فیلتر is_active؛ اگر ستون وجود نداشت fallback
    let query = supabase.from('drugs').select('*')
    let { data, error } = await query.eq('is_active', true).order('name')
    if (error && error.message && /column .*is_active.* does not exist/i.test(error.message)) {
      // پایگاه‌داده هنوز migration را ندارد → بدون فیلتر ادامه بده
      const retry = await supabase.from('drugs').select('*').order('name')
      data = retry.data; error = retry.error
    }

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت داروها: ' + error.message } }
  }
}

// دریافت موجودی با جزئیات (دارو + انبار) برای گزارش‌ها
export const getInventoryDetailed = async () => {
  if (!supabase) return { data: [], error: null }
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        quantity,
        batch_number,
        drug:drugs(id,name,package_type,image_url),
        lot:drug_lots(expire_date,lot_number,drug_id),
        warehouse:warehouses(id,name)
      `)
    return { data: data || [], error }
  } catch (e) {
    return { data: [], error: { message: 'خطا در دریافت موجودی: ' + e.message } }
  }
}

// =====================================================
// Receipt Workflow Functions
// =====================================================

// دریافت لیست رسیدها (status فیلتر اختیاری)
export const getReceipts = async (status = null) => {
  if (!supabase) return { data: [], error: null }
  try {
    let query = supabase.from('receipts').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error: { message: 'خطا در دریافت رسیدها: ' + error.message } }
  }
}

// ایجاد رسید جدید (در وضعیت pending)
// ایجاد رسید جدید (نسخه lot-aware: در صورت نیاز ایجاد lot جدید برای هر آیتم)
// items: [{ drug_id, quantity, batch_number?, supplier_id?, expire_date? (اختیاری اگر بخواهیم lot سفارشی بسازیم) }]
export const createReceipt = async ({ supplier_id = null, destination_warehouse_id, notes = null, items = [], document_date = null }) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  if (!destination_warehouse_id) return { error: { message: 'انبار مقصد الزامی است' } }
  if (!Array.isArray(items) || items.length === 0) return { error: { message: 'حداقل یک آیتم رسید لازم است' } }

  const receipt = { supplier_id, destination_warehouse_id, status: 'pending', notes, document_date: document_date || new Date().toISOString().slice(0,10) }

  const { data: receiptData, error: receiptError } = await supabase
    .from('receipts')
    .insert([receipt])
    .select()
    .single()
  if (receiptError) return { error: receiptError }

  // Build & insert items using helper (expect each item now carries explicit expire_date)
  for (const raw of items) {
    if (!raw.drug_id || !raw.quantity) return { error: { message: 'آیتم رسید نامعتبر است' } }
    // Require expire_date for new lots (future phase will enforce in UI)
    let lotId = null
    if (raw.expire_date) {
      const lotRes = await getOrCreateLot({ drug_id: raw.drug_id, expire_date: raw.expire_date, lot_number: raw.batch_number || null })
      if (lotRes.error) return { error: lotRes.error }
      lotId = lotRes.data
    } else {
      // fallback to default lot (legacy) - will be removed after UI enforces
      const { data: defaultLot } = await supabase
        .from('drug_lots')
        .select('id, expire_date')
        .eq('drug_id', raw.drug_id)
        .is('lot_number', null)
        .limit(1)
        .maybeSingle()
      lotId = defaultLot?.id || null
    }
    // drug snapshot (expire_date ستون حذف شده است؛ فقط نام دارو را می‌خوانیم و expire_date را از lot یا ورودی می‌گیریم)
    const { data: drugRow, error: drugErr } = await supabase.from('drugs').select('name').eq('id', raw.drug_id).single()
    if (drugErr) return { error: drugErr }
    const payload = {
      receipt_id: receiptData.id,
      drug_id: raw.drug_id,
      quantity: raw.quantity,
      batch_number: raw.batch_number || null,
      supplier_id: raw.supplier_id || supplier_id || null,
      lot_id: lotId,
      drug_name_snapshot: drugRow?.name || null,
      expire_date_snapshot: raw.expire_date || null
    }
    const { error: insErr } = await supabase.from('receipt_items').insert([payload])
    if (insErr) return { error: insErr }
  }
  return { data: receiptData, error: null }
}

// تکمیل رسید: تغییر وضعیت + به‌روزرسانی موجودی (upsert)
// تکمیل receipt (lot-aware): upsert موجودی با توجه به lot_id
export const completeReceipt = async (receipt_id) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    // دریافت آیتم‌های رسید
    const { data: items, error: itemsError } = await supabase
      .from('receipt_items')
      .select('id, drug_id, quantity, batch_number, lot_id, receipt_id, receipts(destination_warehouse_id)')
      .eq('receipt_id', receipt_id)
    if (itemsError) return { error: itemsError }
    if (!items || items.length === 0) return { error: { message: 'آیتمی برای این رسید ثبت نشده است' } }

    const destinationWarehouseId = items[0].receipts?.destination_warehouse_id
    if (!destinationWarehouseId) return { error: { message: 'انبار مقصد یافت نشد' } }

    // Upsert موجودی برای هر آیتم (drug_id + warehouse + batch + lot_id)
    for (const item of items) {
      const { data: existing, error: invErr } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('drug_id', item.drug_id)
        .eq('warehouse_id', destinationWarehouseId)
        .eq('batch_number', item.batch_number || null)
        .eq('lot_id', item.lot_id)
        .maybeSingle()
      if (invErr) return { error: invErr }

      if (existing) {
        const { error: updErr } = await supabase
          .from('inventory')
          .update({ quantity: existing.quantity + item.quantity, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
        if (updErr) return { error: updErr }
      } else {
        const { error: insErr } = await supabase
          .from('inventory')
          .insert([{ drug_id: item.drug_id, warehouse_id: destinationWarehouseId, quantity: item.quantity, batch_number: item.batch_number || null, lot_id: item.lot_id }])
        if (insErr) return { error: insErr }
      }
    }

    // بروزرسانی وضعیت رسید
    const { error: receiptUpdateError } = await supabase
      .from('receipts')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', receipt_id)
    if (receiptUpdateError) return { error: receiptUpdateError }
    return { error: null }
  } catch (error) {
    return { error: { message: 'خطا در تکمیل رسید: ' + error.message } }
  }
}

// افزودن آیتم جدید به رسید pending
export const addReceiptItem = async (receipt_id, item) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  if (!item?.drug_id || !item?.quantity) return { error: { message: 'آیتم نامعتبر است' } }
  // Expect item.expire_date (required for new lots); create/fetch lot
  let lot_id = null
  if (item.expire_date) {
    const lotRes = await getOrCreateLot({ drug_id: item.drug_id, expire_date: item.expire_date, lot_number: item.batch_number || null })
    if (lotRes.error) return { error: lotRes.error }
    lot_id = lotRes.data
  } else {
    // fallback default lot
    const { data: defLot } = await supabase
      .from('drug_lots')
      .select('id')
      .eq('drug_id', item.drug_id)
      .is('lot_number', null)
      .limit(1)
      .maybeSingle()
    lot_id = defLot?.id || null
  }
  const { data: drugSnap } = await supabase.from('drugs').select('name, expire_date').eq('id', item.drug_id).maybeSingle()
  const row = {
    receipt_id,
    drug_id: item.drug_id,
    quantity: item.quantity,
    batch_number: item.batch_number || null,
    supplier_id: item.supplier_id || null,
    lot_id,
    drug_name_snapshot: drugSnap?.name || null,
    expire_date_snapshot: drugSnap?.expire_date || item.expire_date || null
  }
  const { error } = await supabase.from('receipt_items').insert([row])
  return { error }
}

// حذف آیتم از رسید pending
export const deleteReceiptItem = async (item_id) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  const { error } = await supabase.from('receipt_items').delete().eq('id', item_id)
  return { error }
}

// حذف رسید (فقط اگر pending باشد و هنوز تکمیل نشده)
export const deleteReceipt = async (receipt_id) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    const { data: receipt, error: rErr } = await supabase.from('receipts').select('id,status').eq('id', receipt_id).single()
    if (rErr) return { error: { message: 'رسید یافت نشد' } }
    if (receipt.status !== 'pending') {
      return { error: { message: 'فقط رسیدهای در انتظار قابل حذف هستند' } }
    }
    const { error: delErr } = await supabase.from('receipts').delete().eq('id', receipt_id)
    return { error: delErr || null }
  } catch (e) {
    return { error: { message: 'خطا در حذف رسید: ' + e.message } }
  }
}

// ویرایش هدر رسید
// منطق جدید:
//   - اگر رسید pending باشد: تمام فیلدهای مجاز (destination_warehouse_id, supplier_id, notes, document_date) قابل تغییرند.
//   - اگر رسید completed باشد: فقط supplier_id, notes, document_date قابل تغییرند (تغییر انبار مقصد ممنوع است).
export const updateReceipt = async (receipt_id, patch) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    const { data: receipt, error: rErr } = await supabase.from('receipts').select('id,status').eq('id', receipt_id).single()
    if (rErr || !receipt) return { error: { message: 'رسید یافت نشد' } }
    let allowed
    if (receipt.status === 'pending') {
      allowed = { destination_warehouse_id: patch.destination_warehouse_id, supplier_id: patch.supplier_id, notes: patch.notes, document_date: patch.document_date }
    } else if (receipt.status === 'completed') {
      allowed = { supplier_id: patch.supplier_id, notes: patch.notes, document_date: patch.document_date }
      if (patch.destination_warehouse_id && patch.destination_warehouse_id !== undefined) {
        return { error: { message: 'تغییر انبار مقصد برای رسید تکمیل‌شده مجاز نیست' } }
      }
    } else {
      return { error: { message: 'وضعیت رسید برای ویرایش پشتیبانی نمی‌شود' } }
    }
    const cleaned = Object.fromEntries(Object.entries(allowed).filter(([_,v]) => v !== undefined))
    if (Object.keys(cleaned).length === 0) return { error: null }
    const { error } = await supabase.from('receipts').update(cleaned).eq('id', receipt_id)
    return { error: error ? { message: translateDbError(error.message) } : null }
  } catch (e) { return { error: { message: 'خطا در ویرایش رسید: ' + translateDbError(e.message) } } }
}

// ویرایش آیتم رسید (تغییر تعداد یا تامین‌کننده) در pending
export const updateReceiptItem = async (item_id, patch) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    const { data: item, error: iErr } = await supabase.from('receipt_items').select('id, receipt_id, quantity, receipts(status)').eq('id', item_id).single()
    if (iErr || !item) return { error: { message: 'آیتم یافت نشد' } }
    if (item.receipts?.status !== 'pending') return { error: { message: 'آیتم متعلق به رسید تکمیل‌شده است' } }
    const cleaned = {}
    if (patch.quantity !== undefined) cleaned.quantity = patch.quantity
    if (patch.supplier_id !== undefined) cleaned.supplier_id = patch.supplier_id || null
    if (Object.keys(cleaned).length === 0) return { error: null }
    const { error } = await supabase.from('receipt_items').update(cleaned).eq('id', item_id)
    return { error }
  } catch (e) { return { error: { message: 'خطا در ویرایش آیتم رسید: ' + e.message } } }
}

// دریافت آیتم‌های یک رسید
export const getReceiptItems = async (receipt_id) => {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('receipt_items')
    .select('*, drugs(name, package_type), suppliers(name), lot:drug_lots(expire_date, lot_number)')
    .eq('receipt_id', receipt_id)
  return { data: data || [], error }
}

// =====================================================
// Transfer Workflow Functions
// =====================================================

export const getTransfers = async (status = null) => {
  if (!supabase) return { data: [], error: null }
  try {
    let q = supabase.from('transfers').select('*').order('created_at', { ascending: false })
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    return { data: data || [], error }
  } catch (e) {
    return { data: [], error: { message: 'خطا در دریافت حواله‌ها: ' + e.message } }
  }
}

// ایجاد حواله جدید با وضعیت in_transit و آیتم‌ها (quantity_sent) و رزرو موقت کسر از موجودی مبدا
// ایجاد حواله جدید (نسخه به‌روز شده: پشتیبانی از lot_id برای هر آیتم)
// items: [{ inventory_id, lot_id?, quantity_sent }]
export const createTransfer = async ({ source_warehouse_id, destination_warehouse_id, notes = null, items = [], document_date = null }) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  if (!source_warehouse_id || !destination_warehouse_id) return { error: { message: 'انبار مبدا و مقصد الزامی است' } }
  if (source_warehouse_id === destination_warehouse_id) return { error: { message: 'انبار مبدا و مقصد نمی‌تواند یکسان باشد' } }
  if (!Array.isArray(items) || items.length === 0) return { error: { message: 'حداقل یک آیتم حواله لازم است' } }

  const userId = getCurrentUserId() || '00000000-0000-0000-0000-000000000000'
  const base = { source_warehouse_id, destination_warehouse_id, status: 'in_transit', notes, created_by_user_id: userId, document_date: document_date || new Date().toISOString().slice(0,10) }
  const { data: transferData, error: tErr } = await supabase.from('transfers').insert([base]).select().single()
  if (tErr) return { error: tErr }

  // بررسی موجودی و درج آیتم‌ها (با تایید lot_id در صورت وجود)
  for (const it of items) {
    if (!it.inventory_id || !it.quantity_sent) return { error: { message: 'آیتم حواله نامعتبر است' } }
    const { data: inv, error: invErr } = await supabase
      .from('inventory')
      .select('id, quantity, lot_id, warehouse_id')
      .eq('id', it.inventory_id)
      .single()
    if (invErr) return { error: invErr }
    if (!inv) return { error: { message: 'آیتم موجودی یافت نشد' } }
    if (inv.warehouse_id !== source_warehouse_id) return { error: { message: 'موجودی انتخاب‌شده متعلق به انبار مبدا نیست' } }
    if (it.lot_id && inv.lot_id && it.lot_id !== inv.lot_id) return { error: { message: 'عدم تطابق lot برای یکی از آیتم‌ها' } }
    if (inv.quantity < it.quantity_sent) {
      return { error: { message: 'موجودی کافی برای یکی از اقلام وجود ندارد' } }
    }
    const { error: updErr } = await supabase
      .from('inventory')
      .update({ quantity: inv.quantity - it.quantity_sent, updated_at: new Date().toISOString() })
      .eq('id', inv.id)
    if (updErr) return { error: updErr }
  // snapshot برای حواله: استخراج drug از inventory
  const { data: snapInv, error: snapErr } = await supabase.from('inventory').select('drug_id, drug:drugs(name), lot:drug_lots(expire_date)').eq('id', it.inventory_id).single()
  if (snapErr) return { error: snapErr }
  const row = { transfer_id: transferData.id, inventory_id: it.inventory_id, quantity_sent: it.quantity_sent, drug_name_snapshot: snapInv?.drug?.name, expire_date_snapshot: snapInv?.lot?.expire_date || null }
    if (it.lot_id || inv.lot_id) row.lot_id = it.lot_id || inv.lot_id
    const { error: insErr } = await supabase.from('transfer_items').insert([row])
    if (insErr) return { error: insErr }
  }
  return { data: transferData, error: null }
}

// تکمیل حواله: ثبت quantity_received (اگر کمتر/بیشتر، وضعیت discrepancy) + افزودن/افزایش موجودی مقصد
// تکمیل حواله (به‌روزرسانی: انتقال lot_id به موجودی مقصد)
export const completeTransfer = async (transfer_id, receivedItems) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    // دریافت حواله برای انبار مقصد
    const { data: transfer, error: tErr } = await supabase.from('transfers').select('*').eq('id', transfer_id).single()
    if (tErr || !transfer) return { error: tErr || { message: 'حواله یافت نشد' } }
    if (transfer.status !== 'in_transit') return { error: { message: 'این حواله در وضعیت مجاز برای تکمیل نیست' } }

    // دریافت آیتم‌های حواله جهت تطبیق
  const { data: items, error: itErr } = await supabase.from('transfer_items').select('id, inventory_id, lot_id, quantity_sent').eq('transfer_id', transfer_id)
    if (itErr) return { error: itErr }

    let discrepancy = false
    for (const it of items) {
      const recv = receivedItems.find(r => r.transfer_item_id === it.id)
      const qtyReceived = recv ? Number(recv.quantity_received) : it.quantity_sent
      if (qtyReceived !== it.quantity_sent) discrepancy = true
      // بروزرسانی رکورد آیتم
      const { error: updItemErr } = await supabase.from('transfer_items').update({ quantity_received: qtyReceived, discrepancy_notes: recv?.discrepancy_notes || null }).eq('id', it.id)
      if (updItemErr) return { error: updItemErr }
      // پیدا کردن رکورد inventory مبدا + استخراج drug_id, warehouse_id, batch برای ساخت رکورد مقصد
      const { data: invSrc, error: invSrcErr } = await supabase.from('inventory').select('drug_id, batch_number, lot_id').eq('id', it.inventory_id).single()
      if (invSrcErr) return { error: invSrcErr }
      // موجودی مقصد را upsert کن
      const { data: invDest, error: findDestErr } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('drug_id', invSrc.drug_id)
        .eq('warehouse_id', transfer.destination_warehouse_id)
        .eq('batch_number', invSrc.batch_number)
        .eq('lot_id', invSrc.lot_id)
        .maybeSingle()
      if (findDestErr) return { error: findDestErr }
      if (invDest) {
        const { error: updDestErr } = await supabase.from('inventory').update({ quantity: invDest.quantity + qtyReceived, updated_at: new Date().toISOString() }).eq('id', invDest.id)
        if (updDestErr) return { error: updDestErr }
      } else {
        const { error: insDestErr } = await supabase.from('inventory').insert([{ drug_id: invSrc.drug_id, warehouse_id: transfer.destination_warehouse_id, quantity: qtyReceived, batch_number: invSrc.batch_number, lot_id: invSrc.lot_id }])
        if (insDestErr) return { error: insDestErr }
      }
    }

    const finalStatus = discrepancy ? 'discrepancy' : 'completed'
    const { error: updTransferErr } = await supabase.from('transfers').update({ status: finalStatus, completed_at: new Date().toISOString() }).eq('id', transfer_id)
    if (updTransferErr) return { error: updTransferErr }
    return { error: null }
  } catch (e) {
    return { error: { message: 'خطا در تکمیل حواله: ' + e.message } }
  }
}

// دریافت آیتم‌های حواله (با جزئیات موجودی و دارو)
export const getTransferItems = async (transfer_id) => {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('transfer_items')
    .select('*, inventory(id, drug_id, batch_number, lot_id, quantity, drug:drugs(name, package_type), lot:drug_lots(expire_date, lot_number))')
    .eq('transfer_id', transfer_id)
  return { data: data || [], error }
}

// حذف حواله (فقط در وضعیت در حال انتقال)
export const deleteTransfer = async (transfer_id) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    const { data: transfer, error: tErr } = await supabase.from('transfers').select('id,status').eq('id', transfer_id).single()
    if (tErr) return { error: { message: 'حواله یافت نشد' } }
    if (transfer.status !== 'in_transit') return { error: { message: 'فقط حواله‌های در حال انتقال قابل حذف هستند' } }
    const { error: delErr } = await supabase.from('transfers').delete().eq('id', transfer_id)
    return { error: delErr || null }
  } catch (e) {
    return { error: { message: 'خطا در حذف حواله: ' + e.message } }
  }
}

// ویرایش هدر حواله (فقط در in_transit)
export const updateTransfer = async (transfer_id, patch) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    const { data: transfer, error: tErr } = await supabase.from('transfers').select('id,status').eq('id', transfer_id).single()
    if (tErr || !transfer) return { error: { message: 'حواله یافت نشد' } }
    if (transfer.status !== 'in_transit') return { error: { message: 'حواله تکمیل شده قابل ویرایش نیست' } }
    const allowed = { notes: patch.notes, document_date: patch.document_date, destination_warehouse_id: patch.destination_warehouse_id }
    const cleaned = Object.fromEntries(Object.entries(allowed).filter(([_,v]) => v !== undefined))
    if (Object.keys(cleaned).length === 0) return { error: null }
    const { error } = await supabase.from('transfers').update(cleaned).eq('id', transfer_id)
    return { error }
  } catch (e) { return { error: { message: 'خطا در ویرایش حواله: ' + e.message } } }
}

// دریافت موجودی lots (برای UI حواله) - فقط رکوردهای دارای quantity>0
export const getAllLotInventory = async () => {
  if (!supabase) return { data: [], error: null }
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, warehouse_id, quantity, batch_number, lot_id, drug_id, drugs(name, package_type), lot:drug_lots(expire_date, lot_number)')
      .gt('quantity', 0)
    return { data: data || [], error }
  } catch (e) {
    return { data: [], error: { message: 'خطا در دریافت موجودی lot: ' + e.message } }
  }
}

// تاریخچه حرکات (رسید + حواله)
export const getMovementHistory = async () => {
  if (!supabase) return { data: [], error: null }
  try {
    const [r, t] = await Promise.all([
      supabase.from('receipts').select('id, document_date, created_at, status').limit(50),
      supabase.from('transfers').select('id, document_date, created_at, status').limit(50)
    ])
    if (r.error) return { data: [], error: r.error }
    if (t.error) return { data: [], error: t.error }
    const recs = (r.data||[]).map(x=>({ id: x.id, type:'receipt', status: x.status, document_date: x.document_date, created_at: x.created_at }))
    const trs = (t.data||[]).map(x=>({ id: x.id, type:'transfer', status: x.status, document_date: x.document_date, created_at: x.created_at }))
    const merged = [...recs, ...trs].sort((a,b)=> new Date(b.created_at) - new Date(a.created_at)).slice(0,50)
    return { data: merged, error: null }
  } catch (e) {
    return { data: [], error: { message: 'خطا در دریافت تاریخچه حرکات: ' + e.message } }
  }
}

