import { readFile } from 'fs/promises'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL env not set')
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

async function run() {
  try {
    const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
    await pool.query(sql)
    console.log('Schema applied successfully.')
  } catch (e) {
    console.error('Migration failed:', e.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
