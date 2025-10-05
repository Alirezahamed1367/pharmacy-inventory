// Backend provider switch
// Chooses between Fastify REST apiClient and PocketBase adapter
// فارسی: سوییچ بین بک‌اند فعلی و PocketBase بر اساس متغیر محیطی

import apiClient from './apiClient'
import pocketbaseClient from './pocketbaseClient'

const MODE = import.meta.env.VITE_BACKEND_MODE || 'fastify'

let provider = apiClient
if (MODE === 'pocketbase') provider = pocketbaseClient

export function currentMode(){ return MODE }

// Re-export all functions from the active provider
export const {
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
} = provider

export default provider
