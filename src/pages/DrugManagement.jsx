import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material'
import { supabase, getDrugs, addDrug, updateDrug, deleteDrug, uploadImage, getImageUrl } from '../services/supabase'
import ImageUpload from '../components/ImageUpload'
import ImageViewer from '../components/ImageViewer'

const DrugManagement = () => {
  const [drugs, setDrugs] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [open, setOpen] = useState(false)
  const [editingDrug, setEditingDrug] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    warehouse_id: '',
    quantity: '',
    expiry_date: '',
    image_url: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const drugsResult = await getDrugs()
      if (drugsResult.error) {
        setAlert({ type: 'error', message: drugsResult.error.message })
      } else {
        setDrugs(drugsResult.data || [])
      }

      // Load warehouses
      if (supabase) {
        const { data: warehousesData, error: warehousesError } = await supabase
          .from('warehouses')
          .select('*')
        
        if (warehousesError) {
          setAlert({ type: 'error', message: 'خطا در بارگذاری انبارها: ' + warehousesError.message })
        } else {
          setWarehouses(warehousesData || [])
        }
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'خطا در بارگذاری داده‌ها: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      setAlert({ type: 'error', message: 'نام و دسته‌بندی دارو اجباری است' })
      return
    }

    setLoading(true)
    try {
      if (editingDrug) {
        const result = await updateDrug(editingDrug.id, formData)
        if (result.error) {
          setAlert({ type: 'error', message: result.error.message })
        } else {
          setAlert({ type: 'success', message: 'دارو با موفقیت ویرایش شد' })
          setOpen(false)
          loadData()
        }
      } else {
        const result = await addDrug(formData)
        if (result.error) {
          setAlert({ type: 'error', message: result.error.message })
        } else {
          setAlert({ type: 'success', message: 'دارو با موفقیت اضافه شد' })
          setOpen(false)
          loadData()
        }
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'خطا در ذخیره دارو: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (drug) => {
    setEditingDrug(drug)
    setFormData({
      name: drug.name || '',
      category: drug.category || '',
      description: drug.description || '',
      price: drug.price?.toString() || '',
      warehouse_id: drug.warehouse_id || '',
      quantity: drug.quantity?.toString() || '',
      expiry_date: drug.expiry_date || '',
      image_url: drug.image_url || ''
    })
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این دارو اطمینان دارید؟')) return

    setLoading(true)
    try {
      const result = await deleteDrug(id)
      if (result.error) {
        setAlert({ type: 'error', message: result.error.message })
      } else {
        setAlert({ type: 'success', message: 'دارو با موفقیت حذف شد' })
        loadData()
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'خطا در حذف دارو: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    try {
      const result = await uploadImage(file, 'drug-images')
      if (result.error) {
        setAlert({ type: 'error', message: result.error.message })
      } else {
        setFormData(prev => ({ ...prev, image_url: result.data.path }))
        setAlert({ type: 'success', message: 'تصویر با موفقیت آپلود شد' })
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'خطا در آپلود تصویر: ' + error.message })
    }
  }

  const handleViewImage = (imageUrl) => {
    setCurrentImage(imageUrl)
    setImageViewerOpen(true)
  }

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId)
    return warehouse ? warehouse.name : 'نامشخص'
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      warehouse_id: '',
      quantity: '',
      expiry_date: '',
      image_url: ''
    })
    setEditingDrug(null)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          مدیریت داروها
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm()
            setOpen(true)
          }}
        >
          افزودن دارو جدید
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام دارو</TableCell>
              <TableCell>دسته‌بندی</TableCell>
              <TableCell>قیمت</TableCell>
              <TableCell>انبار</TableCell>
              <TableCell>موجودی</TableCell>
              <TableCell>تاریخ انقضا</TableCell>
              <TableCell>تصویر</TableCell>
              <TableCell>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drugs.map((drug) => (
              <TableRow key={drug.id}>
                <TableCell>{drug.name}</TableCell>
                <TableCell>
                  <Chip label={drug.category} size="small" />
                </TableCell>
                <TableCell>{drug.price?.toLocaleString()} تومان</TableCell>
                <TableCell>{getWarehouseName(drug.warehouse_id)}</TableCell>
                <TableCell>{drug.quantity}</TableCell>
                <TableCell>
                  {drug.expiry_date ? new Date(drug.expiry_date).toLocaleDateString('fa-IR') : '-'}
                </TableCell>
                <TableCell>
                  {drug.image_url && (
                    <IconButton
                      onClick={() => handleViewImage(getImageUrl(drug.image_url))}
                      size="small"
                    >
                      <ImageIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(drug)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(drug.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {drugs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  هیچ دارویی یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog برای افزودن/ویرایش دارو */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDrug ? 'ویرایش دارو' : 'افزودن دارو جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام دارو"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="دسته‌بندی"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="توضیحات"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="قیمت (تومان)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>انبار</InputLabel>
                <Select
                  value={formData.warehouse_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, warehouse_id: e.target.value }))}
                  label="انبار"
                >
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="موجودی"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="تاریخ انقضا"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                تصویر دارو
              </Typography>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={formData.image_url ? getImageUrl(formData.image_url) : null}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'در حال ذخیره...' : (editingDrug ? 'ویرایش' : 'افزودن')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Viewer */}
      <ImageViewer
        open={imageViewerOpen}
        imageUrl={currentImage}
        onClose={() => setImageViewerOpen(false)}
        title="تصویر دارو"
      />
    </Paper>
  )
}

export default DrugManagement
