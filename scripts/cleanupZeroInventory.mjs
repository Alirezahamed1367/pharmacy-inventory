#!/usr/bin/env node
// پاکسازی رکوردهای موجودی با quantity = 0 که دیگر در transfer_items استفاده نشده‌اند
// اجرا: node scripts/cleanupZeroInventory.mjs

import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('⛔ لازم است متغیرهای محیطی SUPABASE_URL و KEY تنظیم شوند.')
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  console.log('🔍 جستجوی رکوردهای موجودی با quantity=0 ...')
  const { data: zeros, error } = await supabase
    .from('inventory')
    .select('id, drug_id, warehouse_id, quantity')
    .eq('quantity', 0)
  if (error) {
    console.error('خطا در خواندن موجودی:', error.message)
    process.exit(1)
  }
  if (!zeros.length) {
    console.log('✅ هیچ رکورد صفر یافت نشد. خروج.')
    return
  }
  console.log(`📦 یافت شد: ${zeros.length} رکورد صفر. بررسی ارجاع حواله‌ها...`)
  let deleted = 0
  for (const row of zeros) {
    const { data: ref, error: refErr } = await supabase
      .from('transfer_items')
      .select('id')
      .eq('inventory_id', row.id)
      .limit(1)
    if (refErr) {
      console.warn('⚠️ خطا در بررسی ارجاع برای', row.id, refErr.message)
      continue
    }
    if (ref && ref.length) {
      console.log('⛔ ردیف inventory', row.id, 'دارای ارجاع حواله است؛ حذف نشد')
      continue
    }
    const { error: delErr } = await supabase.from('inventory').delete().eq('id', row.id)
    if (delErr) {
      console.warn('⚠️ عدم موفقیت حذف', row.id, delErr.message)
      continue
    }
    deleted++
  }
  console.log(`✅ پاکسازی کامل. تعداد حذف شده: ${deleted}`)
}

run().catch(e => { console.error('Unhandled:', e); process.exit(1) })
