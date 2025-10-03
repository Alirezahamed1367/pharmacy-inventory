// ابزارهای استاندارد مدیریت خطا و حالت آفلاین
// نویسنده: علیرضا حامد (پاییز 1404) – Utility centrally normalizes errors

import { isBackendAvailable } from '../services/supabase'

// تشخیص آفلاین بودن (عدم پیکربندی بک‌اند یا نبود env)
export const isOffline = () => !isBackendAvailable()

// استخراج پیام خطای کاربر پسند
export const extractErrorMessage = (err) => {
  if (!err) return 'خطای ناشناخته'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  if (err.error?.message) return err.error.message
  return 'خطای ناشناخته'
}

// نرمال‌سازی پیام‌های تکراری و فنی
export const normalizeError = (msg) => {
  if (!msg) return 'خطای ناشناخته'
  if (msg.includes('duplicate key') || msg.includes('UNIQUE')) {
    return 'این ترکیب (نام + بسته‌بندی + تاریخ انقضا) قبلاً ثبت شده است'
  }
  if (msg.includes('Supabase not configured') || msg.includes('اتصال پایگاه داده برقرار نیست')) {
    return 'سرور در دسترس نیست (حالت آفلاین)'
  }
  return msg
}

export const buildUserError = (raw) => normalizeError(extractErrorMessage(raw))

export const guardOffline = (customMsg = 'در حالت آفلاین هستید، عملیات ممکن نیست') => {
  if (isOffline()) {
    return { blocked: true, message: customMsg }
  }
  return { blocked: false }
}

export default {
  isOffline,
  extractErrorMessage,
  normalizeError,
  buildUserError,
  guardOffline
}
