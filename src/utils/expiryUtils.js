// FEFO & Expiry helper utilities

export const DAY_MS = 24 * 60 * 60 * 1000

export function diffDays(expireDate) {
  if (!expireDate) return Infinity
  const d = (expireDate instanceof Date) ? expireDate : new Date(expireDate)
  const today = new Date()
  const diff = Math.ceil((d.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / DAY_MS)
  return diff
}

export function classifyExpiry(expireDate) {
  const d = diffDays(expireDate)
  if (d < 0) return { band: 'expired', color: 'error', priority: 0, label: 'منقضی' }
  if (d <= 30) return { band: 'imminent', color: 'error', priority: 1, label: '≤30 روز' }
  if (d <= 90) return { band: 'soon', color: 'warning', priority: 2, label: '31-90' }
  return { band: 'safe', color: 'success', priority: 3, label: '>90' }
}

export function sortLotsByExpiry(lots) {
  return [...lots].sort((a,b)=> {
    const ca = classifyExpiry(a.expire_date)
    const cb = classifyExpiry(b.expire_date)
    if (ca.priority !== cb.priority) return ca.priority - cb.priority
    const da = new Date(a.expire_date).getTime()
    const db = new Date(b.expire_date).getTime()
    return da - db
  })
}

// FEFO allocation (simple, no partial lot splitting beyond quantity available)
export function fefoAllocate(lots, requiredQty) {
  const ordered = sortLotsByExpiry(lots)
  let remaining = requiredQty
  const allocations = []
  for (const lot of ordered) {
    if (remaining <= 0) break
    const take = Math.min(lot.quantity, remaining)
    if (take > 0) {
      allocations.push({ lot_id: lot.id, expire_date: lot.expire_date, take, available: lot.quantity })
      remaining -= take
    }
  }
  return { allocations, shortage: Math.max(0, remaining) }
}

export function lotDisplayLabel(lot) {
  const cls = classifyExpiry(lot.expire_date)
  const d = diffDays(lot.expire_date)
  return `${lot.drug_name || lot.name || ''}${lot.lot_number ? ' / '+lot.lot_number : ''} | ${new Date(lot.expire_date).toLocaleDateString('fa-IR')} (${d}روز)`
}
