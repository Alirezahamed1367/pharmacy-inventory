// ابزار یکتای مدیریت درخواست‌ها با timeout و تشخیص خطای fetch
// اگر TypeError: Failed to fetch مشاهده شود، آن را به پیام آفلاین تبدیل می‌کنیم

export const withTimeout = (promise, ms = 8000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return Promise.race([
    promise(controller.signal),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms + 50))
  ]).finally(() => clearTimeout(timeout))
}

export const mapFetchError = (err) => {
  if (!err) return err
  const msg = err.message || ''
  if (msg === 'Failed to fetch' || msg.includes('TypeError: Failed to fetch') || msg === 'timeout' || msg.includes('aborted')) {
    return new Error('اتصال به سرور برقرار نیست یا پاسخ‌گو نیست (شبکه/سرور)')
  }
  return err
}

// نمونه استفاده پیشنهادی:
// await withTimeout(signal => supabase.from('drugs').select('*'))

// پینگ سبک برای تشخیص دسترسی Supabase (بدون فشار زیاد)
// strategy: select یک ردیف از جدول کوچک/اصلی (drugs یا warehouses)
export const pingSupabase = async (supabaseClient, { timeoutMs = 2500 } = {}) => {
  if (!supabaseClient) return { ok: false, error: new Error('کلاینت مقداردهی نشده') }
  try {
    const res = await withTimeout(signal => {
      return supabaseClient.from('drugs').select('id').limit(1).abortSignal(signal)
    }, timeoutMs)
    if (res.error) return { ok: false, error: res.error }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: mapFetchError(e) }
  }
}

// backoff ساده: delay = base * 2^attempt
export const wait = (ms) => new Promise(r => setTimeout(r, ms))
export const calcBackoff = (attempt, base = 1000) => base * Math.pow(2, attempt)
