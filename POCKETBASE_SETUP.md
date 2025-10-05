# Collections Setup Guide for PocketBase
# نویسنده: علیرضا حامد - پاییز 1404

## 1. users (Auth Collection)
- Type: Auth
- Fields:
  - role: select (admin, user, warehouse_manager)
  - full_name: text
  - is_active: bool (default: true)

## 2. drugs (Base Collection)
- Type: Base
- Fields:
  - name: text (required)
  - brand: text
  - generic_name: text
  - package_type: select (bottle, box, blister, vial, tube, other)
  - strength: text
  - image: file (max 1 file, 5MB limit)
  - description: text
  - is_active: bool (default: true)

## 3. warehouses (Base Collection)
- Type: Base
- Fields:
  - name: text (required)
  - location: text
  - manager_name: text
  - is_active: bool (default: true)

## 4. drug_lots (Base Collection)
- Type: Base
- Fields:
  - drug: relation to drugs
  - lot_number: text (required)
  - expire_date: date (required)
  - supplier_name: text

## 5. inventory (Base Collection)
- Type: Base
- Fields:
  - warehouse: relation to warehouses
  - drug_lot: relation to drug_lots
  - quantity: number (required)

## 6. receipts (Base Collection)
- Type: Base
- Fields:
  - destination_warehouse: relation to warehouses
  - supplier_name: text
  - notes: text
  - document_date: date
  - status: select (pending, completed)
  - created_by: relation to users

## 7. transfers (Base Collection)
- Type: Base
- Fields:
  - source_warehouse: relation to warehouses
  - destination_warehouse: relation to warehouses
  - notes: text
  - document_date: date
  - status: select (pending, completed)
  - created_by: relation to users