import React, { useEffect, useState } from 'react'
import { Box, Typography, Card, CardContent, Button, Grid, Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { Add as AddIcon, Check as CheckIcon, Delete as DeleteIcon, Inventory as InventoryIcon, HourglassEmpty as PendingIcon } from '@mui/icons-material'
import { getReceipts, createReceipt, completeReceipt, getReceiptItems, getDrugs, getAllWarehouses, deleteReceipt } from '../services/supabase'
import { supabase } from '../services/supabase'
import { formatDMY } from '../utils/dateUtils'

const ReceiptManagement = () => {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openNew, setOpenNew] = useState(false)
  const [openItems, setOpenItems] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState(null)
  const [drugs, setDrugs] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [form, setForm] = useState({ destination_warehouse_id: '', supplier_id: '', notes: '', document_date: new Date().toISOString().slice(0,10) })
  const [suppliers, setSuppliers] = useState([])
  const [items, setItems] = useState([]) // temp items before create
  const [newItem, setNewItem] = useState({ drug_id: '', quantity: '', supplier_id: '' })
  const [creating, setCreating] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rRes, dRes, wRes, sRes] = await Promise.all([
        getReceipts(),
        getDrugs(),
        getAllWarehouses(),
        supabase ? supabase.from('suppliers').select('id,name') : Promise.resolve({ data: [], error: null })
      ])
      if (rRes.error) throw new Error(rRes.error.message)
      if (dRes.error) throw new Error(dRes.error.message)
      if (wRes.error) throw new Error(wRes.error.message)
      if (sRes.error) throw new Error(sRes.error.message)
      setReceipts(rRes.data)
      setDrugs(dRes.data)
      setWarehouses(wRes.data)
      setSuppliers(sRes.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ destination_warehouse_id: '', supplier_id: '', notes: '', document_date: new Date().toISOString().slice(0,10) })
    setItems([])
  setNewItem({ drug_id: '', quantity: '', supplier_id: '' })
  }

  const handleCreateReceipt = async () => {
    if (!form.destination_warehouse_id || items.length === 0) {
      setError('انبار مقصد و حداقل یک آیتم الزامی است')
      return
    }
    setCreating(true)
    try {
      const payload = {
        destination_warehouse_id: form.destination_warehouse_id,
        supplier_id: form.supplier_id || null,
        notes: form.notes || null,
        document_date: form.document_date,
  items: items.map(i => ({ drug_id: i.drug_id, quantity: Number(i.quantity), supplier_id: i.supplier_id || null }))
      }
      const { error: cErr } = await createReceipt(payload)
      if (cErr) throw new Error(cErr.message)
      setOpenNew(false)
      resetForm()
      loadData()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const handleComplete = async (receipt) => {
    if (!window.confirm('آیا از تکمیل این رسید مطمئن هستید؟')) return
    setCompleting(true)
    try {
      const { error: compErr } = await completeReceipt(receipt.id)
      if (compErr) throw new Error(compErr.message)
      loadData()
    } catch (e) {
      setError(e.message)
    } finally {
      setCompleting(false)
    }
  }

  const openItemsDialog = async (receipt) => {
    setCurrentReceipt(receipt)
    setOpenItems(true)
    const { data, error: itErr } = await getReceiptItems(receipt.id)
    if (!itErr) setItems(data)
  }

  const addTempItem = () => {
    if (!newItem.drug_id || !newItem.quantity) return
    setItems(prev => [...prev, newItem])
  setNewItem({ drug_id: '', quantity: '', supplier_id: '' })
  }

  const removeTempItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const statusChip = (status) => {
    const map = { pending: { label: 'در انتظار', color: 'warning' }, completed: { label: 'تکمیل', color: 'success' } }
    const cfg = map[status] || { label: status, color: 'default' }
    return <Chip size='small' color={cfg.color} label={cfg.label} />
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h4' fontWeight='bold'>رسیدها</Typography>
          <Typography variant='subtitle1' color='text.secondary'>مدیریت و ثبت رسیدهای ورود کالا</Typography>
        </Box>
        <Button variant='contained' startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenNew(true) }}>رسید جدید</Button>
      </Box>

      {loading && <Alert severity='info'>در حال بارگذاری...</Alert>}
      {error && <Alert severity='error' sx={{ mb:2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card><CardContent sx={{ textAlign:'center' }}><CheckIcon color='success' sx={{ fontSize:36 }}/><Typography variant='h5'>{receipts.filter(r=>r.status==='completed').length}</Typography><Typography variant='body2'>تکمیل شده</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent sx={{ textAlign:'center' }}><PendingIcon color='warning' sx={{ fontSize:36 }}/><Typography variant='h5'>{receipts.filter(r=>r.status==='pending').length}</Typography><Typography variant='body2'>در انتظار</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent sx={{ textAlign:'center' }}><InventoryIcon color='primary' sx={{ fontSize:36 }}/><Typography variant='h5'>{receipts.length}</Typography><Typography variant='body2'>کل</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' fontWeight='bold'>لیست رسیدها ({receipts.length})</Typography>
          <TableContainer component={Paper} sx={{ mt:2 }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>کد</TableCell>
                  <TableCell>انبار مقصد</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>تاریخ ایجاد</TableCell>
                  <TableCell align='center'>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontFamily:'monospace' }}>{r.id.slice(0,8)}</TableCell>
                    <TableCell>{warehouses.find(w=>w.id===r.destination_warehouse_id)?.name || '---'}</TableCell>
                    <TableCell>{statusChip(r.status)}</TableCell>
                    <TableCell>{formatDMY(r.created_at)}</TableCell>
                    <TableCell align='center'>
                      <Button size='small' variant='outlined' onClick={()=>openItemsDialog(r)}>آیتم‌ها</Button>
                      {r.status==='pending' && (
                        <>
                          <Button size='small' sx={{ ml:1 }} variant='contained' color='success' disabled={completing} onClick={()=>handleComplete(r)}>تکمیل</Button>
                          <Button size='small' sx={{ ml:1 }} variant='outlined' color='error' onClick={async ()=>{
                            if (!window.confirm('حذف این رسید؟')) return
                            const { error: delErr } = await deleteReceipt(r.id)
                            if (delErr) { setError(delErr.message); return }
                            loadData()
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

      {/* Dialog: New Receipt */}
      <Dialog open={openNew} onClose={()=>setOpenNew(false)} maxWidth='md' fullWidth>
        <DialogTitle>رسید جدید</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select SelectProps={{ native:true }} label='انبار مقصد' fullWidth value={form.destination_warehouse_id} onChange={e=>setForm(f=>({...f,destination_warehouse_id:e.target.value}))}>
                <option value=''>انتخاب...</option>
                {warehouses.map(w=> <option key={w.id} value={w.id}>{w.name}</option> )}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select SelectProps={{ native:true }} label='تامین‌کننده اصلی (اختیاری)' fullWidth value={form.supplier_id} onChange={e=>setForm(f=>({...f,supplier_id:e.target.value}))}>
                <option value=''>انتخاب...</option>
                {suppliers.map(s=> <option key={s.id} value={s.id}>{s.name}</option> )}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type='date' label='تاریخ سند' InputLabelProps={{ shrink:true }} fullWidth value={form.document_date} onChange={e=>setForm(f=>({...f,document_date:e.target.value}))} />
            </Grid>
            <Grid item xs={12}>
              <TextField label='یادداشت' fullWidth value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' fontWeight='bold' sx={{ mt:1 }}>آیتم‌ها</Typography>
              <Grid container spacing={1} alignItems='center' sx={{ mt:1 }}>
                <Grid item xs={12} md={4}>
                  <TextField select SelectProps={{ native:true }} label='دارو (نام - انقضا)' fullWidth value={newItem.drug_id} onChange={e=>setNewItem(i=>({...i,drug_id:e.target.value}))}>
                    <option value=''>انتخاب...</option>
                    {drugs.map(d=> <option key={d.id} value={d.id}>{d.name} - {d.expire_date}</option> )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField label='تعداد' type='number' fullWidth value={newItem.quantity} onChange={e=>setNewItem(i=>({...i,quantity:e.target.value}))} />
                </Grid>
                {/* حذف فیلد بچ */}
                <Grid item xs={12} md={2}>
                  <TextField select SelectProps={{ native:true }} label='تامین‌کننده (اختیاری)' fullWidth value={newItem.supplier_id} onChange={e=>setNewItem(i=>({...i,supplier_id:e.target.value}))}>
                    <option value=''>انتخاب...</option>
                    {suppliers.map(s=> <option key={s.id} value={s.id}>{s.name}</option> )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button onClick={addTempItem} disabled={!newItem.drug_id || !newItem.quantity}>افزودن</Button>
                </Grid>
              </Grid>
              <Table size='small' sx={{ mt:2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>دارو</TableCell>
                    <TableCell>انقضا</TableCell>
                    <TableCell>تعداد</TableCell>
                    {/* حذف ستون بچ */}
                    {/* حذف ستون انقضا آیتم */}
                    <TableCell>تامین‌کننده</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it,idx)=>{
                    const drug = drugs.find(d=>d.id===it.drug_id)
                    return (
                      <TableRow key={idx}>
                        <TableCell>{drug?.name}</TableCell>
                        <TableCell>{formatDMY(drug?.expire_date)}</TableCell>
                        <TableCell>{it.quantity}</TableCell>
                        {/* حذف مقدار بچ */}
                        {/* ستون حذف شده */}
                        <TableCell>{suppliers.find(s=>s.id===it.supplier_id)?.name || suppliers.find(s=>s.id===form.supplier_id)?.name || '-'}</TableCell>
                        <TableCell><IconButton color='error' size='small' onClick={()=>removeTempItem(idx)}><DeleteIcon fontSize='small' /></IconButton></TableCell>
                      </TableRow>
                    )
                  })}
                  {items.length===0 && <TableRow><TableCell colSpan={6} align='center'>آیتمی اضافه نشده است</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenNew(false)}>بستن</Button>
          <Button variant='contained' onClick={handleCreateReceipt} disabled={creating}>ایجاد رسید</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Receipt Items (view existing) */}
      <Dialog open={openItems} onClose={()=>{setOpenItems(false); setCurrentReceipt(null);}} maxWidth='md' fullWidth>
        <DialogTitle>آیتم‌های رسید</DialogTitle>
        <DialogContent dividers>
          {currentReceipt && (
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>دارو</TableCell>
                  <TableCell>انقضا</TableCell>
                  <TableCell>تعداد</TableCell>
                  {/* حذف ستون بچ */}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(it => (
                  <TableRow key={it.id}>
                    <TableCell>{it.drugs?.name}</TableCell>
                    <TableCell>{formatDMY(it.drugs?.expire_date)}</TableCell>
                    <TableCell>{it.quantity}</TableCell>
                    {/* حذف مقدار بچ */}
                  </TableRow>
                ))}
                {items.length===0 && <TableRow><TableCell colSpan={4} align='center'>آیتمی ثبت نشده</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{setOpenItems(false); setCurrentReceipt(null);}}>بستن</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ReceiptManagement
