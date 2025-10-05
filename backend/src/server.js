import Fastify from 'fastify'
import jwtPlugin from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

dotenv.config()

const app = Fastify({ logger: true })

// ENV
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const DATABASE_URL = process.env.DATABASE_URL || ''

if (!DATABASE_URL) {
  app.log.warn('DATABASE_URL is not set. The server will start but DB queries will fail.')
}

// DB Pool
export const pool = new Pool({ connectionString: DATABASE_URL, max: 10 })

// Plugins
await app.register(cors, { origin: true })
await app.register(rateLimit, { max: 300, timeWindow: '1 minute' })
await app.register(jwtPlugin, { secret: JWT_SECRET })
await app.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 } }) // 2MB cap

// Static directory for uploaded images (temporary local storage)
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
await app.register(fastifyStatic, { root: UPLOAD_DIR, prefix: '/files/' })

// Health route
app.get('/health', async () => ({ status: 'ok', time: new Date().toISOString() }))

// Utility: fetch user by username
async function findUserByUsername(username) {
  const { rows } = await pool.query('SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE username=$1 LIMIT 1', [username])
  return rows[0] || null
}

// Auth: login
app.post('/auth/login', async (req, reply) => {
  const { username, password } = req.body || {}
  if (!username || !password) return reply.code(400).send({ error: 'نام کاربری و رمز عبور الزامی است' })
  try {
    const user = await findUserByUsername(username)
    if (!user) return reply.code(401).send({ error: 'اعتبار نامعتبر است' })
    if (user.is_active === false) return reply.code(403).send({ error: 'کاربر غیرفعال است' })
    const ok = await bcrypt.compare(password, user.password_hash || '')
    if (!ok) return reply.code(401).send({ error: 'اعتبار نامعتبر است' })
    const payload = { sub: user.id, role: user.role }
    const token = await reply.jwtSign(payload, { expiresIn: '8h' })
    return { token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } }
  } catch (e) {
    req.log.error(e)
    return reply.code(500).send({ error: 'خطای داخلی سرور' })
  }
})

// Auth: current user
app.get('/auth/me', { preHandler: [authGuard] }, async (req) => {
  return { user: { id: req.user.sub, role: req.user.role } }
})

// Protected sample route
app.get('/secure/ping', { preHandler: [authGuard] }, async () => ({ pong: true }))

// Role guard example (usage later): app.get('/admin/only', { preHandler:[authGuard, roleGuard('super_admin')] }, ...)
function roleGuard(...roles) {
  return async (req, reply) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return reply.code(403).send({ error: 'دسترسی غیرمجاز' })
    }
  }
}

async function authGuard(req, reply) {
  try {
    await req.jwtVerify()
  } catch (e) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
}

// Global error handler
app.setErrorHandler((err, req, reply) => {
  req.log.error(err)
  const status = err.statusCode || 500
  reply.code(status).send({ error: err.message || 'Internal Server Error' })
})

// Start
app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => app.log.info(`API listening on :${PORT}`))
  .catch(err => { app.log.error(err); process.exit(1) })

// =============================================================
// Core Domain Routes (Protected)
// =============================================================

app.get('/drugs', { preHandler:[authGuard] }, async () => {
  const { rows } = await pool.query('SELECT id, name, package_type, image_url, is_active, created_at FROM drugs ORDER BY name')
  return rows
})

app.post('/drugs', { preHandler:[authGuard] }, async (req, reply) => {
  const { name, package_type, image_url } = req.body || {}
  if (!name) return reply.code(400).send({ error: 'نام دارو الزامی است' })
  const { rows } = await pool.query('INSERT INTO drugs(name, package_type, image_url) VALUES ($1,$2,$3) RETURNING *', [name, package_type || null, image_url || null])
  return rows[0]
})

// Update drug
app.patch('/drugs/:id', { preHandler:[authGuard] }, async (req, reply) => {
  const { id } = req.params
  const fields = ['name','package_type','image_url','is_active']
  const sets = []
  const values = []
  fields.forEach(f => {
    if (f in (req.body||{})) { sets.push(`${f}=$${sets.length+1}`); values.push(req.body[f]) }
  })
  if (!sets.length) return reply.code(400).send({ error: 'فیلدی برای به‌روزرسانی ارسال نشده' })
  values.push(id)
  const { rows } = await pool.query(`UPDATE drugs SET ${sets.join(',')}, updated_at=now() WHERE id=$${values.length} RETURNING *`, values)
  if (!rows[0]) return reply.code(404).send({ error: 'دارو یافت نشد' })
  return rows[0]
})

// Delete drug (simple, without deep integrity checks for now)
app.delete('/drugs/:id', { preHandler:[authGuard] }, async (req, reply) => {
  const { id } = req.params
  try {
    const { rowCount } = await pool.query('DELETE FROM drugs WHERE id=$1', [id])
    if (!rowCount) return reply.code(404).send({ error: 'دارو یافت نشد' })
    return { success: true }
  } catch (e) {
    return reply.code(400).send({ error: 'حذف ممکن نیست (وابستگی وجود دارد)' })
  }
})

app.get('/warehouses', { preHandler:[authGuard] }, async () => {
  const { rows } = await pool.query('SELECT id, name, is_active, created_at FROM warehouses ORDER BY created_at DESC')
  return rows
})

app.post('/warehouses', { preHandler:[authGuard] }, async (req, reply) => {
  const { name } = req.body || {}
  if (!name) return reply.code(400).send({ error: 'نام انبار الزامی است' })
  const { rows } = await pool.query('INSERT INTO warehouses(name) VALUES ($1) RETURNING *', [name])
  return rows[0]
})

// Inventory listing (optional warehouse filter)
app.get('/inventory', { preHandler:[authGuard] }, async (req) => {
  const { warehouse_id } = req.query || {}
  let sql = `SELECT i.id, i.quantity, i.batch_number, i.drug_id, i.warehouse_id, i.lot_id,
                    d.name AS drug_name, d.package_type, l.expire_date, l.lot_number,
                    w.name AS warehouse_name
             FROM inventory i
             JOIN drugs d ON d.id = i.drug_id
             JOIN warehouses w ON w.id = i.warehouse_id
             JOIN drug_lots l ON l.id = i.lot_id`
  const params = []
  if (warehouse_id) { sql += ' WHERE i.warehouse_id = $1'; params.push(warehouse_id) }
  sql += ' ORDER BY d.name'
  const { rows } = await pool.query(sql, params)
  return rows
})

// Create Receipt with items [{ drug_id, quantity, expire_date, lot_number?, batch_number? }]
app.post('/receipts', { preHandler:[authGuard] }, async (req, reply) => {
  const { destination_warehouse_id, supplier_id=null, notes=null, document_date=null, items=[] } = req.body || {}
  if (!destination_warehouse_id) return reply.code(400).send({ error: 'انبار مقصد الزامی است' })
  if (!Array.isArray(items) || items.length===0) return reply.code(400).send({ error: 'حداقل یک آیتم لازم است' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: receiptRows } = await client.query('INSERT INTO receipts(destination_warehouse_id, supplier_id, status, notes, document_date) VALUES ($1,$2,$3,$4, COALESCE($5,CURRENT_DATE)) RETURNING *', [destination_warehouse_id, supplier_id, 'pending', notes, document_date])
    const receipt = receiptRows[0]
    for (const raw of items) {
      if (!raw.drug_id || !raw.quantity || !raw.expire_date) { await client.query('ROLLBACK'); return reply.code(400).send({ error: 'آیتم نامعتبر' }) }
      // find or create lot
      const { rows: lotRows } = await client.query('SELECT id FROM drug_lots WHERE drug_id=$1 AND expire_date=$2 AND (lot_number IS NOT DISTINCT FROM $3) LIMIT 1', [raw.drug_id, raw.expire_date, raw.lot_number||null])
      let lotId = lotRows[0]?.id
      if (!lotId) {
        const { rows: newLot } = await client.query('INSERT INTO drug_lots(drug_id, expire_date, lot_number) VALUES ($1,$2,$3) RETURNING id', [raw.drug_id, raw.expire_date, raw.lot_number||null])
        lotId = newLot[0].id
      }
      await client.query('INSERT INTO receipt_items(receipt_id, drug_id, lot_id, quantity, batch_number, supplier_id, drug_name_snapshot, expire_date_snapshot) SELECT $1,$2,$3,$4,$5,$6,d.name,l.expire_date FROM drugs d JOIN drug_lots l ON l.id=$3 WHERE d.id=$2', [receipt.id, raw.drug_id, lotId, raw.quantity, raw.batch_number||null, supplier_id])
    }
    const { rows: itemsRows } = await client.query('SELECT * FROM receipt_items WHERE receipt_id=$1', [receipt.id])
    await client.query('COMMIT')
    return { receipt, items: itemsRows }
  } catch (e) {
    await client.query('ROLLBACK')
    reply.code(500)
    return { error: 'خطا در ایجاد رسید', details: e.message }
  } finally { client.release() }
})

// Complete receipt (move quantities into inventory)
app.post('/receipts/:id/complete', { preHandler:[authGuard] }, async (req, reply) => {
  const { id } = req.params
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: rRows } = await client.query('SELECT * FROM receipts WHERE id=$1 FOR UPDATE', [id])
    const receipt = rRows[0]
    if (!receipt) { await client.query('ROLLBACK'); return reply.code(404).send({ error: 'رسید یافت نشد' }) }
    if (receipt.status !== 'pending') { await client.query('ROLLBACK'); return reply.code(400).send({ error: 'وضعیت معتبر نیست' }) }
    const { rows: items } = await client.query('SELECT * FROM receipt_items WHERE receipt_id=$1', [id])
    for (const it of items) {
      // upsert inventory
      const { rows: inv } = await client.query('SELECT id, quantity FROM inventory WHERE drug_id=$1 AND warehouse_id=$2 AND lot_id=$3 AND (batch_number IS NOT DISTINCT FROM $4) LIMIT 1', [it.drug_id, receipt.destination_warehouse_id, it.lot_id, it.batch_number])
      if (inv[0]) {
        await client.query('UPDATE inventory SET quantity=quantity+$1, updated_at=now() WHERE id=$2', [it.quantity, inv[0].id])
      } else {
        await client.query('INSERT INTO inventory(drug_id, warehouse_id, lot_id, batch_number, quantity) VALUES ($1,$2,$3,$4,$5)', [it.drug_id, receipt.destination_warehouse_id, it.lot_id, it.batch_number, it.quantity])
      }
    }
  await client.query("UPDATE receipts SET status='completed', completed_at=now() WHERE id=$1", [id])
    await client.query('COMMIT')
    return { status: 'completed' }
  } catch (e) {
    await client.query('ROLLBACK')
    reply.code(500)
    return { error: 'خطا در تکمیل رسید', details: e.message }
  } finally { client.release() }
})

// Create transfer: items [{ inventory_id, quantity_sent }]
app.post('/transfers', { preHandler:[authGuard] }, async (req, reply) => {
  const { source_warehouse_id, destination_warehouse_id, notes=null, items=[], document_date=null } = req.body || {}
  if (!source_warehouse_id || !destination_warehouse_id) return reply.code(400).send({ error: 'انبار مبدا و مقصد الزامی است' })
  if (source_warehouse_id === destination_warehouse_id) return reply.code(400).send({ error: 'انبارها نباید یکسان باشند' })
  if (!Array.isArray(items) || items.length===0) return reply.code(400).send({ error: 'لیست آیتم خالی است' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: tRows } = await client.query('INSERT INTO transfers(source_warehouse_id, destination_warehouse_id, status, notes, created_by_user_id, document_date) VALUES ($1,$2,$3,$4,$5, COALESCE($6,CURRENT_DATE)) RETURNING *', [source_warehouse_id, destination_warehouse_id, 'in_transit', notes, req.user.sub, document_date])
    const transfer = tRows[0]
    for (const it of items) {
      if (!it.inventory_id || !it.quantity_sent) { await client.query('ROLLBACK'); return reply.code(400).send({ error: 'آیتم حواله نامعتبر' }) }
      const { rows: inv } = await client.query('SELECT id, quantity, drug_id, lot_id, batch_number, warehouse_id FROM inventory WHERE id=$1 FOR UPDATE', [it.inventory_id])
      const row = inv[0]
      if (!row) { await client.query('ROLLBACK'); return reply.code(404).send({ error: 'موجودی یافت نشد' }) }
      if (row.warehouse_id !== source_warehouse_id) { await client.query('ROLLBACK'); return reply.code(400).send({ error: 'موجودی متعلق به انبار مبدا نیست' }) }
      if (row.quantity < it.quantity_sent) { await client.query('ROLLBACK'); return reply.code(400).send({ error: 'موجودی کافی نیست' }) }
      await client.query('UPDATE inventory SET quantity=quantity-$1, updated_at=now() WHERE id=$2', [it.quantity_sent, row.id])
      await client.query('INSERT INTO transfer_items(transfer_id, inventory_id, lot_id, quantity_sent, drug_name_snapshot, expire_date_snapshot) SELECT $1,$2,$3,$4,d.name,l.expire_date FROM drugs d JOIN drug_lots l ON l.id=$3 WHERE d.id=$5', [transfer.id, row.id, row.lot_id, it.quantity_sent, row.drug_id])
    }
    await client.query('COMMIT')
    return { transfer_id: transfer.id }
  } catch (e) {
    await client.query('ROLLBACK')
    reply.code(500)
    return { error: 'خطا در ایجاد حواله', details: e.message }
  } finally { client.release() }
})

app.post('/transfers/:id/complete', { preHandler:[authGuard] }, async (req, reply) => {
  const { id } = req.params
  const { items=[] } = req.body || {} // items: [{ transfer_item_id, quantity_received }]
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: tRows } = await client.query('SELECT * FROM transfers WHERE id=$1 FOR UPDATE', [id])
    const transfer = tRows[0]
    if (!transfer) { await client.query('ROLLBACK'); return reply.code(404).send({ error: 'حواله یافت نشد' }) }
    if (transfer.status !== 'in_transit') { await client.query('ROLLBACK'); return reply.code(400).send({ error: 'وضعیت حواله معتبر نیست' }) }
    const { rows: tItems } = await client.query('SELECT ti.*, inv.drug_id, inv.lot_id, inv.batch_number FROM transfer_items ti JOIN inventory inv ON inv.id = ti.inventory_id WHERE transfer_id=$1', [id])
    for (const patch of items) {
      const orig = tItems.find(r => r.id === patch.transfer_item_id)
      if (!orig) { await client.query('ROLLBACK'); return reply.code(400).send({ error: 'آیتم حواله نامعتبر' }) }
      const qtyRecv = Number(patch.quantity_received || orig.quantity_sent)
      // upsert into destination warehouse inventory
      const { rows: invDest } = await client.query('SELECT id FROM inventory WHERE drug_id=$1 AND warehouse_id=$2 AND lot_id=$3 AND (batch_number IS NOT DISTINCT FROM $4) LIMIT 1', [orig.drug_id, transfer.destination_warehouse_id, orig.lot_id, orig.batch_number])
      if (invDest[0]) {
        await client.query('UPDATE inventory SET quantity=quantity+$1, updated_at=now() WHERE id=$2', [qtyRecv, invDest[0].id])
      } else {
        await client.query('INSERT INTO inventory(drug_id, warehouse_id, lot_id, batch_number, quantity) VALUES ($1,$2,$3,$4,$5)', [orig.drug_id, transfer.destination_warehouse_id, orig.lot_id, orig.batch_number, qtyRecv])
      }
      await client.query('UPDATE transfer_items SET quantity_received=$1 WHERE id=$2', [qtyRecv, orig.id])
    }
  await client.query("UPDATE transfers SET status='completed', completed_at=now() WHERE id=$1", [id])
    await client.query('COMMIT')
    return { status: 'completed' }
  } catch (e) {
    await client.query('ROLLBACK')
    reply.code(500)
    return { error: 'خطا در تکمیل حواله', details: e.message }
  } finally { client.release() }
})

// Listings for receipts & transfers (basic pagination via query params later if needed)
app.get('/receipts', { preHandler:[authGuard] }, async (req) => {
  const { rows } = await pool.query('SELECT id, destination_warehouse_id, status, created_at, completed_at, document_date FROM receipts ORDER BY created_at DESC LIMIT 200')
  return rows
})

app.get('/transfers', { preHandler:[authGuard] }, async (req) => {
  const { rows } = await pool.query('SELECT id, source_warehouse_id, destination_warehouse_id, status, created_at, completed_at, document_date FROM transfers ORDER BY created_at DESC LIMIT 200')
  return rows
})

// ==============================================
// File Upload (local placeholder)      
// POST /upload multipart/form-data => { file }  
// Returns: { url }
// ==============================================
app.post('/upload', { preHandler:[authGuard] }, async (req, reply) => {
  const parts = req.parts()
  for await (const part of parts) {
    if (part.type === 'file') {
      const ext = path.extname(part.filename || '').toLowerCase()
      if (!['.png','.jpg','.jpeg','.webp','.gif','.svg','.bmp','.tiff','.webp'].includes(ext)) {
        return reply.code(400).send({ error: 'فرمت فایل پشتیبانی نمی‌شود' })
      }
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext || '.bin'}`
      const dest = path.join(UPLOAD_DIR, fileName)
      const ws = fs.createWriteStream(dest)
      await part.file.pipe(ws)
      const publicUrl = `/files/${fileName}`
      return { url: publicUrl }
    }
  }
  return reply.code(400).send({ error: 'فایل ارسال نشد' })
})
