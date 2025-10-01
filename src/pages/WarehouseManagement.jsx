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
  Alert,
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

import { useEffect } from 'react'
import { supabase } from '../services/supabase'

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState([])
  const [managers, setManagers] = useState([])
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      // انبارها
      const { data: warehousesData, error: warehousesError } = await supabase
        .from('warehouses')
        .select('*')
        .order('name')
      if (warehousesError) throw warehousesError
      setWarehouses(warehousesData || [])

      // مسئولان انبار (کاربران با نقش manager)
      const { data: managersData, error: managersError } = await supabase
        .from('users')
        .select('id, full_name, role, phone')
        .eq('role', 'manager')
      if (managersError) throw managersError
      setManagers(managersData || [])
    } catch (err) {
      setError(err.message || 'خطا در دریافت داده‌ها')
    } finally {
      setLoading(false)
    }
  }



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

  // افزودن یا ویرایش انبار در Supabase
  const handleSave = async () => {
    try {
      if (selectedWarehouse) {
        // ویرایش
        const { error } = await supabase
          .from('warehouses')
          .update({ ...formData })
          .eq('id', selectedWarehouse.id)
        if (error) throw error
      } else {
        // افزودن
        const { error } = await supabase
          .from('warehouses')
          .insert([{ ...formData, active: true }])
        if (error) throw error
      }
      fetchAll()
      handleCloseDialog()
    } catch (err) {
      setError(err.message || 'خطا در ذخیره انبار')
    }
  }

  // حذف انبار از Supabase
  const handleDelete = async (warehouseId) => {
    if (!window.confirm('آیا از حذف این انبار مطمئن هستید؟')) return
    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', warehouseId)
      if (error) throw error
      fetchAll()
    } catch (err) {
      setError(err.message || 'خطا در حذف انبار')
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
      {loading && <Alert severity="info">در حال بارگذاری داده‌ها...</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
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
          const capacityPercentage = getCapacityPercentage(warehouse.current_stock || 0, warehouse.capacity || 1)
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
                        {warehouse.current_stock || 0} / {warehouse.capacity || 0}
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

                  {/* نمایش داروهای انبار از طریق ویو یا کوئری جداگانه (در صورت نیاز) */}
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
                managers={managers}
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
