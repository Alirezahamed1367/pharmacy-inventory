#!/usr/bin/env node
/**
 * اسکریپت اعتبارسنجی پوشش lot_id قبل از اعمال محدودیت NOT NULL
 * اجرا:  node ./scripts/auditLots.mjs
 * خروجی: آمار تعداد رکوردهای NULL یا ناهمخوان
 * بر اساس VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if(!url || !key){
  console.error('❌ متغیرهای محیطی Supabase تنظیم نشده اند (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)')
  process.exit(2)
}

const supabase = createClient(url, key)

const sections = []
const add = (title, ok, meta={}) => sections.push({title, ok, meta})

async function countNull(table, column){
  const { count, error } = await supabase.from(table).select(column, { count: 'exact', head: true }).is(column, null)
  if(error){
    add(`NULL count ${table}.${column}`, false, { error: error.message })
    return null
  }
  add(`NULL count ${table}.${column}`, count === 0, { count })
  return count
}

async function run(){
  console.log('🔍 Audit Lots Started')
  // 1. شمارش NULL ها
  await countNull('inventory','lot_id')
  await countNull('receipt_items','lot_id')
  await countNull('transfer_items','lot_id')

  // 2. بررسی رکوردهای inventory که lot_id نامعتبر (به drug متفاوت) دارند
  // (Cross-check: inventory.drug_id باید با drug_lots.drug_id همخوان باشد)
  const { data: mismatches, error: mmErr } = await supabase
    .from('inventory')
    .select('id, drug_id, lot_id, lot:drug_lots(drug_id)')
    .not('lot_id','is', null)
  if(mmErr){
    add('Inventory lot drug mismatch query', false, { error: mmErr.message })
  } else {
    const bad = (mismatches||[]).filter(r => r.lot && r.lot.drug_id !== r.drug_id)
    add('Inventory lot drug mismatch count', bad.length === 0, { count: bad.length })
  }

  // 3. آمار کلی تعداد lots و موجودی
  const { count: lotsCount, error: lcErr } = await supabase.from('drug_lots').select('id', { count: 'exact', head: true })
  add('Lots total', !lcErr, { count: lotsCount, error: lcErr?.message })
  const { count: invCount, error: icErr } = await supabase.from('inventory').select('id', { count: 'exact', head: true })
  add('Inventory total', !icErr, { count: invCount, error: icErr?.message })

  // نتیجه
  console.log('\n=== Results ===')
  let allOk = true
  for(const s of sections){
    const icon = s.ok ? '✅' : '❌'
    const extra = Object.entries(s.meta).map(([k,v])=>`${k}=${v}`).join(' ')
    console.log(`${icon} ${s.title}${extra? ' -> '+extra:''}`)
    if(!s.ok) allOk = false
  }

  console.log('\n==============================')
  if(allOk){
    console.log('✅ Audit Lots PASSED (Safe to apply NOT NULL migration)')
    process.exit(0)
  } else {
    console.log('❌ Audit Lots FAILED (Fix above items before migration)')
    process.exit(1)
  }
}

run().catch(e=>{ console.error('Unhandled error', e); process.exit(2) })
