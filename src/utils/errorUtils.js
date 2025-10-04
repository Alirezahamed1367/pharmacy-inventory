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

// نگاشت خطاهای رایج پایگاه داده به پیام فارسی کاربرپسند
const PG_ERROR_TRANSLATIONS = [
  { test: /foreign key constraint/i, fa: 'این رکورد به داده‌های دیگری متصل است و حذف یا تغییر آن مجاز نیست.' },
  { test: /violates foreign key/i, fa: 'به دلیل ارتباط با رکوردهای دیگر، عملیات انجام نشد.' },
  { test: /unique constraint/i, fa: 'رکورد تکراری است (کلید یکتا نقض شده).' },
  { test: /duplicate key/i, fa: 'این مقدار قبلاً ثبت شده است.' },
  { test: /not-null constraint/i, fa: 'یکی از فیلدهای ضروری خالی است.' },
  { test: /permission denied/i, fa: 'دسترسی لازم برای این عملیات وجود ندارد.' },
  { test: /syntax error/i, fa: 'خطای نحوی در پردازش درخواست.' },
  { test: /timeout/i, fa: 'مهلت انجام عملیات به پایان رسید، دوباره تلاش کنید.' }
]

export const translateDbError = (msg) => {
  if (!msg) return 'خطای ناشناخته'
  for (const rule of PG_ERROR_TRANSLATIONS) {
    if (rule.test.test(msg)) return rule.fa
  }
  // نمونه خاص درخواست کاربر
  if (/receipts_destination_warehouse_id_fkey/.test(msg)) {
    return 'این انبار در رسید(های) ثبت‌شده استفاده شده و قابل حذف نیست.'
  }
  return normalizeError(msg)
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
  ,translateDbError
}
