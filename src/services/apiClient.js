// Simple REST API client replacing Supabase usage
// نویسنده: مهاجرت از Supabase به Fastify (پاییز 1404)

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getToken() {
  return localStorage.getItem('authToken') || null
}

function setToken(t) {
  if (t) localStorage.setItem('authToken', t)
}

export function clearSession() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('userRole')
}

async function request(path, { method='GET', body, formData, headers={} }={}) {
  const token = getToken()
  const finalHeaders = { ...headers }
  if (!formData) finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || (body ? 'application/json' : undefined)
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: formData ? formData : body ? JSON.stringify(body) : undefined
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = { raw: text }}
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText
    return { data: null, error: { message: msg, status: res.status } }
  }
  return { data, error: null }
}

// Auth
export async function apiLogin(username, password) {
  const r = await request('/auth/login', { method:'POST', body:{ username, password } })
  if (!r.error && r.data?.token) {
    setToken(r.data.token)
    localStorage.setItem('currentUser', JSON.stringify(r.data.user))
    localStorage.setItem('userRole', r.data.user.role)
  }
  return r
}

export async function apiMe() { return request('/auth/me') }

// Drugs
export async function getDrugs() { return request('/drugs') }
export async function addDrug(payload) { return request('/drugs', { method:'POST', body: payload }) }
export async function updateDrug(id, payload) { return request(`/drugs/${id}`, { method:'PATCH', body: payload }) }
export async function deleteDrug(id) { return request(`/drugs/${id}`, { method:'DELETE' }) }

// Warehouses
export async function getWarehouses() { return request('/warehouses') }
export async function addWarehouse(payload) { return request('/warehouses', { method:'POST', body: payload }) }
export async function updateWarehouse(id, payload) { return request(`/warehouses/${id}`, { method:'PATCH', body: payload }) }

// Inventory
export async function getInventory(params={}) {
  const qs = new URLSearchParams()
  if (params.warehouse_id) qs.set('warehouse_id', params.warehouse_id)
  const q = qs.toString()?`?${qs}`:''
  return request(`/inventory${q}`)
}

// Receipts
export async function createReceipt(payload){ return request('/receipts', { method:'POST', body: payload }) }
export async function completeReceipt(id){ return request(`/receipts/${id}/complete`, { method:'POST' }) }
export async function getReceipts(){ return request('/receipts') }

// Transfers
export async function createTransfer(payload){ return request('/transfers', { method:'POST', body: payload }) }
export async function completeTransfer(id, items){ return request(`/transfers/${id}/complete`, { method:'POST', body:{ items } }) }
export async function getTransfers(){ return request('/transfers') }

// Upload (uses multipart)
export async function uploadImageFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request('/upload', { method:'POST', formData: fd })
}

export function isApiConfigured() { return !!BASE_URL }

export default {
  apiLogin,
  apiMe,
  getDrugs,
  addDrug,
  updateDrug,
  deleteDrug,
  getWarehouses,
  addWarehouse,
  updateWarehouse,
  getInventory,
  createReceipt,
  completeReceipt,
  createTransfer,
  completeTransfer,
  uploadImageFile,
  getReceipts,
  getTransfers,
  clearSession,
  isApiConfigured
}
