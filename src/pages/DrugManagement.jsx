  // اعتبارسنجی فرم با پیام خطا
  const validateForm = () => {
    if (!formData.name.trim() || !formData.dosage || !formData.expireDate || !formData.quantity) {
      setSnackbar({ open: true, message: 'لطفاً همه فیلدهای ضروری را به‌درستی پر کنید', severity: 'error' })
      return false
    }
    if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      setSnackbar({ open: true, message: 'مقدار باید عدد مثبت باشد', severity: 'error' })
      return false
    }
    return true
  }
import React, { useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import SMSService from '../services/smsService'
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
} from '@mui/material'
import { WarehouseSelect, SupplierSelect } from '../components/DropdownSelects'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Medication as MedicationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  PhotoCamera as PhotoCameraIcon,
  Image as ImageIcon,
} from '@mui/icons-material'

// داده‌های نمونه
const sampleSuppliers = [
  { id: 1, name: 'شرکت داروسازی سینا', phone: '021-12345678', contact: 'احمد رضایی' },
  { id: 2, name: 'شرکت طب داری', phone: '021-87654321', contact: 'فاطمه کریمی' },
  { id: 3, name: 'داروخانه مرکزی ایران', phone: '021-11223344', contact: 'محمد حسینی' },
  { id: 4, name: 'شرکت پخش البرز', phone: '021-55667788', contact: 'علی محمدی' },
]

const sampleWarehouses = [
  { id: 1, name: 'انبار مرکزی' },
  { id: 2, name: 'انبار شعبه شرق' },
  { id: 3, name: 'انبار شعبه غرب' },
  { id: 4, name: 'انبار شعبه شمال' },
  { id: 5, name: 'انبار شعبه جنوب' },
]

const sampleDrugs = [
  {
    id: 1,
    name: 'آسپرین',
    description: 'ضد درد و تب‌بر',
    dosage: '500 میلی‌گرم',
    expireDate: '2025-11-15',
    warehouse: 'انبار مرکزی',
    supplier: 'شرکت داروسازی سینا',
    quantity: 100,
    image: null,
    status: 'active'
  },
  {
    id: 2,
    name: 'ایبوپروفن',
    description: 'ضد التهاب و تب‌بر',
    dosage: '400 میلی‌گرم',
    expireDate: '2025-09-20',
    warehouse: 'انبار شعبه شرق',
    supplier: 'شرکت طب داری',
    quantity: 75,
    image: null,
    status: 'expiring'
  },
  {
    id: 3,
    name: 'پنی‌سیلین',
    description: 'آنتی‌بیوتیک',
    dosage: '250 میلی‌گرم',
    expireDate: '2025-08-10',
    warehouse: 'انبار شعبه غرب',
    supplier: 'داروخانه مرکزی ایران',
    quantity: 25,
    image: null,
    status: 'expired'
  },
  {
    id: 4,
    name: 'آموکسی‌سیلین',
    description: 'آنتی‌بیوتیک پنی‌سیلینی',
    dosage: '500 میلی‌گرم',
    expireDate: '2026-01-12',
    warehouse: 'انبار شعبه شمال',
    supplier: 'شرکت پخش البرز',
    quantity: 60,
    image: null,
    status: 'active'
  },
]

export default function DrugManagement() {
  const [drugs, setDrugs] = useState(sampleDrugs)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, expiring, expired
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dosage: '',
    expireDate: '',
    quantity: '',
    features: '',
    image: null,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  // بستن Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false })
  }
  const [imageZoomOpen, setImageZoomOpen] = useState(false)
  const [zoomedImage, setZoomedImage] = useState(null)

  const handleOpenDialog = (drug = null) => {
    if (drug) {
      setSelectedDrug(drug)
      setFormData({
        name: drug.name || '',
        description: drug.description || '',
        dosage: drug.dosage || '',
        expireDate: drug.expireDate || '',
        quantity: drug.quantity || '',
        features: drug.features || '',
        image: drug.image || null,
      })
      if (drug.image) {
        setImagePreview(drug.image)
      }
    } else {
      setSelectedDrug(null)
      setFormData({
        name: '',
        description: '',
        dosage: '',
        expireDate: '',
        quantity: '',
        features: '',
        image: null,
      })
      setImagePreview(null)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedDrug(null)
  }



  const handleSave = async () => {
    console.log('FormData before validation:', formData)
    
    if (!validateForm()) {
      return
    }

    console.log('FormData after validation:', formData)

    if (selectedDrug) {
      // ویرایش دارو
      setDrugs(drugs.map(drug => 
        drug.id === selectedDrug.id 
          ? { 
              ...formData,
              id: selectedDrug.id,
              status: calculateExpireStatus(formData.expireDate),
            }
          : drug
      ))
      setSnackbar({ open: true, message: 'دارو با موفقیت ویرایش شد', severity: 'success' })
    } else {
      // افزودن دارو جدید
      const newDrug = {
        id: Math.max(...drugs.map(d => d.id)) + 1,
        ...formData,
        status: calculateExpireStatus(formData.expireDate)
      }
      setDrugs([...drugs, newDrug])
      setSnackbar({ open: true, message: 'داروی جدید با موفقیت اضافه شد', severity: 'success' })
      
      // ارسال پیامک اطلاع‌رسانی
      await sendSMSNotification(newDrug)
    }
    handleCloseDialog()
  }

  // تابع ارسال پیامک
  const sendSMSNotification = async (drugData) => {
    try {
      const smsConfig = JSON.parse(localStorage.getItem('smsConfig') || '{}')
      
      if (!smsConfig.enabled || !smsConfig.adminPhone) {
        console.log('سیستم پیامک غیرفعال است یا شماره مدیر تنظیم نشده')
        return
      }

      const smsService = new SMSService()
      
      // تنظیم مقادیر از localStorage
      smsService.apiUrl = smsConfig.apiUrl
      smsService.apiKey = smsConfig.apiKey
      smsService.username = smsConfig.username
      smsService.password = smsConfig.password
      smsService.senderNumber = smsConfig.senderNumber
      smsService.adminPhone = smsConfig.adminPhone

      const result = await smsService.sendDrugRegistrationSMS(drugData)
      
      if (result.success) {
        console.log('پیامک اطلاع‌رسانی با موفقیت ارسال شد')
      } else {
        console.error('خطا در ارسال پیامک:', result.error)
      }
    } catch (error) {
      console.error('خطا در سیستم پیامک:', error)
    }
  }

  const handleDelete = (drugId) => {
    if (confirm('آیا از حذف این دارو مطمئن هستید؟')) {
      setDrugs(drugs.filter(drug => drug.id !== drugId))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'expiring': return 'warning'
      case 'expired': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'فعال'
      case 'expiring': return 'نزدیک به انقضا'
      case 'expired': return 'منقضی شده'
      default: return 'نامشخص'
    }
  }

  const calculateExpireStatus = (expireDate) => {
    if (!expireDate) return 'active'
    
    const today = new Date()
    const expire = new Date(expireDate) // حالا که فرمت میلادی است نیازی به replace نیست
    const timeDiff = expire.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (daysDiff < 0) {
      return 'expired'  // منقضی شده
    } else if (daysDiff <= 30) {
      return 'expiring' // نزدیک به انقضا (کمتر از 30 روز)
    } else {
      return 'active'   // فعال
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // بررسی نوع فایل
      if (!file.type.startsWith('image/')) {
        alert('لطفاً یک فایل تصویری انتخاب کنید')
        return
      }
      
      // بررسی حجم فایل (حداکثر 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم فایل نباید بیشتر از 2 مگابایت باشد')
        return
      }

      // ایجاد preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setFormData({ ...formData, image: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setFormData({ ...formData, image: null })
  }

  const handleImageZoom = (imageSrc) => {
    setZoomedImage(imageSrc)
    setImageZoomOpen(true)
  }

  const handleZoomClose = () => {
    setImageZoomOpen(false)
    setZoomedImage(null)
  }

  const filteredDrugs = drugs.filter(drug => {
    const matchesSearch = drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drug.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    
    const drugStatus = calculateExpireStatus(drug.expireDate)
    return matchesSearch && drugStatus === statusFilter
  })

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            مدیریت داروها
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            مدیریت و پیگیری داروهای موجود در سیستم
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          افزودن داروی جدید
        </Button>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="جستجو در نام یا توضیحات دارو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant={statusFilter === 'all' ? 'contained' : 'outlined'} 
                  startIcon={<FilterIcon />}
                  onClick={() => setStatusFilter('all')}
                >
                  همه ({drugs.length})
                </Button>
                <Button 
                  variant={statusFilter === 'expiring' ? 'contained' : 'outlined'} 
                  color="warning"
                  onClick={() => setStatusFilter('expiring')}
                >
                  نزدیک به انقضا ({drugs.filter(d => calculateExpireStatus(d.expireDate) === 'expiring').length})
                </Button>
                <Button 
                  variant={statusFilter === 'expired' ? 'contained' : 'outlined'} 
                  color="error"
                  onClick={() => setStatusFilter('expired')}
                >
                  منقضی شده ({drugs.filter(d => calculateExpireStatus(d.expireDate) === 'expired').length})
                </Button>
                <Button 
                  variant={statusFilter === 'active' ? 'contained' : 'outlined'} 
                  color="success"
                  onClick={() => setStatusFilter('active')}
                >
                  فعال ({drugs.filter(d => calculateExpireStatus(d.expireDate) === 'active').length})
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Drugs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
            لیست داروها ({filteredDrugs.length})
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>دارو</TableCell>
                  <TableCell>دوز</TableCell>
                  <TableCell>انبار</TableCell>
                  <TableCell>موجودی</TableCell>
                  <TableCell>تاریخ انقضا</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDrugs.map((drug) => (
                  <TableRow key={drug.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            width: 50, 
                            height: 50,
                            cursor: drug.image ? 'pointer' : 'default'
                          }}
                          src={drug.image ? URL.createObjectURL(drug.image) : undefined}
                          onClick={() => drug.image && handleImageZoom(URL.createObjectURL(drug.image))}
                        >
                          {!drug.image && <MedicationIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {drug.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {drug.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{drug.dosage}</TableCell>
                    <TableCell>{drug.warehouse}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${drug.quantity} عدد`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{drug.expireDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(calculateExpireStatus(drug.expireDate))}
                        color={getStatusColor(calculateExpireStatus(drug.expireDate))}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(drug)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(drug.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedDrug ? 'ویرایش دارو' : 'افزودن داروی جدید'}
        </DialogTitle>
        <DialogContent sx={{ minHeight: '500px' }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="نام دارو"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                size="medium"
                sx={{ minWidth: 350 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="دوز"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="مثال: 500 میلی‌گرم"
                size="medium"
                sx={{ minWidth: 200 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="توضیحات"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="توضیحات مختصر درباره دارو..."
                size="medium"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="تاریخ انقضا"
                value={formData.expireDate ? dayjs(formData.expireDate) : null}
                onChange={(newValue) => {
                  const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : ''
                  setFormData({ 
                    ...formData, 
                    expireDate: formattedDate
                  })
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "medium",
                    helperText: "فرمت: روز/ماه/سال",
                    required: true,
                    sx: { minWidth: 200 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="موجودی"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                inputProps={{ min: 0 }}
                size="medium"
                helperText="تعداد واحد"
                sx={{ minWidth: 200 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ویژگی‌های خاص"
                multiline
                rows={1}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="مثال: قرص، کپسول، شربت"
                size="medium"
                sx={{ minWidth: 200 }}
              />
            </Grid>
            
            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                📷 تصویر دارو (اختیاری)
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: 3,
                border: '2px dashed #e0e0e0',
                borderRadius: 2,
                p: 3,
                alignItems: 'center',
                minHeight: '120px'
              }}>
                {imagePreview ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img 
                      src={imagePreview} 
                      alt="پیش‌نمایش" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }} 
                    />
                    <Box>
                      <Typography variant="body2" color="success.main" gutterBottom>
                        ✅ تصویر آپلود شد
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={handleRemoveImage}
                      >
                        حذف
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        تصویر دارو را انتخاب کنید
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        فرمت‌های مجاز: JPG, PNG, WebP | حداکثر 2MB
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                  >
                    {imagePreview ? 'تغییر تصویر' : 'انتخاب تصویر'}
                  </Button>
                </label>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>انصراف</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedDrug ? 'ویرایش' : 'افزودن'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {/* Image Zoom Dialog */}
      <Dialog
        open={imageZoomOpen}
        onClose={handleZoomClose}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { bgcolor: 'rgba(0,0,0,0.9)' } }}
      >
        <DialogTitle sx={{ color: 'white', textAlign: 'center' }}>
          <Button 
            onClick={handleZoomClose}
            sx={{ float: 'right', color: 'white', minWidth: 'auto', p: 1 }}
          >
            ✕
          </Button>
          تصویر دارو
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {zoomedImage && (
            <img 
              src={zoomedImage} 
              alt="تصویر بزرگ شده"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
