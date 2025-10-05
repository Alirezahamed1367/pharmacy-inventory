// PocketBase client adapter
// Maps existing apiClient surface to PocketBase SDK operations
// فارسی: آداپتر PocketBase برای یکپارچه سازی با UI فعلی

import PocketBase from 'pocketbase'

const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'
const pb = new PocketBase(PB_URL)

function setAuth(model){
  if(model){
    localStorage.setItem('currentUser', JSON.stringify(model))
    localStorage.setItem('userRole', model.role || 'user')
  }
}

export function clearSession(){
  pb.authStore.clear()
  localStorage.removeItem('authToken')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('userRole')
}

export async function apiLogin(username, password){
  try {
    const authData = await pb.collection('users').authWithPassword(username, password)
    setAuth(authData.record)
    localStorage.setItem('authToken', pb.authStore.token)
    return { data: { token: pb.authStore.token, user: authData.record }, error: null }
  } catch (e) {
    return { data: null, error: { message: e.message } }
  }
}

export async function apiMe(){
  if(!pb.authStore.isValid) return { data:null, error:{ message:'Not authenticated'} }
  return { data: pb.authStore.model, error: null }
}

// Helper wrappers
async function safeList(collection, query={}){
  try {
    const { filter, expand, sort, perPage=200 } = query
    const res = await pb.collection(collection).getList(1, perPage, { filter, expand, sort })
    return { data: res.items, error: null }
  } catch(e){ return { data:null, error:{ message:e.message } } }
}
async function safeCreate(collection, data){
  try { const rec = await pb.collection(collection).create(data); return { data: rec, error:null } } catch(e){ return { data:null, error:{ message:e.message } } }
}
async function safeUpdate(collection, id, data){
  try { const rec = await pb.collection(collection).update(id, data); return { data: rec, error:null } } catch(e){ return { data:null, error:{ message:e.message } } }
}
async function safeDelete(collection, id){
  try { await pb.collection(collection).delete(id); return { data:true, error:null } } catch(e){ return { data:null, error:{ message:e.message } } }
}

// Drugs
export const getDrugs = () => safeList('drugs')
export const addDrug = (payload) => safeCreate('drugs', payload)
export const updateDrug = (id, payload) => safeUpdate('drugs', id, payload)
export const deleteDrug = (id) => safeDelete('drugs', id)

// Warehouses
export const getWarehouses = () => safeList('warehouses')
export const addWarehouse = (payload) => safeCreate('warehouses', payload)
export const updateWarehouse = (id, payload) => safeUpdate('warehouses', id, payload)

// Inventory (compose from inventory + expansions)
export async function getInventory(params={}){
  let filter = ''
  if(params.warehouse_id) filter = `warehouse='${params.warehouse_id}'`
  return safeList('inventory', { filter, expand: 'drug_lot,drug_lot.drug,warehouse' })
}

// Receipts
export const getReceipts = () => safeList('receipts')
export const createReceipt = (payload) => safeCreate('receipts', payload)
export async function completeReceipt(id){
  // Mark status completed (business logic for inventory adjustments must be handled via Fastify or a future PocketBase action)
  return safeUpdate('receipts', id, { status:'completed' })
}

// Transfers
export const getTransfers = () => safeList('transfers')
export const createTransfer = (payload) => safeCreate('transfers', payload)
export async function completeTransfer(id){
  return safeUpdate('transfers', id, { status:'completed' })
}

// Upload image (store in drugs.image field). Accepts File object.
export async function uploadImageFile(file){
  try {
    const formData = new FormData()
    formData.append('image', file)
    // Need a drug id context; UI will call updateDrug after create with image
    return { data:{ deferred:true, message:'Attach image via updateDrug with FormData' }, error:null }
  } catch(e){
    return { data:null, error:{ message:e.message } }
  }
}

export function isApiConfigured(){ return !!PB_URL }

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
  getReceipts,
  createTransfer,
  completeTransfer,
  getTransfers,
  uploadImageFile,
  clearSession,
  isApiConfigured
}
