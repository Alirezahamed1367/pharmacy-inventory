import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwtPlugin from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'
import crypto from 'crypto'

const DB_FILE = process.env.SQLITE_FILE || path.resolve(process.cwd(), 'local.db')
const db = new Database(DB_FILE)

db.pragma('journal_mode = WAL')
// Resolve schema path robustly (works whether cwd is project root or backend/)
const possiblePaths = [
  path.resolve(process.cwd(), 'backend/src/schema.sqlite.sql'),
  path.resolve(process.cwd(), 'src/schema.sqlite.sql'),
  path.resolve(path.dirname(new URL(import.meta.url).pathname), 'schema.sqlite.sql')
]
let schemaFile = null
for (const p of possiblePaths) { if (fs.existsSync(p)) { schemaFile = p; break } }
if (!schemaFile) {
  throw new Error('schema.sqlite.sql not found. Checked: ' + possiblePaths.join(' | '))
}
const schema = fs.readFileSync(schemaFile, 'utf8')
db.exec(schema)

function uuid() { return crypto.randomUUID() }

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })
await app.register(rateLimit, { max: 200, timeWindow: '1 minute' })
await app.register(jwtPlugin, { secret: process.env.JWT_SECRET || 'local-secret' })
await app.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 } })

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
await app.register(fastifyStatic, { root: UPLOAD_DIR, prefix: '/files/' })

// Helpers
const q = {
  userByUsername: db.prepare('SELECT * FROM users WHERE username=?'),
  insertDrug: db.prepare('INSERT INTO drugs(id,name,package_type,image_url) VALUES (?,?,?,?)'),
  listDrugs: db.prepare('SELECT id,name,package_type,image_url,is_active,created_at FROM drugs ORDER BY name'),
  updateDrug: db.prepare('UPDATE drugs SET name=COALESCE(?,name), package_type=COALESCE(?,package_type), image_url=COALESCE(?,image_url), is_active=COALESCE(?,is_active), updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  deleteDrug: db.prepare('DELETE FROM drugs WHERE id=?'),
  listWarehouses: db.prepare('SELECT id,name,is_active,created_at FROM warehouses ORDER BY created_at DESC'),
  insertWarehouse: db.prepare('INSERT INTO warehouses(id,name) VALUES (?,?)'),
  insertLot: db.prepare('INSERT INTO drug_lots(id,drug_id,expire_date,lot_number) VALUES (?,?,?,?)'),
  findLot: db.prepare('SELECT id FROM drug_lots WHERE drug_id=? AND expire_date=? AND (lot_number IS ? OR lot_number=?) LIMIT 1'),
  insertReceipt: db.prepare('INSERT INTO receipts(id,destination_warehouse_id,supplier_id,status,notes,document_date) VALUES (?,?,?,?,?,?)'),
  insertReceiptItem: db.prepare(`INSERT INTO receipt_items(id,receipt_id,drug_id,lot_id,quantity,batch_number,supplier_id,drug_name_snapshot,expire_date_snapshot)
    VALUES (?,?,?,?,?,?,?,?,?)`),
  listReceiptItems: db.prepare('SELECT * FROM receipt_items WHERE receipt_id=?'),
  getReceipt: db.prepare('SELECT * FROM receipts WHERE id=?'),
  setReceiptCompleted: db.prepare("UPDATE receipts SET status='completed', completed_at=CURRENT_TIMESTAMP WHERE id=?"),
  findInventory: db.prepare('SELECT id,quantity FROM inventory WHERE drug_id=? AND warehouse_id=? AND lot_id=? AND (batch_number IS ? OR batch_number=?) LIMIT 1'),
  insertInventory: db.prepare('INSERT INTO inventory(id,drug_id,warehouse_id,lot_id,batch_number,quantity) VALUES (?,?,?,?,?,?)'),
  updateInventoryQty: db.prepare('UPDATE inventory SET quantity=quantity+?, updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  listInventory: db.prepare(`SELECT i.id,i.quantity,i.batch_number,i.drug_id,i.warehouse_id,i.lot_id,d.name as drug_name,d.package_type,l.expire_date,w.name as warehouse_name
    FROM inventory i
    JOIN drugs d ON d.id=i.drug_id
    JOIN warehouses w ON w.id=i.warehouse_id
    JOIN drug_lots l ON l.id=i.lot_id
    ORDER BY d.name`),
  insertTransfer: db.prepare('INSERT INTO transfers(id,source_warehouse_id,destination_warehouse_id,status,notes,created_by_user_id,document_date) VALUES (?,?,?,?,?,?,?)'),
  getTransfer: db.prepare('SELECT * FROM transfers WHERE id=?'),
  insertTransferItem: db.prepare(`INSERT INTO transfer_items(id,transfer_id,inventory_id,lot_id,quantity_sent,drug_name_snapshot,expire_date_snapshot)
    VALUES (?,?,?,?,?,?,?)`),
  listTransferItems: db.prepare('SELECT ti.*, inv.drug_id, inv.lot_id, inv.batch_number FROM transfer_items ti JOIN inventory inv ON inv.id=ti.inventory_id WHERE transfer_id=?'),
  setTransferCompleted: db.prepare("UPDATE transfers SET status='completed', completed_at=CURRENT_TIMESTAMP WHERE id=?"),
  findDestInventory: db.prepare('SELECT id FROM inventory WHERE drug_id=? AND warehouse_id=? AND lot_id=? AND (batch_number IS ? OR batch_number=?) LIMIT 1'),
  listReceipts: db.prepare('SELECT id,destination_warehouse_id,status,created_at,completed_at,document_date FROM receipts ORDER BY created_at DESC LIMIT 200'),
  listTransfers: db.prepare('SELECT id,source_warehouse_id,destination_warehouse_id,status,created_at,completed_at,document_date FROM transfers ORDER BY created_at DESC LIMIT 200')
}

function authGuard(req, reply, done){
  try { req.jwtVerify(); done() } catch { reply.code(401).send({ error:'Unauthorized' }) }
}

app.get('/health', () => ({ status:'ok', mode:'sqlite' }))

app.post('/auth/login', async (req, reply) => {
  const { username, password } = req.body || {}
  if (!username || !password) return reply.code(400).send({ error:'نام کاربری و رمز عبور الزامی است' })
  const user = q.userByUsername.get(username)
  if (!user || !user.is_active) return reply.code(401).send({ error:'اعتبار نامعتبر' })
  const ok = await bcrypt.compare(password, user.password_hash || '')
  if (!ok) return reply.code(401).send({ error:'اعتبار نامعتبر' })
  const token = await reply.jwtSign({ sub: user.id, role: user.role })
  return { token, user: { id:user.id, username:user.username, full_name:user.full_name, role:user.role } }
})

app.get('/drugs', { preHandler:[authGuard] }, () => q.listDrugs.all())
app.post('/drugs', { preHandler:[authGuard] }, (req, reply) => {
  const { name, package_type, image_url } = req.body || {}
  if (!name) return reply.code(400).send({ error:'نام دارو الزامی است' })
  const id = uuid()
  q.insertDrug.run(id, name, package_type || null, image_url || null)
  return { id, name, package_type, image_url, is_active:1 }
})
app.patch('/drugs/:id', { preHandler:[authGuard] }, (req, reply) => {
  const { id } = req.params
  const { name, package_type, image_url, is_active } = req.body || {}
  q.updateDrug.run(name ?? null, package_type ?? null, image_url ?? null, is_active ?? null, id)
  return { id }
})
app.delete('/drugs/:id', { preHandler:[authGuard] }, (req) => { q.deleteDrug.run(req.params.id); return { success:true } })

app.get('/warehouses', { preHandler:[authGuard] }, () => q.listWarehouses.all())
app.post('/warehouses', { preHandler:[authGuard] }, (req, reply) => {
  const { name } = req.body || {}
  if (!name) return reply.code(400).send({ error:'نام انبار الزامی است' })
  const id = uuid(); q.insertWarehouse.run(id, name)
  return { id, name, is_active:1 }
})

app.get('/inventory', { preHandler:[authGuard] }, (req) => q.listInventory.all())

app.post('/receipts', { preHandler:[authGuard] }, (req, reply) => {
  const { destination_warehouse_id, supplier_id=null, notes=null, document_date=null, items=[] } = req.body || {}
  if (!destination_warehouse_id || !Array.isArray(items) || !items.length) return reply.code(400).send({ error:'داده نامعتبر' })
  const rid = uuid(); q.insertReceipt.run(rid, destination_warehouse_id, supplier_id, 'pending', notes, document_date)
  const insertLot = (drug_id, expire_date, lot_number) => {
    const found = q.findLot.get(drug_id, expire_date, lot_number||null, lot_number||null)
    if (found) return found.id
    const lid = uuid(); q.insertLot.run(lid, drug_id, expire_date, lot_number||null); return lid
  }
  for (const raw of items) {
    if (!raw.drug_id || !raw.quantity || !raw.expire_date) return reply.code(400).send({ error:'آیتم نامعتبر' })
    const lotId = insertLot(raw.drug_id, raw.expire_date, raw.lot_number)
    const drugRow = db.prepare('SELECT name FROM drugs WHERE id=?').get(raw.drug_id)
    q.insertReceiptItem.run(uuid(), rid, raw.drug_id, lotId, raw.quantity, raw.batch_number||null, supplier_id, drugRow?.name || null, raw.expire_date)
  }
  return { receipt_id: rid }
})

app.post('/receipts/:id/complete', { preHandler:[authGuard] }, (req, reply) => {
  const { id } = req.params
  const receipt = q.getReceipt.get(id)
  if (!receipt) return reply.code(404).send({ error:'رسید یافت نشد' })
  if (receipt.status !== 'pending') return reply.code(400).send({ error:'وضعیت معتبر نیست' })
  const items = q.listReceiptItems.all(id)
  for (const it of items) {
    const inv = q.findInventory.get(it.drug_id, receipt.destination_warehouse_id, it.lot_id, it.batch_number || null, it.batch_number || null)
    if (inv) q.updateInventoryQty.run(it.quantity, inv.id)
    else q.insertInventory.run(uuid(), it.drug_id, receipt.destination_warehouse_id, it.lot_id, it.batch_number || null, it.quantity)
  }
  q.setReceiptCompleted.run(id)
  return { status:'completed' }
})

app.post('/transfers', { preHandler:[authGuard] }, (req, reply) => {
  const { source_warehouse_id, destination_warehouse_id, notes=null, items=[], document_date=null } = req.body || {}
  if (!source_warehouse_id || !destination_warehouse_id || source_warehouse_id === destination_warehouse_id) return reply.code(400).send({ error:'انبار نامعتبر' })
  if (!Array.isArray(items) || !items.length) return reply.code(400).send({ error:'لیست آیتم خالی' })
  const tid = uuid(); q.insertTransfer.run(tid, source_warehouse_id, destination_warehouse_id, 'in_transit', notes, null, document_date)
  for (const it of items) {
    const inv = db.prepare('SELECT id,drug_id,lot_id,batch_number,quantity FROM inventory WHERE id=?').get(it.inventory_id)
    if (!inv) return reply.code(404).send({ error:'موجودی یافت نشد' })
    if (inv.quantity < it.quantity_sent) return reply.code(400).send({ error:'موجودی کافی نیست' })
    db.prepare('UPDATE inventory SET quantity=quantity-?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(it.quantity_sent, inv.id)
    const drugRow = db.prepare('SELECT name FROM drugs WHERE id=?').get(inv.drug_id)
    const lotRow = db.prepare('SELECT expire_date FROM drug_lots WHERE id=?').get(inv.lot_id)
    q.insertTransferItem.run(uuid(), tid, inv.id, inv.lot_id, it.quantity_sent, drugRow?.name || null, lotRow?.expire_date || null)
  }
  return { transfer_id: tid }
})

app.post('/transfers/:id/complete', { preHandler:[authGuard] }, (req, reply) => {
  const { id } = req.params
  const transfer = q.getTransfer.get(id)
  if (!transfer) return reply.code(404).send({ error:'حواله یافت نشد' })
  if (transfer.status !== 'in_transit') return reply.code(400).send({ error:'وضعیت حواله معتبر نیست' })
  const items = q.listTransferItems.all(id)
  for (const it of items) {
    const inv = q.findDestInventory.get(it.drug_id, transfer.destination_warehouse_id, it.lot_id, it.batch_number || null, it.batch_number || null)
    if (inv) q.updateInventoryQty.run(it.quantity_sent, inv.id)
    else q.insertInventory.run(uuid(), it.drug_id, transfer.destination_warehouse_id, it.lot_id, it.batch_number || null, it.quantity_sent)
  }
  q.setTransferCompleted.run(id)
  return { status:'completed' }
})

app.get('/receipts', { preHandler:[authGuard] }, () => q.listReceipts.all())
app.get('/transfers', { preHandler:[authGuard] }, () => q.listTransfers.all())

app.post('/upload', { preHandler:[authGuard] }, async (req, reply) => {
  const parts = req.parts()
  for await (const part of parts) {
    if (part.type === 'file') {
      const ext = path.extname(part.filename || '').toLowerCase()
      if (!['.png','.jpg','.jpeg','.webp','.gif','.svg','.bmp','.tiff'].includes(ext)) return reply.code(400).send({ error:'فرمت پشتیبانی نمی‌شود' })
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
      const dest = path.join(UPLOAD_DIR, fileName)
      await part.file.pipe(fs.createWriteStream(dest))
      return { url: `/files/${fileName}` }
    }
  }
  return reply.code(400).send({ error:'فایل ارسال نشد' })
})

app.listen({ port: process.env.PORT || 4100, host: '0.0.0.0' })
  .then(()=> app.log.info('SQLite API listening'))
  .catch(err => { app.log.error(err); process.exit(1) })
