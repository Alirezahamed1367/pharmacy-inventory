import dayjs from 'dayjs'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)

// فرمت dd/mm/yyyy (میلادی)
export const formatDMY = (date) => {
  if (!date) return ''
  const d = dayjs(date)
  if (!d.isValid()) return ''
  return d.format('DD/MM/YYYY')
}

// فرمت شمسی پیش‌فرض (امروز اگر تاریخ معتبر نباشد)
export const formatJalali = (date) => {
  if (!date) return dayjs().calendar('jalali').locale('fa').format('YYYY/MM/DD')
  const d = dayjs(date)
  if (!d.isValid()) return dayjs().calendar('jalali').locale('fa').format('YYYY/MM/DD')
  return d.calendar('jalali').locale('fa').format('YYYY/MM/DD')
}

export const todayJalali = () => dayjs().calendar('jalali').locale('fa').format('YYYY-MM-DD')

// تبدیل مقدار input type=date (yyyy-mm-dd) به dd/mm/yyyy جهت نمایش
export const dateInputToDMY = (val) => {
  if (!val) return ''
  return formatDMY(val)
}

// پارس dd/mm/yyyy به yyyy-mm-dd برای ذخیره
export const parseDMYToISO = (val) => {
  if (!val) return null
  const parts = val.split('/')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (!dd || !mm || !yyyy) return null
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`
}

export default {
  formatDMY,
  formatJalali,
  todayJalali,
  dateInputToDMY,
  parseDMYToISO
}
