import React, { useState } from 'react'
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
import { DRUGS_DATABASE, SUPPLIERS, WAREHOUSES, UNITS, getDrugsSortedByExpiry } from '../data/systemData'

// داده‌های نمونه رسیدها
const sampleReceipts = [
  {
    id: 1,
    receiptNumber: 'R-1404-001',
    supplier: SUPPLIERS[0], // شرکت داروسازی سینا
    date: '1404/07/01',
    warehouse: WAREHOUSES[0], // انبار مرکزی
    destinationWarehouse: WAREHOUSES[0],
    status: 'received', // received, pending, in_transit
    items: [
      { 
        id: 1,
        drug: DRUGS_DATABASE[0], // استامینوفن 500mg با تاریخ انقضا
        quantity: 100, 
        unit: UNITS[0], // جعبه
        price: 15000 
      },
      { 
        id: 2,
        drug: DRUGS_DATABASE[3], // ایبوپروفن 400mg
        quantity: 50, 
        unit: UNITS[0], 
        price: 25000 
      },
    ],
    totalValue: 2750000,
  },
  {
    id: 2,
    receiptNumber: 'R-1404-002',
    supplier: SUPPLIERS[1], // شرکت طب داری
    date: '1404/07/02',
    warehouse: WAREHOUSES[5], // انبار کالا در راه
    destinationWarehouse: WAREHOUSES[1], // انبار شعبه شرق
    status: 'in_transit',
    items: [
      { 
        id: 3,
        drug: DRUGS_DATABASE[5], // پنی‌سیلین 250mg
        quantity: 75, 
        unit: UNITS[1], // عدد
        price: 12000 
      },
    ],
    totalValue: 900000,
  },
]

export default function ReceiptManagement() {
  const [receipts, setReceipts] = useState(sampleReceipts)
  const [openTransferDialog, setOpenTransferDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [editingReceipt, setEditingReceipt] = useState(null)

  const handleOpenDialog = (receipt = null) => {
    setEditingReceipt(receipt)
    setOpenTransferDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenTransferDialog(false)
    setEditingReceipt(null)
  }

  const handleSaveReceipt = (receiptData) => {
    if (editingReceipt) {
      // ویرایش رسید موجود
      setReceipts(receipts.map(receipt =>
        receipt.id === editingReceipt.id
          ? { ...receipt, ...receiptData, id: editingReceipt.id }
          : receipt
      ))
    } else {
      // افزودن رسید جدید
      const newReceipt = {
        id: Math.max(...receipts.map(r => r.id), 0) + 1,
        ...receiptData,
        date: new Date().toLocaleDateString('fa-IR'),
        status: 'pending'
      }
      setReceipts([...receipts, newReceipt])
    }
  }

  const handleConfirmReceipt = (receiptId) => {
    const receipt = receipts.find(r => r.id === receiptId);
    if (receipt) {
      setSelectedReceipt({
        ...receipt,
        items: receipt.items.map(item => ({
          ...item,
          id: item.id || Math.random(),
          drugName: item.drug?.name || item.drug,
          sentQuantity: item.quantity,
          unitPrice: item.price,
          expiryDate: item.drug?.expiryDate
        }))
      });
      setOpenConfirmDialog(true);
    }
  }

  const handleConfirmReceiptSubmit = (confirmationData) => {
    setReceipts(receipts.map(receipt =>
      receipt.id === confirmationData.receiptId
        ? {
          ...receipt,
          status: confirmationData.status === 'complete' ? 'received' : 'partial_received',
          warehouse: receipt.destinationWarehouse || receipt.warehouse,
          confirmationData: confirmationData,
          receivedDate: new Date().toLocaleDateString('fa-IR')
        }
        : receipt
    ));

    // Handle transit items (items with shortage)
    if (confirmationData.transitItems.length > 0) {
      console.log('Items remaining in transit:', confirmationData.transitItems);
      // Here you would typically update a separate transit inventory
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
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>شماره رسید</TableCell>
                  <TableCell>تامین‌کننده</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>انبار</TableCell>
                  <TableCell>ارزش کل</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {receipt.receiptNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{receipt.supplier?.name || 'نامشخص'}</TableCell>
                    <TableCell>{receipt.date}</TableCell>
                    <TableCell>
                      {receipt.status === 'in_transit' ? (
                        <Box>
                          <Typography variant="caption" display="block">
                            {receipt.warehouse?.name || 'نامشخص'}
                          </Typography>
                          <Typography variant="caption" color="primary.main">
                            → {receipt.destinationWarehouse?.name || 'نامشخص'}
                          </Typography>
                        </Box>
                      ) : (
                        receipt.warehouse?.name || 'نامشخص'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" color="success.main">
                        {receipt.totalValue?.toLocaleString('fa-IR')} ریال
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(receipt.status)}
                        color={getStatusColor(receipt.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(receipt)}
                      >
                        <EditIcon />
                      </IconButton>
                      {receipt.status === 'in_transit' && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => handleConfirmReceipt(receipt.id)}
                          sx={{ ml: 1 }}
                        >
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
        initialData={editingReceipt ? {
          receiptNumber: editingReceipt.receiptNumber,
          supplier: editingReceipt.supplier,
          date: editingReceipt.date,
          warehouse: editingReceipt.warehouse,
          items: editingReceipt.items || [],
          notes: editingReceipt.notes || '',
          status: editingReceipt.status
        } : null}
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
