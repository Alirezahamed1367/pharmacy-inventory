// PocketBase Collections Auto-Setup Script
// نویسنده: علیرضا حامد - پاییز 1404

const PB_URL = 'https://pharmacy-inventory-lz6l.onrender.com'

async function setupPocketBase() {
  console.log('🚀 Setting up PocketBase Collections...')
  
  // Create Admin User
  console.log('📋 Creating collections...')
  
  const collections = [
    {
      name: 'users',
      type: 'auth',
      schema: [
        { name: 'role', type: 'select', options: { values: ['admin', 'user', 'warehouse_manager'] } },
        { name: 'full_name', type: 'text' },
        { name: 'is_active', type: 'bool', options: { default: true } }
      ]
    },
    {
      name: 'drugs',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'brand', type: 'text' },
        { name: 'generic_name', type: 'text' },
        { name: 'package_type', type: 'select', options: { values: ['bottle', 'box', 'blister', 'vial', 'tube', 'other'] } },
        { name: 'strength', type: 'text' },
        { name: 'image', type: 'file', options: { maxSelect: 1, maxSize: 5242880 } },
        { name: 'description', type: 'text' },
        { name: 'is_active', type: 'bool', options: { default: true } }
      ]
    },
    {
      name: 'warehouses',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'location', type: 'text' },
        { name: 'manager_name', type: 'text' },
        { name: 'is_active', type: 'bool', options: { default: true } }
      ]
    },
    {
      name: 'drug_lots',
      type: 'base',
      schema: [
        { name: 'drug', type: 'relation', options: { collectionId: 'drugs', cascadeDelete: true } },
        { name: 'lot_number', type: 'text', required: true },
        { name: 'expire_date', type: 'date', required: true },
        { name: 'supplier_name', type: 'text' }
      ]
    },
    {
      name: 'inventory',
      type: 'base',
      schema: [
        { name: 'warehouse', type: 'relation', options: { collectionId: 'warehouses' } },
        { name: 'drug_lot', type: 'relation', options: { collectionId: 'drug_lots' } },
        { name: 'quantity', type: 'number', required: true }
      ]
    },
    {
      name: 'receipts',
      type: 'base',
      schema: [
        { name: 'destination_warehouse', type: 'relation', options: { collectionId: 'warehouses' } },
        { name: 'supplier_name', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'document_date', type: 'date' },
        { name: 'status', type: 'select', options: { values: ['pending', 'completed'] } },
        { name: 'created_by', type: 'relation', options: { collectionId: 'users' } }
      ]
    },
    {
      name: 'transfers',
      type: 'base',
      schema: [
        { name: 'source_warehouse', type: 'relation', options: { collectionId: 'warehouses' } },
        { name: 'destination_warehouse', type: 'relation', options: { collectionId: 'warehouses' } },
        { name: 'notes', type: 'text' },
        { name: 'document_date', type: 'date' },
        { name: 'status', type: 'select', options: { values: ['pending', 'completed'] } },
        { name: 'created_by', type: 'relation', options: { collectionId: 'users' } }
      ]
    }
  ]
  
  console.log('Collections to create:', collections.map(c => c.name))
  console.log('Visit PocketBase admin to create these manually:')
  console.log(`${PB_URL}/_/`)
  
  return collections
}

if (typeof module !== 'undefined') {
  module.exports = { setupPocketBase }
} else {
  setupPocketBase()
}