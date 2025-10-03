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
