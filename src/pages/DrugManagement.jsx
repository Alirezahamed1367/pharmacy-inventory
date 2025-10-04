import React, { useState, useEffect, useMemo } from 'react'
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
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material'
import { getDrugs, addDrug, updateDrug, deleteDrug } from '../services/supabase'
import ImageUpload from '../components/ImageUpload'
import ImageViewer from '../components/ImageViewer'
import { buildUserError, guardOffline, isOffline } from '../utils/errorUtils'
import { formatDMY, formatJalali, parseDMYToISO } from '../utils/dateUtils'

const DrugManagement = () => {
  // لیست انواع بسته‌بندی
  const packageTypes = [
    'قرص',
    'کپسول', 
    'شربت',
    'قطره',
    'پماد',
    'ژل',
    'کرم',
    'اسپری',
    'تزریقی',
    'ساشه',
    'بطری',
    'جعبه'
  ]

  const [drugs, setDrugs] = useState([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingDrug, setEditingDrug] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    package_type: '',
    image_url: '',
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const drugsResult = await getDrugs()
      if (drugsResult.data) {
        setDrugs(drugsResult.data)
      }
    } catch (error) {
      console.error('خطا در بارگذاری داده‌ها:', error)
      setAlert({ type: 'error', message: 'خطا در بارگذاری داده‌ها' })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      package_type: '',
      image_url: '',
      is_active: true
    })
    setEditingDrug(null)
  }

  const handleSubmit = async () => {
    const offline = guardOffline()
    if (offline.blocked) {
      setAlert({ type: 'warning', message: offline.message })
      return
    }
    if (!formData.name || !formData.package_type) {
      setAlert({ type: 'error', message: 'نام و نوع بسته‌بندی الزامی است' })
      return
    }
    // بررسی تکراری نبودن ترکیب (نام + بسته بندی)
    const dup = drugs.find(d => d.name === formData.name && d.package_type === formData.package_type && (!editingDrug || d.id !== editingDrug.id))
    if (dup) {
      setAlert({ type: 'error', message: 'این واریانت (نام + بسته‌بندی) قبلاً وجود دارد' })
      return
    }
    setLoading(true)
    try {
      const payload = { ...formData }
      const op = editingDrug ? updateDrug(editingDrug.id, payload) : addDrug(payload)
      const result = await op
      if (result.error) {
        setAlert({ type: 'error', message: buildUserError(result.error) })
      } else {
        setAlert({ type: 'success', message: editingDrug ? 'دارو با موفقیت ویرایش شد' : 'دارو با موفقیت اضافه شد' })
        setOpen(false)
        resetForm()
        loadData()
      }
    } catch (error) {
      setAlert({ type: 'error', message: buildUserError(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (drug) => {
    setEditingDrug(drug)
    setFormData({
      name: drug.name || '',
      description: drug.description || '',
      package_type: drug.package_type || '',
      image_url: drug.image_url || '',
      is_active: drug.is_active !== false
    })
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('آیا از حذف این دارو اطمینان دارید؟')) {
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
      }
    }
  }

  const handleImageUpload = async (imageUrl) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }))
    setAlert({ type: 'success', message: 'تصویر با موفقیت آپلود شد' })
  }

  const handleViewImage = (imageUrl) => {
    setCurrentImage(imageUrl)
    setImageViewerOpen(true)
  }

  const filteredDrugs = useMemo(() => {
    return [...drugs]
      .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b)=> (a.expire_date || '').localeCompare(b.expire_date || ''))
  }, [drugs, search])

  const daysToExpire = (dateStr) => {
    if(!dateStr) return null
    const t = new Date(dateStr)
    const today = new Date()
    return Math.floor((t - today)/(1000*60*60*24))
  }

  const expiryStatus = (drug) => {
    const d = daysToExpire(drug.expire_date)
    if (d === null) return '-'
    if (d < 0) return <Box component="span" sx={{color:'error.main', fontWeight:600}}>منقضی</Box>
    if (d <= 30) return <Box component="span" sx={{color:'error.main', fontWeight:600}}>{d} روز (خطر)</Box>
    if (d <= 90) return <Box component="span" sx={{color:'warning.main', fontWeight:600}}>{d} روز</Box>
    return <Box component="span" sx={{color:'success.main'}}>{d} روز</Box>
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          مدیریت داروها
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            const off = guardOffline('در حالت آفلاین امکان افزودن دارو نیست')
            if (off.blocked) {
              setAlert({ type: 'warning', message: off.message })
              return
            }
            resetForm()
            setOpen(true)
          }}
          disabled={isOffline()}
        >
          افزودن دارو جدید
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Box mb={2}>
        <TextField
          placeholder="جستجوی نام دارو..."
          size="small"
          fullWidth
            value={search}
            onChange={e=>setSearch(e.target.value)}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام دارو</TableCell>
              <TableCell>توضیحات</TableCell>
              <TableCell>تصویر</TableCell>
              <TableCell>نوع بسته‌بندی</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrugs.map((drug) => (
              <TableRow key={drug.id}>
                <TableCell>{drug.name}</TableCell>
                <TableCell>{drug.description || '-'}</TableCell>
                <TableCell>
                  {drug.image_url ? (
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleViewImage(drug.image_url)}
                    >
                      <img
                        src={drug.image_url}
                        alt={drug.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)'
                        }}
                      />
                    </Box>
                  ) : (
                    <ImageIcon color="disabled" />
                  )}
                </TableCell>
                <TableCell>{drug.package_type || '-'}</TableCell>
                <TableCell>
                    {drug.is_active ? <Box component='span' sx={{ color:'success.main', fontWeight:600 }}>فعال</Box> : <Box component='span' sx={{ color:'text.disabled' }}>غیرفعال</Box>}
                  </TableCell>
                  <TableCell>
                  <IconButton onClick={() => handleEdit(drug)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(drug.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                    <Button size='small' sx={{ ml:1 }} variant='outlined' onClick={async ()=>{
                      const res = await updateDrug(drug.id, { ...drug, is_active: !drug.is_active })
                      if (res.error) { setAlert({ type:'error', message: res.error.message }); return }
                      setAlert({ type:'success', message: 'وضعیت دارو به‌روزرسانی شد' })
                      loadData()
                    }}>{drug.is_active ? 'غیرفعال' : 'فعال سازی'}</Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredDrugs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">هیچ دارویی یافت نشد</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDrug ? 'ویرایش دارو' : 'افزودن دارو جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="نام دارو *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                placeholder="توضیحات کامل در مورد دارو..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>نوع بسته‌بندی</InputLabel>
                <Select
                  value={formData.package_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, package_type: e.target.value }))}
                  label="نوع بسته‌بندی"
                >
                  {packageTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Alert severity='info'>تاریخ انقضا اکنون هنگام ثبت رسید (رسید کالا) در سطح لات ثبت می‌شود و در تعریف دارو نیازی به ورود آن نیست.</Alert>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                تصویر دارو
              </Typography>
              <ImageUpload
                onChange={handleImageUpload}
                value={formData.image_url}
                bucket="drug-images"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading || isOffline()}>
            {loading ? 'در حال ذخیره...' : (editingDrug ? 'ویرایش' : 'افزودن')}
          </Button>
        </DialogActions>
      </Dialog>

      <ImageViewer
        open={imageViewerOpen}
        src={currentImage}
        onClose={() => setImageViewerOpen(false)}
      />
    </Paper>
  )
}

export default DrugManagement