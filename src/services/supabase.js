import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

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
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
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
    return { data: { user }, error: null }
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

// تغییر رمز عبور
export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    // دریافت password_hash برای کاربر
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', userId)
      .single()
    if (userErr || !user) return { error: { message: 'کاربر یافت نشد' } }

    const valid = await bcrypt.compare(currentPassword, user.password_hash || '')
    if (!valid) return { error: { message: 'رمز عبور فعلی اشتباه است' } }

    const newHash = await bcrypt.hash(newPassword, 10)
    const { error: updErr } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId)
    if (updErr) return { error: { message: 'خطا در تغییر رمز عبور: ' + updErr.message } }
    return { error: null }
  } catch (e) {
    return { error: { message: 'خطا در تغییر رمز عبور: ' + e.message } }
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

// دریافت لیست داروها (مرتب بر اساس تاریخ انقضا و سپس نام)
export const getDrugs = async () => {
  if (!supabase) return { data: [], error: null }
  try {
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .order('expire_date', { ascending: true })
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
    const { name, description, package_type, expire_date, image_url } = drugData || {}
    if (!name || !expire_date) return { error: { message: 'نام و تاریخ انقضا الزامی هستند' } }
    // درج
    const { data, error } = await supabase
      .from('drugs')
      .insert([{ name: name.trim(), description: description?.trim() || null, package_type: package_type || null, expire_date, image_url: image_url || null }])
      .select()
    if (error) {
      if (error.message && (error.message.includes('duplicate key') || error.message.includes('unique constraint')) ) {
        return { error: { message: 'این ترکیب (نام + بسته‌بندی + تاریخ انقضا) قبلاً وجود دارد' } }
      }
      return { error }
    }
    return { data: data[0], error: null }
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
    const { name, description, package_type, expire_date, image_url } = drugData || {}
    if (!name || !expire_date) return { error: { message: 'نام و تاریخ انقضا الزامی هستند' } }
    const { data, error } = await supabase
      .from('drugs')
      .update({ name, description: description || null, package_type: package_type || null, expire_date, image_url: image_url || null })
      .eq('id', id)
      .select()
    if (error) return { error }
    return { data: data[0], error: null }
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
      .delete()
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
      return { error }
    }

    return { data: inserted[0], error: null }
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
      return { error }
    }

    return { data: data[0], error: null }
  } catch (error) {
    return { error: { message: 'خطا در ویرایش انبار: ' + error.message } }
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
    const { data, error } = await supabase
  .from('drugs')
  .select('*')
  .order('name')

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
        drug:drugs(id,name,expire_date,package_type,image_url),
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

  // درج آیتم‌ها (اکنون supplier_id اختصاصی هر آیتم ممکن است)
  const itemsToInsert = items.map(it => ({
    receipt_id: receiptData.id,
    drug_id: it.drug_id,
    quantity: it.quantity,
    batch_number: it.batch_number || null,
    supplier_id: it.supplier_id || supplier_id || null
  }))
  const { error: itemsError } = await supabase.from('receipt_items').insert(itemsToInsert)
  if (itemsError) return { error: itemsError }
  return { data: receiptData, error: null }
}

// تکمیل رسید: تغییر وضعیت + به‌روزرسانی موجودی (upsert)
export const completeReceipt = async (receipt_id) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    // دریافت آیتم‌های رسید
    const { data: items, error: itemsError } = await supabase
      .from('receipt_items')
      .select('id, drug_id, quantity, batch_number, receipt_id, receipts(destination_warehouse_id)')
      .eq('receipt_id', receipt_id)
    if (itemsError) return { error: itemsError }
    if (!items || items.length === 0) return { error: { message: 'آیتمی برای این رسید ثبت نشده است' } }

    const destinationWarehouseId = items[0].receipts?.destination_warehouse_id
    if (!destinationWarehouseId) return { error: { message: 'انبار مقصد یافت نشد' } }

    // Upsert موجودی برای هر آیتم (drug_id + warehouse + batch)
    for (const item of items) {
      const { data: existing, error: invErr } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('drug_id', item.drug_id)
        .eq('warehouse_id', destinationWarehouseId)
        .eq('batch_number', item.batch_number || null)
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
          .insert([{ drug_id: item.drug_id, warehouse_id: destinationWarehouseId, quantity: item.quantity, batch_number: item.batch_number || null }])
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
  const { error } = await supabase
    .from('receipt_items')
    .insert([{ receipt_id, drug_id: item.drug_id, quantity: item.quantity, batch_number: item.batch_number || null, supplier_id: item.supplier_id || null }])
  return { error }
}

// حذف آیتم از رسید pending
export const deleteReceiptItem = async (item_id) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  const { error } = await supabase.from('receipt_items').delete().eq('id', item_id)
  return { error }
}

// دریافت آیتم‌های یک رسید
export const getReceiptItems = async (receipt_id) => {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('receipt_items')
    .select('*, drugs(name, expire_date, package_type), suppliers(name)')
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
export const createTransfer = async ({ source_warehouse_id, destination_warehouse_id, notes = null, items = [], document_date = null }) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  if (!source_warehouse_id || !destination_warehouse_id) return { error: { message: 'انبار مبدا و مقصد الزامی است' } }
  if (source_warehouse_id === destination_warehouse_id) return { error: { message: 'انبار مبدا و مقصد نمی‌تواند یکسان باشد' } }
  if (!Array.isArray(items) || items.length === 0) return { error: { message: 'حداقل یک آیتم حواله لازم است' } }

  const userId = getCurrentUserId() || '00000000-0000-0000-0000-000000000000'
  const base = { source_warehouse_id, destination_warehouse_id, status: 'in_transit', notes, created_by_user_id: userId, document_date: document_date || new Date().toISOString().slice(0,10) }
  const { data: transferData, error: tErr } = await supabase.from('transfers').insert([base]).select().single()
  if (tErr) return { error: tErr }

  // بررسی موجودی و درج آیتم‌ها
  for (const it of items) {
    const { data: inv, error: invErr } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('id', it.inventory_id)
      .single()
    if (invErr) return { error: invErr }
    if (!inv || inv.quantity < it.quantity_sent) {
      return { error: { message: 'موجودی کافی برای یکی از اقلام وجود ندارد' } }
    }
    const { error: updErr } = await supabase
      .from('inventory')
      .update({ quantity: inv.quantity - it.quantity_sent, updated_at: new Date().toISOString() })
      .eq('id', inv.id)
    if (updErr) return { error: updErr }
    const { error: insErr } = await supabase.from('transfer_items').insert([{ transfer_id: transferData.id, inventory_id: it.inventory_id, quantity_sent: it.quantity_sent }])
    if (insErr) return { error: insErr }
  }
  return { data: transferData, error: null }
}

// تکمیل حواله: ثبت quantity_received (اگر کمتر/بیشتر، وضعیت discrepancy) + افزودن/افزایش موجودی مقصد
export const completeTransfer = async (transfer_id, receivedItems) => {
  if (!supabase) return { error: { message: 'اتصال پایگاه داده برقرار نیست' } }
  try {
    // دریافت حواله برای انبار مقصد
    const { data: transfer, error: tErr } = await supabase.from('transfers').select('*').eq('id', transfer_id).single()
    if (tErr || !transfer) return { error: tErr || { message: 'حواله یافت نشد' } }
    if (transfer.status !== 'in_transit') return { error: { message: 'این حواله در وضعیت مجاز برای تکمیل نیست' } }

    // دریافت آیتم‌های حواله جهت تطبیق
    const { data: items, error: itErr } = await supabase.from('transfer_items').select('id, inventory_id, quantity_sent').eq('transfer_id', transfer_id)
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
      const { data: invSrc, error: invSrcErr } = await supabase.from('inventory').select('drug_id, batch_number').eq('id', it.inventory_id).single()
      if (invSrcErr) return { error: invSrcErr }
      // موجودی مقصد را upsert کن
      const { data: invDest, error: findDestErr } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('drug_id', invSrc.drug_id)
        .eq('warehouse_id', transfer.destination_warehouse_id)
        .eq('batch_number', invSrc.batch_number)
        .maybeSingle()
      if (findDestErr) return { error: findDestErr }
      if (invDest) {
        const { error: updDestErr } = await supabase.from('inventory').update({ quantity: invDest.quantity + qtyReceived, updated_at: new Date().toISOString() }).eq('id', invDest.id)
        if (updDestErr) return { error: updDestErr }
      } else {
        const { error: insDestErr } = await supabase.from('inventory').insert([{ drug_id: invSrc.drug_id, warehouse_id: transfer.destination_warehouse_id, quantity: qtyReceived, batch_number: invSrc.batch_number }])
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
    .select('*, inventory(id, drug_id, batch_number, quantity, drug:drugs(name, expire_date, package_type))')
    .eq('transfer_id', transfer_id)
  return { data: data || [], error }
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

