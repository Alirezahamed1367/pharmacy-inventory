#!/usr/bin/env node
// PocketBase initialization script
// Creates domain collections if they don't already exist and ensures auth fields.
// Usage (PowerShell):
//   $env:PB_URL='http://127.0.0.1:8090'; $env:PB_ADMIN_EMAIL='admin@example.com'; $env:PB_ADMIN_PASSWORD='YourPass'; npm run pb:init

import PocketBase from 'pocketbase'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

// Simple CLI arg parsing (--key=value or --key value)
function parseArgs(){
  const out = {}
  const argv = process.argv.slice(2)
  for (let i=0;i<argv.length;i++){
    let a = argv[i]
    if (!a.startsWith('--')) continue
    a = a.replace(/^--/,'')
    let [k,v] = a.split('=')
    if (v === undefined){
      // lookahead
      if (i+1 < argv.length && !argv[i+1].startsWith('--')) { v = argv[++i] }
    }
    out[k] = v === undefined ? true : v
  }
  return out
}

function loadDotEnv(){
  const candidates = ['.env.local', '.env']
  for (const file of candidates){
    const p = path.resolve(process.cwd(), file)
    if (fs.existsSync(p)){
      try {
        const content = fs.readFileSync(p,'utf8')
        content.split(/\r?\n/).forEach(line => {
          if (!line || line.startsWith('#')) return
            const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
            if (m){
              const key = m[1].trim()
              if (process.env[key] === undefined){
                // strip optional surrounding quotes
                let val = m[2].trim().replace(/^['"]|['"]$/g,'')
                process.env[key] = val
              }
            }
        })
      } catch(e){ /* ignore */ }
    }
  }
}

loadDotEnv()
const args = parseArgs()

const pbUrl = args.url || process.env.PB_URL || 'http://127.0.0.1:8090'
let adminEmail = args.email || process.env.PB_ADMIN_EMAIL
let adminPassword = args.password || process.env.PB_ADMIN_PASSWORD

// Positional fallback: first non-flag arg with '@' => email, next => password
const positional = process.argv.slice(2).filter(a => !a.startsWith('--'))
if (!adminEmail && positional.length){
  const e = positional.find(p => p.includes('@'))
  if (e) adminEmail = e
}
if (!adminPassword && positional.length){
  const idx = positional.findIndex(p => p.includes('@'))
  if (idx !== -1 && positional[idx+1]) adminPassword = positional[idx+1]
}

async function promptCredentials(){
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const q = (t) => new Promise(res => rl.question(t, ans => res(ans.trim())))
  const email = await q('Admin email: ')
  const pass = await q('Admin password: ')
  rl.close()
  return { email, pass }
}

let effectiveEmail = adminEmail
let effectivePassword = adminPassword

if (!effectiveEmail || !effectivePassword) {
  console.warn('\n[WARN] Admin credentials not fully provided via env/flags.')
  console.warn(' process.argv =', process.argv.slice(2).join(' '))
  console.warn(' Detected args object =', args)
  console.warn(' Current PB_* environment snapshot:')
  Object.keys(process.env).filter(k => k.startsWith('PB_')).forEach(k => console.warn('  ', k, '=', process.env[k] ? '[set]' : '[empty]'))
  const entered = await promptCredentials()
  effectiveEmail = entered.email
  effectivePassword = entered.pass
}

if (!effectiveEmail || !effectivePassword){
  console.error('\n[FATAL] Could not obtain admin credentials. Aborting.')
  process.exit(1)
}

const pb = new PocketBase(pbUrl)

function genId(){
  // generate 15 char id (not guaranteed format, but acceptable for custom fields)
  return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).replace(/[^a-z0-9]/gi,'').slice(0,15)
}

async function ensureAuthExtraFields(){
  const cols = await pb.collections.getFullList()
  const usersCol = cols.find(c => c.name === 'users' && c.type === 'auth')
  if (!usersCol) {
    console.warn('[WARN] Auth collection (users) not found – create an admin manually first via UI then rerun.')
    return
  }
  const wanted = [
    { name: 'role', type:'select', required:true, options:{ maxSelect:1, values:['super_admin','admin','manager'] } },
    { name: 'is_active', type:'bool', required:false, options:{} }
  ]
  let changed = false
  for (const w of wanted){
    if (!usersCol.schema.find(f => f.name === w.name)) {
      usersCol.schema.push({ id: genId(), system:false, unique:false, ...w })
      changed = true
      console.log(' + adding auth field:', w.name)
    }
  }
  if (changed){
    await pb.collections.update(usersCol.id, {
      schema: usersCol.schema,
      listRule: usersCol.listRule ?? null,
      viewRule: usersCol.viewRule ?? "@request.auth.id != ''",
      createRule: usersCol.createRule ?? null,
      updateRule: usersCol.updateRule ?? "@request.auth.id != ''",
      deleteRule: usersCol.deleteRule ?? "@request.auth.role = 'super_admin'"
    })
    console.log('Auth collection updated.')
  } else {
    console.log('Auth fields already present.')
  }
}

const domainCollections = [
  {
    name:'warehouses',
    schema:[
      { name:'name', type:'text', required:true, unique:true, options:{ min:1, max:120, pattern:'' } }
    ],
    indexes:'',
  },
  {
    name:'drugs',
    schema:[
      { name:'name', type:'text', required:true, unique:true, options:{ min:1, max:255, pattern:'' } },
      { name:'code', type:'text', required:false, unique:false, options:{ min:0, max:60, pattern:'' } },
      { name:'description', type:'text', required:false, unique:false, options:{ min:0, max:1000, pattern:'' } },
      { name:'image', type:'file', required:false, unique:false, options:{ maxSelect:1, maxSize:524288, mimeTypes:['image/jpeg','image/png','image/webp','image/avif'], thumbs:['100x100','300x300'], protected:false } }
    ],
    indexes:'CREATE UNIQUE INDEX idx_drugs_name ON drugs (name)'
  },
  {
    name:'drug_lots',
    schema:[
      { name:'drug', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:true, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'lot_number', type:'text', required:true, unique:false, options:{ min:1, max:80, pattern:'' } },
      { name:'expire_date', type:'date', required:true, unique:false, options:{} }
    ],
    indexes:'CREATE INDEX idx_lots_drug ON drug_lots (drug);\nCREATE UNIQUE INDEX idx_lots_unique ON drug_lots (drug, lot_number)'
  },
  {
    name:'inventory',
    schema:[
      { name:'warehouse', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:false, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'drug_lot', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:true, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'quantity', type:'number', required:true, unique:false, options:{ min:0, max:null } }
    ],
    indexes:'CREATE UNIQUE INDEX idx_inventory_unique ON inventory (warehouse, drug_lot)'
  },
  {
    name:'receipts',
    schema:[
      { name:'warehouse', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:false, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'status', type:'select', required:true, unique:false, options:{ maxSelect:1, values:['draft','completed'] } },
      { name:'document_date', type:'date', required:false, unique:false, options:{} }
    ],
    indexes:''
  },
  {
    name:'receipt_items',
    schema:[
      { name:'receipt', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:true, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'drug_lot', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:false, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'quantity', type:'number', required:true, unique:false, options:{ min:0, max:null } }
    ],
    indexes:''
  },
  {
    name:'transfers',
    schema:[
      { name:'source_wh', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:false, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'target_wh', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:false, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'status', type:'select', required:true, unique:false, options:{ maxSelect:1, values:['draft','completed'] } },
      { name:'document_date', type:'date', required:false, unique:false, options:{} }
    ],
    indexes:''
  },
  {
    name:'transfer_items',
    schema:[
      { name:'transfer', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:true, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'drug_lot', type:'relation', required:true, unique:false, options:{ collectionId:'', cascadeDelete:false, minSelect:null, maxSelect:1, displayFields:null } },
      { name:'quantity', type:'number', required:true, unique:false, options:{ min:0, max:null } }
    ],
    indexes:''
  }
]

async function main(){
  console.log('[INFO] Connecting to', pbUrl)
  // Connectivity probe
  try {
    const health = await fetch(pbUrl + '/api/health', { method:'GET' })
    if (!health.ok) console.warn('[WARN] Health endpoint status', health.status)
    else console.log('[OK] PocketBase reachable.')
  } catch (e){
    console.error('[FATAL] Cannot reach PocketBase at', pbUrl)
    console.error('  -> Start it first: ./pocketbase serve (or .\\pocketbase.exe serve on Windows)')
    process.exit(1)
  }
  let authed = false
  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword)
    console.log('[OK] Admin authenticated (admins endpoint).')
    authed = true
  } catch (e) {
    if (e?.status === 404) {
      console.warn('[WARN] admins auth endpoint 404 – trying superusers (PB >=0.30 change).')
      try {
        const res = await fetch(pbUrl + '/api/superusers/auth-with-password', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ identity: adminEmail, password: adminPassword })
        })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error('superusers auth failed: '+res.status+' '+txt)
        }
        const data = await res.json()
        if (!data?.token) throw new Error('superusers auth: no token in response')
        console.log('[OK] Superuser authenticated.')
        // manually assign token so sdk calls that rely on auth succeed
        pb.authStore.save(data.token, data?.admin || data?.superuser || {})
        authed = true
      } catch (e2) {
        throw e2
      }
    } else {
      throw e
    }
  }
  if (!authed) throw new Error('Authentication failed at all endpoints.')

  // load existing collections to map IDs for relations
  const existing = await pb.collections.getFullList()
  const byName = Object.fromEntries(existing.map(c => [c.name, c]))

  // First ensure base collections required for relation chain ordering
  const creationOrder = ['warehouses','drugs','drug_lots','inventory','receipts','receipt_items','transfers','transfer_items']

  for (const name of creationOrder){
    if (byName[name]) { console.log('= exists:', name); continue }
    const def = domainCollections.find(d => d.name === name)
    if (!def) continue
    // Resolve relation target collectionIds if target already created
    def.schema = def.schema.map(f => {
      if (f.type === 'relation' && f.options && f.options.collectionId === '') {
        // try guess target based on field name
        const guess = f.name.replace(/^(source_|target_)/,'').replace(/^(drug_)?/,'')
        // define mapping manual
        const mapping = {
          drug:'drugs',
          warehouse:'warehouses',
          drug_lot:'drug_lots',
          lot:'drug_lots',
          receipt:'receipts',
          transfer:'transfers',
          source_wh:'warehouses',
          target_wh:'warehouses'
        }
        const target = mapping[f.name] || mapping[guess] || guess
        if (byName[target]) f.options.collectionId = byName[target].id
      }
      return f
    })
    const payload = {
      name: def.name,
      type: 'base',
      schema: def.schema.map(s => ({ id: genId(), system:false, unique: s.unique||false, ...s })),
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      indexes: def.indexes
    }
    const created = await pb.collections.create(payload)
    byName[name] = created
    console.log('+ created collection:', name)
  }

  // second pass: update relation fields that were unresolved at creation time
  for (const name of creationOrder){
    const col = byName[name]
    if (!col) continue
    let updated = false
    for (const f of col.schema){
      if (f.type === 'relation' && (!f.options.collectionId || f.options.collectionId === '')){
        const mapping = {
          drug:'drugs',
          warehouse:'warehouses',
          drug_lot:'drug_lots',
          lot:'drug_lots',
          receipt:'receipts',
          transfer:'transfers',
          source_wh:'warehouses',
          target_wh:'warehouses'
        }
        const target = mapping[f.name]
        if (target && byName[target]) { f.options.collectionId = byName[target].id; updated = true }
      }
    }
    if (updated){
      await pb.collections.update(col.id, { schema: col.schema })
      console.log('~ updated relations for', name)
    }
  }

  await ensureAuthExtraFields()
  console.log('\n[DONE] Initialization complete.')
}

main().catch(e => {
  if (e?.data) {
    console.error('[FATAL] PocketBase error data:', JSON.stringify(e.data, null, 2))
  }
  console.error('[FATAL]', e?.message || e)
  console.error('Stack:', e?.stack?.split('\n').slice(0,6).join('\n'))
  console.error('\nDiagnostics:')
  console.error('  pbUrl =', pbUrl)
  console.error('  email provided =', !!effectiveEmail)
  console.error('  password length =', effectivePassword ? effectivePassword.length : 0)
  console.error('  Node version =', process.version)
  console.error('  Args =', process.argv.slice(2).join(' '))
  process.exit(1)
})