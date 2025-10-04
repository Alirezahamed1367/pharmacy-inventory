import React, { useEffect, useState } from 'react'
import { Box, Typography, Card, CardContent, Grid, Button, Alert, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, IconButton } from '@mui/material'
import { Add as AddIcon, CompareArrows as TransferIcon, Check as CheckIcon, Error as ErrorIcon } from '@mui/icons-material'
import { getTransfers, createTransfer, completeTransfer, getTransferItems, getAllWarehouses, getAllLotInventory, deleteTransfer } from '../services/supabase'
import { formatDMY } from '../utils/dateUtils'

// Helper status chip
const StatusChip = ({ status }) => {
  const map = { in_transit: { label: 'در حال انتقال', color: 'info' }, completed: { label: 'تکمیل', color: 'success' }, discrepancy: { label: 'مغایرت', color: 'warning' } }
  const cfg = map[status] || { label: status, color: 'default' }
  return <Chip size='small' color={cfg.color} label={cfg.label} />
}

const Transfers = () => {
  const [transfers, setTransfers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  // موجودی lot-محور (هر رکورد inventory الان lot_id دارد یا بزودی خواهد داشت)
  const [lotInventory, setLotInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openNew, setOpenNew] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [currentTransfer, setCurrentTransfer] = useState(null)
  const [form, setForm] = useState({ source_warehouse_id: '', destination_warehouse_id: '', notes: '', document_date: new Date().toISOString().slice(0,10) })
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ inventory_id: '', quantity_sent: '' })
  const [creating, setCreating] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completeItems, setCompleteItems] = useState([])

  useEffect(()=>{ loadAll() },[])

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tRes, wRes, invRes] = await Promise.all([
        getTransfers(),
        getAllWarehouses(),
        getAllLotInventory()
      ])
      if (tRes.error) throw new Error(tRes.error.message)
      if (wRes.error) throw new Error(wRes.error.message)
      // inventory_view ممکن است حذف شده باشد، در صورت نبود، با داده پیش‌فرض ادامه می‌دهیم
      setTransfers(tRes.data)
      setWarehouses(wRes.data)
  setLotInventory(invRes.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ source_warehouse_id: '', destination_warehouse_id: '', notes: '', document_date: new Date().toISOString().slice(0,10) })
    setItems([])
  setNewItem({ inventory_id: '', lot_id: '', quantity_sent: '' })
  }

  const openNewDialog = () => { resetForm(); setOpenNew(true) }

  const addTempItem = () => {
    if (!newItem.inventory_id || !newItem.quantity_sent) return
    const inv = lotInventory.find(i=>i.id===newItem.inventory_id)
    if (inv && Number(newItem.quantity_sent) > inv.quantity) {
      setError('تعداد درخواستی بیشتر از موجودی است')
      return
    }
    setItems(prev=>[...prev, { ...newItem, lot_id: inv?.lot_id || null }])
    setNewItem({ inventory_id:'', lot_id:'', quantity_sent:'' })
  }

  const removeTempItem = (idx) => setItems(prev=>prev.filter((_,i)=>i!==idx))

  const createNewTransfer = async () => {
    if (!form.source_warehouse_id || !form.destination_warehouse_id || items.length===0) {
      setError('تمام فیلدهای ضروری را تکمیل کنید (انبار مبدا، مقصد، حداقل یک آیتم)')
      return
    }
    setCreating(true)
    try {
  const payload = { source_warehouse_id: form.source_warehouse_id, destination_warehouse_id: form.destination_warehouse_id, notes: form.notes || null, document_date: form.document_date, items: items.map(it=>({ inventory_id: it.inventory_id, lot_id: it.lot_id, quantity_sent: Number(it.quantity_sent) })) }
      const { error: cErr } = await createTransfer(payload)
      if (cErr) throw new Error(cErr.message)
      setOpenNew(false)
      resetForm()
      loadAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const openCompleteDialog = async (transfer) => {
    setCurrentTransfer(transfer)
    setOpenComplete(true)
    const { data, error: tiErr } = await getTransferItems(transfer.id)
    if (!tiErr) {
      setCompleteItems(data.map(d => ({ transfer_item_id: d.id, quantity_sent: d.quantity_sent, quantity_received: d.quantity_sent, discrepancy_notes: '' })))
    }
  }

  const updateCompleteItem = (idx, patch) => {
    setCompleteItems(prev => prev.map((it,i)=> i===idx ? { ...it, ...patch } : it ))
  }

  const submitComplete = async () => {
    setCompleting(true)
    try {
      const { error: compErr } = await completeTransfer(currentTransfer.id, completeItems)
      if (compErr) throw new Error(compErr.message)
      setOpenComplete(false)
      setCurrentTransfer(null)
      loadAll()
    } catch (e) { setError(e.message) } finally { setCompleting(false) }
  }

  return (
    <Box>
      <Box sx={{ mb:4, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Box>
          <Typography variant='h4' fontWeight='bold'>حواله‌ها</Typography>
          <Typography variant='subtitle1' color='text.secondary'>مدیریت انتقال بین انبارها و مغایرت‌ها</Typography>
        </Box>
        <Button variant='contained' startIcon={<AddIcon />} onClick={openNewDialog}>حواله جدید</Button>
      </Box>
      {loading && <Alert severity='info'>در حال بارگذاری...</Alert>}
      {error && <Alert severity='error' sx={{ mb:2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb:3 }}>
        <Grid item xs={12} md={4}>
          <Card><CardContent sx={{ textAlign:'center' }}><TransferIcon color='info' sx={{ fontSize:36 }}/><Typography variant='h5'>{transfers.filter(t=>t.status==='in_transit').length}</Typography><Typography variant='body2'>در حال انتقال</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent sx={{ textAlign:'center' }}><CheckIcon color='success' sx={{ fontSize:36 }}/><Typography variant='h5'>{transfers.filter(t=>t.status==='completed').length}</Typography><Typography variant='body2'>تکمیل شده</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent sx={{ textAlign:'center' }}><ErrorIcon color='warning' sx={{ fontSize:36 }}/><Typography variant='h5'>{transfers.filter(t=>t.status==='discrepancy').length}</Typography><Typography variant='body2'>مغایرت</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' fontWeight='bold'>لیست حواله‌ها ({transfers.length})</Typography>
          <TableContainer component={Paper} sx={{ mt:2 }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>کد</TableCell>
                  <TableCell>مبدا</TableCell>
                  <TableCell>مقصد</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell align='center'>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.map(tr => (
                  <TableRow key={tr.id} hover>
                    <TableCell sx={{ fontFamily:'monospace' }}>{tr.id.slice(0,8)}</TableCell>
                    <TableCell>{warehouses.find(w=>w.id===tr.source_warehouse_id)?.name || '---'}</TableCell>
                    <TableCell>{warehouses.find(w=>w.id===tr.destination_warehouse_id)?.name || '---'}</TableCell>
                    <TableCell><StatusChip status={tr.status} /></TableCell>
                    <TableCell>{formatDMY(tr.created_at)}</TableCell>
                    <TableCell align='center'>
                      {tr.status==='in_transit' && (
                        <>
                          <Button size='small' variant='outlined' onClick={()=>openCompleteDialog(tr)}>تکمیل</Button>
                          <Button size='small' sx={{ ml:1 }} variant='outlined' color='error' onClick={async ()=>{
                            if (!window.confirm('حذف این حواله؟')) return
                            const { error: delErr } = await deleteTransfer(tr.id)
                            if (delErr) { setError(delErr.message); return }
                            loadAll()
                          }}>حذف</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog: New Transfer */}
      <Dialog open={openNew} onClose={()=>setOpenNew(false)} maxWidth='md' fullWidth>
        <DialogTitle>حواله جدید</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField select SelectProps={{ native:true }} label='انبار مبدا' fullWidth value={form.source_warehouse_id} onChange={e=>{ setForm(f=>({...f,source_warehouse_id:e.target.value})); setItems([]); }}>
                <option value=''>انتخاب...</option>
                {warehouses.map(w=> <option key={w.id} value={w.id}>{w.name}</option> )}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select SelectProps={{ native:true }} label='انبار مقصد' fullWidth value={form.destination_warehouse_id} onChange={e=>setForm(f=>({...f,destination_warehouse_id:e.target.value}))}>
                <option value=''>انتخاب...</option>
                {warehouses.filter(w=> w.id!==form.source_warehouse_id).map(w=> <option key={w.id} value={w.id}>{w.name}</option> )}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label='یادداشت' fullWidth value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
            </Grid>
            <Grid item xs={12}>
              <TextField type='date' label='تاریخ سند' InputLabelProps={{ shrink:true }} fullWidth value={form.document_date} onChange={e=>setForm(f=>({...f,document_date:e.target.value}))} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' fontWeight='bold' sx={{ mt:1 }}>آیتم‌ها</Typography>
              <Grid container spacing={1} alignItems='center' sx={{ mt:1 }}>
                <Grid item xs={12} md={6}>
                  <TextField select SelectProps={{ native:true }} label='آیتم موجودی (دارو - انقضا - بچ - موجودی)' fullWidth value={newItem.inventory_id} onChange={e=>setNewItem(i=>({...i,inventory_id:e.target.value}))}>
                    <option value=''>انتخاب...</option>
                    {lotInventory
                      .filter(inv=> inv.warehouse_id===form.source_warehouse_id)
                      .sort((a,b)=> new Date(a.lot?.expire_date || a.expire_date || a.drug_expire_date || '2100-01-01') - new Date(b.lot?.expire_date || b.expire_date || b.drug_expire_date || '2100-01-01'))
                      .map(inv=> {
                        const drugName = inv.drugs?.name || inv.drug_name || inv.name
                        const exp = inv.lot?.expire_date || inv.expire_date || inv.drug_expire_date || '----'
                        const lotNumber = inv.lot?.lot_number || inv.lot_number || inv.batch_number || 'بدون بچ'
                        return <option key={inv.id} value={inv.id}>{drugName} - {exp} - {lotNumber} - موجودی:{inv.quantity}</option>
                      })}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label='تعداد ارسال' type='number' fullWidth value={newItem.quantity_sent} onChange={e=>setNewItem(i=>({...i,quantity_sent:e.target.value}))} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button onClick={addTempItem} disabled={!newItem.inventory_id || !newItem.quantity_sent}>افزودن</Button>
                </Grid>
              </Grid>
              <Table size='small' sx={{ mt:2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>دارو</TableCell>
                    <TableCell>انقضا</TableCell>
                    <TableCell>بچ</TableCell>
                    <TableCell>تعداد ارسال</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it,idx)=>{
                    const inv = lotInventory.find(iv=>iv.id===it.inventory_id)
                    return (
                      <TableRow key={idx}>
                        <TableCell>{inv?.drugs?.name || inv?.drug_name || inv?.name}</TableCell>
                        <TableCell>{formatDMY(inv?.lot?.expire_date || inv?.expire_date || inv?.drug_expire_date)}</TableCell>
                        <TableCell>{inv?.lot?.lot_number || inv?.lot_number || inv?.batch_number || '-'}</TableCell>
                        <TableCell>{it.quantity_sent}</TableCell>
                        <TableCell><IconButton color='error' size='small' onClick={()=>removeTempItem(idx)}>✕</IconButton></TableCell>
                      </TableRow>
                    )
                  })}
                  {items.length===0 && <TableRow><TableCell colSpan={5} align='center'>آیتمی اضافه نشده</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenNew(false)}>بستن</Button>
            <Button variant='contained' onClick={createNewTransfer} disabled={creating}>ایجاد حواله</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Complete Transfer */}
      <Dialog open={openComplete} onClose={()=>{ setOpenComplete(false); setCurrentTransfer(null); }} maxWidth='md' fullWidth>
        <DialogTitle>تکمیل حواله</DialogTitle>
        <DialogContent dividers>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>آیتم</TableCell>
                <TableCell>تعداد ارسال</TableCell>
                <TableCell>تعداد دریافت</TableCell>
                <TableCell>مغایرت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completeItems.map((ci,idx)=> {
                const diff = Number(ci.quantity_received) - Number(ci.quantity_sent)
                return (
                  <TableRow key={ci.transfer_item_id}>
                    <TableCell sx={{ fontFamily:'monospace' }}>{ci.transfer_item_id.slice(0,6)}</TableCell>
                    <TableCell>{ci.quantity_sent}</TableCell>
                    <TableCell>
                      <TextField type='number' size='small' value={ci.quantity_received} onChange={e=>updateCompleteItem(idx,{ quantity_received:e.target.value })} />
                    </TableCell>
                    <TableCell>
                      {diff === 0 ? '-' : diff > 0 ? `+${diff}` : diff}
                      <TextField placeholder='توضیح' size='small' value={ci.discrepancy_notes} onChange={e=>updateCompleteItem(idx,{ discrepancy_notes:e.target.value })} sx={{ mt:1 }} />
                    </TableCell>
                  </TableRow>
                )
              })}
              {completeItems.length===0 && <TableRow><TableCell colSpan={4} align='center'>آیتمی یافت نشد</TableCell></TableRow>}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{ setOpenComplete(false); setCurrentTransfer(null); }}>بستن</Button>
          <Button variant='contained' onClick={submitComplete} disabled={completing}>ثبت دریافت</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Transfers
