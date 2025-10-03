#!/usr/bin/env node
/**
 * ساده‌ترین اسکریپت Smoke Test برای اطمینان از تنظیم صحیح محیط
 * اجرا:  node ./scripts/smokeCheck.mjs
 */
import fs from 'fs'
import path from 'path'
import url from 'url'

const projectRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')

const log = (label, status, extra='') => {
  const icon = status ? '✅' : '❌'
  console.log(`${icon} ${label}${extra ? ' - ' + extra : ''}`)
}

let overall = true

// 1. بررسی وجود env ها
const requiredEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
const missing = requiredEnv.filter(k => !process.env[k])
if (missing.length) {
  log('Environment Variables', false, 'Missing: ' + missing.join(', '))
  overall = false
} else {
  log('Environment Variables', true)
}

// 2. بررسی فایل‌های کلیدی
const requiredFiles = [
  'database/schema.sql',
  'src/services/supabase.js',
  'src/pages/Dashboard.jsx',
  'src/pages/Reports.jsx'
]
for (const f of requiredFiles) {
  const exists = fs.existsSync(path.join(projectRoot, f))
  log('File: ' + f, exists)
  if (!exists) overall = false
}

// 3. بررسی وجود توابع مهم در supabase.js
try {
  const supabasePath = path.join(projectRoot, 'src/services/supabase.js')
  const content = fs.readFileSync(supabasePath, 'utf8')
  const mustContain = ['export const signIn', 'export const changePassword', 'export const getInventoryDetailed', 'export const completeReceipt', 'export const completeTransfer']
  for (const token of mustContain) {
    const ok = content.includes(token)
    log('Symbol: ' + token, ok)
    if (!ok) overall = false
  }
} catch (e) {
  log('Read supabase.js', false, e.message)
  overall = false
}

// 4. گزارش نهایی
console.log('\n==============================')
if (overall) {
  console.log('✅ Smoke Test PASSED')
  process.exit(0)
} else {
  console.log('❌ Smoke Test FAILED')
  process.exit(1)
}
