#!/usr/bin/env node
/**
 * اسکریپت ایجاد داده نمونه (دمو)
 * اجرا:  node ./scripts/seedDemo.mjs
 * نیازمند: VITE_SUPABASE_URL , VITE_SUPABASE_ANON_KEY (کلید public)
 * توجه: چون RLS غیرفعال شده این درج‌ها بدون نقش خاص انجام می‌شوند.
 */
import { createClient } from '@supabase/supabase-js'
import dayjs from 'dayjs'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if(!url || !key){
  console.error('❌ متغیرهای محیطی VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY تنظیم نشده')
  process.exit(2)
}

const supabase = createClient(url, key)

async function upsertSingle(table, match, values){
  const { data: existing, error: findErr } = await supabase.from(table).select('id').match(match).maybeSingle()
  if(findErr){
    console.error(`❌ خطا در یافتن ${table}:`, findErr.message); return null
  }
  if(existing){
    return existing.id
  }
  const { data: inserted, error: insErr } = await supabase.from(table).insert([values]).select('id').single()
  if(insErr){
    console.error(`❌ خطا در درج ${table}:`, insErr.message); return null
  }
  return inserted.id
}

async function run(){
  console.log('🚀 شروع Seeding Demo ...')

  // Warehouses
  const wh1 = await upsertSingle('warehouses', { name: 'انبار مرکزی' }, { name:'انبار مرکزی', location:'تهران' })
  const wh2 = await upsertSingle('warehouses', { name: 'انبار شعبه 1' }, { name:'انبار شعبه 1', location:'اصفهان' })

  // Drugs (3 demo items)
  const future = (days)=> dayjs().add(days,'day').format('YYYY-MM-DD')
  const d1 = await upsertSingle('drugs', { name:'استامینوفن ساده', package_type:'قرص', expire_date: future(180) }, { name:'استامینوفن ساده', package_type:'قرص', description:'مسکن', expire_date: future(180) })
  const d2 = await upsertSingle('drugs', { name:'ایبوپروفن 400', package_type:'کپسول', expire_date: future(365) }, { name:'ایبوپروفن 400', package_type:'کپسول', description:'ضد التهاب', expire_date: future(365) })
  const d3 = await upsertSingle('drugs', { name:'سرم نمکی 0.9%', package_type:'بطری', expire_date: future(90) }, { name:'سرم نمکی 0.9%', package_type:'بطری', description:'الکترولیت', expire_date: future(90) })

  // Lots: اگر قبلاً ایجاد شده‌اند (به خاطر backfill) پیدا می‌کنیم، در غیر اینصورت ایجاد می‌کنیم
  async function ensureLot(drug_id, expire_date){
    const { data: lot, error: lotErr } = await supabase.from('drug_lots').select('id').eq('drug_id', drug_id).eq('expire_date', expire_date).is('lot_number', null).maybeSingle()
    if(lotErr){ console.error('lot find err', lotErr.message); return null }
    if(lot) return lot.id
    const { data: newLot, error: insLotErr } = await supabase.from('drug_lots').insert([{ drug_id, expire_date }]).select('id').single()
    if(insLotErr){ console.error('lot insert err', insLotErr.message); return null }
    return newLot.id
  }
  const l1 = await ensureLot(d1, future(180))
  const l2 = await ensureLot(d2, future(365))
  const l3 = await ensureLot(d3, future(90))

  // Inventory seed (only if not exists)
  async function ensureInventory(drug_id, warehouse_id, lot_id, quantity){
    const { data: inv, error: invErr } = await supabase.from('inventory').select('id').eq('drug_id', drug_id).eq('warehouse_id', warehouse_id).eq('lot_id', lot_id).maybeSingle()
    if(invErr){ console.error('inventory find err', invErr.message); return }
    if(inv) return
    const { error: insInvErr } = await supabase.from('inventory').insert([{ drug_id, warehouse_id, lot_id, quantity }])
    if(insInvErr){ console.error('inventory insert err', insInvErr.message) }
  }
  await ensureInventory(d1, wh1, l1, 500)
  await ensureInventory(d2, wh1, l2, 300)
  await ensureInventory(d3, wh2, l3, 150)

  console.log('✅ Seed Demo Completed')
}

run().catch(e=>{ console.error('Unhandled error', e); process.exit(1) })
