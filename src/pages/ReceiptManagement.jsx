import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
} from '@mui/icons-material'
import ReceiptConfirmationDialog from '../components/ReceiptConfirmationDialog'
import TransferDialog from '../components/TransferDialog'
import { supabase } from '../services/supabase'
import { DrugSelect, SupplierSelect, WarehouseSelect, UnitSelect } from '../components/DropdownSelects'

const ReceiptManagement = () => {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openTransferDialog, setOpenTransferDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [editingReceipt, setEditingReceipt] = useState(null)
  const [drugs, setDrugs] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  // دریافت داده‌های اولیه
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      // دریافت رسیدها
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('movements_view')
        .select('*')
        .eq('movement_type', 'entry')
        .order('movement_date', { ascending: false })
      if (receiptsError) throw receiptsError
      setReceipts(receiptsData || [])

      // دریافت داروها
      const { data: drugsData, error: drugsError } = await supabase
        .from('drugs')
        .select('*')
        .eq('active', true)
        .order('name')
      if (drugsError) throw drugsError
      setDrugs(drugsData || [])

      // دریافت انبارها
      const { data: warehousesData, error: warehousesError } = await supabase
        .from('warehouses')
        .select('*')
        .eq('active', true)
        .order('name')
      if (warehousesError) throw warehousesError
      setWarehouses(warehousesData || [])

      // دریافت تامین‌کنندگان (از جدول system_settings یا یک جدول suppliers)
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'suppliers')
      if (suppliersError) throw suppliersError
      let suppliersList = []
      if (suppliersData && suppliersData.length > 0) {
        try {
          suppliersList = JSON.parse(suppliersData[0].setting_value)
        } catch {}
      }
      setSuppliers(suppliersList)
    } catch (err) {
      setError(err.message || 'خطا در دریافت داده‌ها')
    } finally {
      setLoading(false)
    }
  }

  // باز کردن دیالوگ افزودن/ویرایش
  const handleOpenDialog = (receipt = null) => {
    setEditingReceipt(receipt)
    setOpenTransferDialog(true)
  }

  // بستن دیالوگ
  const handleCloseDialog = () => {
    setOpenTransferDialog(false)
    setEditingReceipt(null)
    setFormError(null)
  }

  // تأیید رسید
  const handleConfirmReceiptSubmit = () => {
    setOpenConfirmDialog(false)
    fetchAll() // بروزرسانی لیست
  }

  // افزودن یا ویرایش رسید
  const handleSaveReceipt = async (receiptData) => {
    setFormLoading(true)
    setFormError(null)
    try {
      let result
      if (editingReceipt) {
        // ویرایش
        result = await supabase
          .from('drug_movements')
          .update({
            ...receiptData,
            movement_type: 'entry',
          })
          .eq('id', editingReceipt.id)
        if (result.error) throw result.error
      } else {
        // افزودن
        result = await supabase
          .from('drug_movements')
          .insert([{ ...receiptData, movement_type: 'entry' }])
        if (result.error) throw result.error
      }
      handleCloseDialog()
      fetchAll()
    } catch (err) {
      setFormError(err.message || 'خطا در ذخیره رسید')
    } finally {
      setFormLoading(false)
    }
  }

  // حذف یا لغو رسید
  const handleDeleteReceipt = async (receiptId) => {
    if (!window.confirm('آیا از حذف این رسید مطمئن هستید؟')) return
    setFormLoading(true)
    setFormError(null)
    try {
      const { error } = await supabase
        .from('drug_movements')
        .delete()
        .eq('id', receiptId)
      if (error) throw error
      fetchAll()
    } catch (err) {
      setFormError(err.message || 'خطا در حذف رسید')
    } finally {
      setFormLoading(false)
    }
  }

  // تایید رسید (مثلاً تغییر وضعیت)
  const handleConfirmReceipt = async (receiptId) => {
    setFormLoading(true)
    setFormError(null)
    try {
      const { error } = await supabase
        .from('drug_movements')
        .update({ status: 'received' })
        .eq('id', receiptId)
      if (error) throw error
      fetchAll()
    } catch (err) {
      setFormError(err.message || 'خطا در تایید رسید')
    } finally {
      setFormLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'success'
      case 'partial_received': return 'warning'
      case 'in_transit': return 'info'
      case 'pending': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'received': return 'دریافت شده'
      case 'partial_received': return 'دریافت ناقص'
      case 'in_transit': return 'در راه'
      case 'pending': return 'در انتظار'
      default: return 'نامشخص'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            مدیریت رسید کالا
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            ثبت و مدیریت رسیدهای دریافت کالا از تامین‌کنندگان
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          رسید جدید
        </Button>
      </Box>

  {/* وضعیت بارگذاری و خطا */}
  {loading && <Alert severity="info">در حال بارگذاری رسیدها...</Alert>}
  {error && <Alert severity="error">{error}</Alert>}

  {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {receipts.filter(r => r.status === 'received').length}
              </Typography>
              <Typography variant="subtitle1">دریافت شده</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShippingIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {receipts.filter(r => r.status === 'in_transit').length}
              </Typography>
              <Typography variant="subtitle1">در راه</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PendingIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {receipts.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="subtitle1">در انتظار</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <InventoryIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {receipts.length}
              </Typography>
              <Typography variant="subtitle1">کل رسیدها</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Receipts Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
            لیست رسیدها ({receipts.length})
          </Typography>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>شماره رسید</TableCell>
                  <TableCell>تامین‌کننده</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>انبار</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {receipt.reference_number || receipt.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{receipt.supplier_name || receipt.supplier || 'نامشخص'}</TableCell>
                    <TableCell>{receipt.movement_date ? new Date(receipt.movement_date).toLocaleDateString('fa-IR') : ''}</TableCell>
                    <TableCell>{receipt.to_warehouse || receipt.warehouse || 'نامشخص'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(receipt.status)}
                        color={getStatusColor(receipt.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(receipt)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteReceipt(receipt.id)}>
                        <DeleteIcon />
                      </IconButton>
                      {receipt.status !== 'received' && (
                        <Button size="small" color="success" variant="outlined" onClick={() => handleConfirmReceipt(receipt.id)} sx={{ ml: 1 }}>
                          تایید رسید
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Transfer Dialog for Receipt Management */}
      <TransferDialog
        open={openTransferDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveReceipt}
        title={editingReceipt ? "ویرایش رسید کالا" : "رسید کالای جدید"}
        type="receipt"
        mode={editingReceipt ? "edit" : "add"}
        initialData={editingReceipt}
        drugs={drugs}
        warehouses={warehouses}
        suppliers={suppliers}
        loading={formLoading}
        error={formError}
      />



      {/* Receipt Confirmation Dialog */}
      <ReceiptConfirmationDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        receipt={selectedReceipt}
        onConfirm={handleConfirmReceiptSubmit}
        userRole="warehouse_manager"
      />
    </Box>
  )
}

export default ReceiptManagement
