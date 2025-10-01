import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warehouse as WarehouseIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  SwapHoriz as TransferIcon,
} from '@mui/icons-material'
import TransferDialog from '../components/TransferDialog'
import { ManagerSelect } from '../components/DropdownSelects'

// داده‌های نمونه
const sampleSuppliers = [
  { id: 1, name: 'شرکت داروسازی سینا', phone: '021-12345678', contact: 'احمد رضایی' },
  { id: 2, name: 'شرکت طب داری', phone: '021-87654321', contact: 'فاطمه کریمی' },
  { id: 3, name: 'داروخانه مرکزی ایران', phone: '021-11223344', contact: 'محمد حسینی' },
]

// لیست مسئولان انبار
const sampleManagers = [
  { id: 1, name: 'علی احمدی', position: 'مدیر انبار ارشد', phone: '09121234567' },
  { id: 2, name: 'فاطمه محمدی', position: 'مدیر انبار', phone: '09129876543' },
  { id: 3, name: 'محمد حسینی', position: 'مسئول انبار', phone: '09123456789' },
  { id: 4, name: 'سارا رضایی', position: 'مدیر انبار', phone: '09187654321' },
  { id: 5, name: 'احمد کریمی', position: 'مسئول انبار', phone: '09111223344' },
  { id: 6, name: 'زهرا مرادی', position: 'مدیر انبار', phone: '09198765432' }
]

const sampleWarehouses = [
  {
    id: 1,
    name: 'انبار مرکزی',
    description: 'انبار اصلی شرکت',
    location: 'تهران، میدان ولیعصر',
    manager: 'علی احمدی',
    capacity: 1000,
    currentStock: 750,
    supplier: 'شرکت داروسازی سینا',
    drugs: [
      { name: 'آسپرین', quantity: 100, expireDate: '1404/08/15', batch: 'A001' },
      { name: 'ایبوپروفن', quantity: 50, expireDate: '1404/09/20', batch: 'B002' },
      { name: 'پنی‌سیلین', quantity: 75 },
    ]
  },
  {
    id: 2,
    name: 'انبار شعبه شرق',
    description: 'انبار منطقه شرقی',
    location: 'تهران، نارمک',
    manager: 'فاطمه محمدی',
    capacity: 500,
    currentStock: 320,
    drugs: [
      { name: 'آسپرین', quantity: 80, expireDate: '1404/07/10', batch: 'A003' },
      { name: 'سیپروفلوکساسین', quantity: 40, expireDate: '1404/11/05', batch: 'C004' },
    ]
  },
  {
    id: 3,
    name: 'انبار شعبه غرب',
    description: 'انبار منطقه غربی',
    location: 'تهران، اکباتان',
    manager: 'محمد رضایی',
    capacity: 300,
    currentStock: 180,
    drugs: [
      { name: 'پنی‌سیلین', quantity: 30, expireDate: '1404/06/25', batch: 'P005' },
      { name: 'آموکسی‌سیلین', quantity: 45, expireDate: '1404/10/12', batch: 'A006' },
    ]
  },
]

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState(sampleWarehouses)
  const [openDialog, setOpenDialog] = useState(false)
  const [openTransferDialog, setOpenTransferDialog] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    manager: '',
    capacity: '',
  })



  const handleOpenDialog = (warehouse = null) => {
    if (warehouse) {
      setSelectedWarehouse(warehouse)
      setFormData({
        name: warehouse.name || '',
        description: warehouse.description || '',
        location: warehouse.location || '',
        manager: warehouse.manager || '',
        capacity: warehouse.capacity || '',
      })
    } else {
      setSelectedWarehouse(null)
      setFormData({
        name: '',
        description: '',
        location: '',
        manager: '',
        capacity: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedWarehouse(null)
  }

  const handleSave = () => {
    if (selectedWarehouse) {
      // ویرایش انبار
      setWarehouses(warehouses.map(warehouse => 
        warehouse.id === selectedWarehouse.id 
          ? { ...warehouse, ...formData }
          : warehouse
      ))
    } else {
      // افزودن انبار جدید
      const newWarehouse = {
        id: Math.max(...warehouses.map(w => w.id)) + 1,
        ...formData,
        currentStock: 0,
        drugs: []
      }
      setWarehouses([...warehouses, newWarehouse])
    }
    handleCloseDialog()
  }

  const handleDelete = (warehouseId) => {
    if (confirm('آیا از حذف این انبار مطمئن هستید؟')) {
      setWarehouses(warehouses.filter(warehouse => warehouse.id !== warehouseId))
    }
  }



  const getCapacityPercentage = (current, total) => {
    return Math.round((current / total) * 100)
  }

  const getCapacityColor = (percentage) => {
    if (percentage > 80) return 'error'
    if (percentage > 60) return 'warning'
    return 'success'
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            مدیریت انبارها
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            مدیریت انبارها و حواله انتقالی بین انبارها
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TransferIcon />}
            onClick={() => setOpenTransferDialog(true)}
            size="large"
          >
            حواله انتقالی
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            افزودن انبار جدید
          </Button>
        </Box>
      </Box>

      {/* Warehouses Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {warehouses.map((warehouse) => {
          const capacityPercentage = getCapacityPercentage(warehouse.currentStock, warehouse.capacity)
          return (
            <Grid item xs={12} md={6} lg={4} key={warehouse.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <WarehouseIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {warehouse.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          مسئول: {warehouse.manager}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(warehouse)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(warehouse.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {warehouse.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {warehouse.location}
                    </Typography>
                  </Box>


                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption">ظرفیت انبار</Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {warehouse.currentStock} / {warehouse.capacity}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, backgroundColor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${capacityPercentage}%`,
                          height: '100%',
                          backgroundColor: getCapacityColor(capacityPercentage) + '.main',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {capacityPercentage}% پر
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    داروهای موجود:
                  </Typography>
                  <Box sx={{ maxHeight: 140, overflow: 'auto' }}>
                    {warehouse.drugs.map((drug, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" fontWeight="bold">{drug.name}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                            انقضا: {drug.expireDate} | بچ: {drug.batch}
                          </Typography>
                        </Box>
                        <Chip size="small" label={`${drug.quantity} عدد`} color="primary" variant="outlined" />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Add/Edit Warehouse Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedWarehouse ? 'ویرایش انبار' : 'افزودن انبار جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام انبار"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ManagerSelect
                value={formData.manager}
                onChange={(newValue) => {
                  setFormData({ 
                    ...formData, 
                    manager: newValue
                  })
                }}
                managers={sampleManagers}
                label="مسئول انبار"
                required
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="توضیحات"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="آدرس"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ظرفیت (تعداد)"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || '' })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>انصراف</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedWarehouse ? 'ویرایش' : 'افزودن'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <TransferDialog
        open={openTransferDialog}
        onClose={() => setOpenTransferDialog(false)}
        onSave={(transferData) => {
          console.log('انتقال ثبت شد:', transferData);
          alert('انتقال با موفقیت ثبت شد!');
          setOpenTransferDialog(false);
        }}
        title="حواله انتقالی بین انبارها"
        type="transfer"
        mode="add"
      />
    </Box>
  )
}
