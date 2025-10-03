#!/usr/bin/env node
/**
 * سنجش کارایی آپلود و دانلود تصویر در Supabase Storage
 * استفاده:  node ./scripts/perfImageTest.mjs [iterations=3]
 */
import { createClient } from '@supabase/supabase-js'

const iterations = Number(process.argv[2]) || 3
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if(!url || !key){
  console.error('❌ VITE_SUPABASE_URL یا VITE_SUPABASE_ANON_KEY تنظیم نشده')
  process.exit(2)
}

const supabase = createClient(url, key)

function makeDummyPng(){
  // یک PNG 1x1 شفاف پایه
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  return Buffer.from(base64,'base64')
}

async function uploadOnce(idx){
  const filePath = `perf/${Date.now()}-${idx}.png`
  const data = makeDummyPng()
  const t0 = performance.now()
  const { error } = await supabase
    .storage
    .from('drug-images')
    .upload(filePath, data, { contentType: 'image/png', upsert: false })
  const t1 = performance.now()
  if(error){
    return { ok:false, filePath, ms: t1-t0, error: error.message }
  }
  // دریافت URL عمومی
  const { data: pub } = supabase.storage.from('drug-images').getPublicUrl(filePath)
  // درخواست HEAD برای بررسی هدرها (در محیط Node fetch موجود است در نسخه های جدید)
  let headersInfo = {}
  try{
    const resp = await fetch(pub.publicUrl, { method: 'HEAD' })
    headersInfo = {
      cacheControl: resp.headers.get('cache-control'),
      contentType: resp.headers.get('content-type'),
      contentLength: resp.headers.get('content-length')
    }
  }catch(e){
    headersInfo = { headError: e.message }
  }
  return { ok:true, filePath, ms: t1-t0, url: pub.publicUrl, headersInfo }
}

async function run(){
  console.log(`🚀 Running perfImageTest iterations=${iterations}`)
  const results = []
  for(let i=0;i<iterations;i++){
    const r = await uploadOnce(i)
    results.push(r)
    const icon = r.ok ? '✅':'❌'
    console.log(`${icon} #${i+1} ${r.ok?'uploaded':'failed'} ms=${r.ms.toFixed(1)} ${r.filePath} ${r.error||''}`)
  }
  const okOnes = results.filter(r=>r.ok)
  const avg = okOnes.reduce((s,r)=>s+r.ms,0)/(okOnes.length||1)
  console.log('\n=== Summary ===')
  console.log('Total:', results.length, 'Success:', okOnes.length, 'Fail:', results.length-okOnes.length)
  console.log('Average Upload ms:', avg.toFixed(2))
  if(okOnes[0]){
    console.log('Sample headers:', okOnes[0].headersInfo)
  }
  if(okOnes.length===0){
    process.exit(1)
  }
}

run().catch(e=>{ console.error('Unhandled error', e); process.exit(2) })
