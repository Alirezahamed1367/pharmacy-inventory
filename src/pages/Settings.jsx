import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Warehouse as WarehouseIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Store as StoreIcon
} from '@mui/icons-material'
import AccessLevelManagement from '../components/AccessLevelManagement'
import { SUPPLIERS } from '../data/systemData'

// داده‌های نمونه
const sampleUsers = [
  {
    id: 1,
    username: 'superadmin',
    role: 'superadmin',
    fullName: 'سوپر ادمین',
    email: 'superadmin@system.com',
    active: true,
    lastLogin: '1404/07/01',
  },
  {
    id: 2,
    username: 'manager1',
    role: 'admin',
    fullName: 'علی احمدی',
    email: 'ali@company.com',
    active: true,
    lastLogin: '1404/06/30',
  },
  {
    id: 3,
    username: 'warehouse1',
    role: 'manager',
    fullName: 'فاطمه محمدی',
    email: 'fateme@company.com',
    active: true,
    lastLogin: '1404/06/29',
  },
]

const sampleSettings = {
  notifications: {
    expireWarnings: true,
    lowStockAlerts: true,
    transferNotifications: true,
    emailNotifications: false,
  },
  system: {
    autoBackup: true,
    backupInterval: 24,
    sessionTimeout: 60,
    maxLoginAttempts: 3,
  },
  display: {
    language: 'fa',
    theme: 'light',
    itemsPerPage: 10,
    dateFormat: 'persian',
  }
}

export default function Settings() {
  const [users, setUsers] = useState(sampleUsers)
  const [suppliers, setSuppliers] = useState(SUPPLIERS)
  const [settings, setSettings] = useState(sampleSettings)
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [userFormData, setUserFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'manager',
    password: '',
  })
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    contact: '',
    contactPhone: '',
    specialties: '',
  })

  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setSelectedUser(user)
      setUserFormData({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: '',
      })
    } else {
      setSelectedUser(null)
      setUserFormData({
        username: '',
        fullName: '',
        email: '',
        role: 'manager',
        password: '',
      })
    }
    setOpenUserDialog(true)
  }

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false)
    setSelectedUser(null)
  }

  const handleSaveUser = () => {
    if (selectedUser) {
      // ویرایش کاربر
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...userFormData }
          : user
      ))
    } else {
      // افزودن کاربر جدید
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...userFormData,
        active: true,
        lastLogin: '',
      }
      setUsers([...users, newUser])
    }
    handleCloseUserDialog()
  }

  const handleDeleteUser = (userId) => {
    if (confirm('آیا از حذف این کاربر مطمئن هستید؟')) {
      setUsers(users.filter(user => user.id !== userId))
    }
  }

  // توابع مدیریت تامین‌کنندگان
  const handleOpenSupplierDialog = (supplier = null) => {
    if (supplier) {
      setSelectedSupplier(supplier)
      setSupplierFormData({
        name: supplier.name,
        code: supplier.code,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        contact: supplier.contact,
        contactPhone: supplier.contactPhone,
        specialties: supplier.specialties?.join(', ') || '',
      })
    } else {
      setSelectedSupplier(null)
      setSupplierFormData({
        name: '',
        code: '',
        phone: '',
        email: '',
        address: '',
        contact: '',
        contactPhone: '',
        specialties: '',
      })
    }
    setOpenSupplierDialog(true)
  }

  const handleCloseSupplierDialog = () => {
    setOpenSupplierDialog(false)
    setSelectedSupplier(null)
  }

  const handleSaveSupplier = () => {
    const supplierData = {
      ...supplierFormData,
      specialties: supplierFormData.specialties.split(',').map(s => s.trim()).filter(s => s),
      rating: 0,
      isActive: true
    }

    if (selectedSupplier) {
      // ویرایش تامین‌کننده
      setSuppliers(suppliers.map(supplier => 
        supplier.id === selectedSupplier.id 
          ? { ...supplier, ...supplierData }
          : supplier
      ))
    } else {
      // افزودن تامین‌کننده جدید
      const newSupplier = {
        id: Math.max(...suppliers.map(s => s.id)) + 1,
        ...supplierData,
      }
      setSuppliers([...suppliers, newSupplier])
    }
    handleCloseSupplierDialog()
  }

  const handleDeleteSupplier = (supplierId) => {
    if (confirm('آیا از حذف این تامین‌کننده مطمئن هستید؟')) {
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId))
    }
  }

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }))
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'superadmin': return 'سوپر ادمین'
      case 'admin': return 'مدیر'
      case 'manager': return 'مسئول انبار'
      default: return 'کاربر'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'error'
      case 'admin': return 'primary'
      case 'manager': return 'success'
      default: return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          تنظیمات سیستم
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          مدیریت کاربران، تنظیمات سیستم و پیکربندی برنامه
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label="تنظیمات عمومی" 
            icon={<SettingsIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="مدیریت کاربران (ساده)" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="مدیریت تامین‌کنندگان" 
            icon={<StoreIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="مدیریت سطوح دسترسی" 
            icon={<AdminIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="تنظیمات سازمان" 
            icon={<BusinessIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
        {/* مدیریت کاربران */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    مدیریت کاربران
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenUserDialog()}
                >
                  افزودن کاربر
                </Button>
              </Box>
              <List>
                {users.map((user) => (
                  <ListItem key={user.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: getRoleColor(user.role) + '.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.fullName}
                          </Typography>
                          <Chip
                            size="small"
                            label={getRoleText(user.role)}
                            color={getRoleColor(user.role)}
                          />
                          {user.active && <Chip size="small" label="فعال" color="success" variant="outlined" />}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            نام کاربری: {user.username}
                          </Typography>
                          <Typography variant="caption" display="block">
                            آخرین ورود: {user.lastLogin || 'هرگز'}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" color="primary" onClick={() => handleOpenUserDialog(user)}>
                        <EditIcon />
                      </IconButton>
                      {user.role !== 'superadmin' && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* تنظیمات اعلان‌ها */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  تنظیمات اعلان‌ها
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.expireWarnings}
                      onChange={(e) => handleSettingChange('notifications', 'expireWarnings', e.target.checked)}
                    />
                  }
                  label="هشدار انقضای داروها"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.lowStockAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'lowStockAlerts', e.target.checked)}
                    />
                  }
                  label="هشدار کمبود موجودی"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.transferNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'transferNotifications', e.target.checked)}
                    />
                  }
                  label="اعلان انتقالات"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    />
                  }
                  label="اعلان‌های ایمیلی"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* تنظیمات سیستم */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  تنظیمات امنیتی
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="زمان انقضای جلسه (دقیقه)"
                  type="number"
                  size="small"
                  value={settings.system.sessionTimeout}
                  onChange={(e) => handleSettingChange('system', 'sessionTimeout', parseInt(e.target.value))}
                />
                <TextField
                  label="حداکثر تلاش ناموفق ورود"
                  type="number"
                  size="small"
                  value={settings.system.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('system', 'maxLoginAttempts', parseInt(e.target.value))}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.system.autoBackup}
                      onChange={(e) => handleSettingChange('system', 'autoBackup', e.target.checked)}
                    />
                  }
                  label="پشتیبان‌گیری خودکار"
                />
                {settings.system.autoBackup && (
                  <TextField
                    label="فاصله پشتیبان‌گیری (ساعت)"
                    type="number"
                    size="small"
                    value={settings.system.backupInterval}
                    onChange={(e) => handleSettingChange('system', 'backupInterval', parseInt(e.target.value))}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* تنظیمات نمایش */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PaletteIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  تنظیمات نمایش
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="تعداد آیتم در هر صفحه"
                  type="number"
                  size="small"
                  value={settings.display.itemsPerPage}
                  onChange={(e) => handleSettingChange('display', 'itemsPerPage', parseInt(e.target.value))}
                />
                <TextField
                  label="زبان سیستم"
                  size="small"
                  value="فارسی"
                  disabled
                />
                <TextField
                  label="تم رنگی"
                  size="small"
                  value="روشن"
                  disabled
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* اطلاعات سیستم */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  اطلاعات سیستم
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>نسخه سیستم:</strong> 1.0.0
                  </Typography>
                  <Typography variant="body2">
                    <strong>آخرین به‌روزرسانی:</strong> پاییز 1404
                  </Typography>
                  <Typography variant="body2">
                    <strong>توسعه‌دهنده:</strong> علیرضا حامد
                  </Typography>
                </Alert>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<BackupIcon />} fullWidth>
                    پشتیبان‌گیری دستی
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {/* Tab 2: Supplier Management */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StoreIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      مدیریت تامین‌کنندگان
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenSupplierDialog()}
                  >
                    افزودن تامین‌کننده
                  </Button>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>نام شرکت</TableCell>
                        <TableCell>کد</TableCell>
                        <TableCell>تلفن</TableCell>
                        <TableCell>نماینده</TableCell>
                        <TableCell>تخصص</TableCell>
                        <TableCell>وضعیت</TableCell>
                        <TableCell align="center">عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {supplier.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {supplier.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{supplier.code}</TableCell>
                          <TableCell>{supplier.phone}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{supplier.contact}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {supplier.contactPhone}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {supplier.specialties?.map((specialty, index) => (
                                <Chip 
                                  key={index}
                                  label={specialty} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={supplier.isActive ? 'فعال' : 'غیرفعال'}
                              color={supplier.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenSupplierDialog(supplier)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSupplier(supplier.id)}
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
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Simple User Management */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* مدیریت کاربران */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      مدیریت کاربران (ساده)
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenUserDialog()}
                  >
                    افزودن کاربر
                  </Button>
                </Box>
                <List>
                  {users.map((user) => (
                    <ListItem key={user.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getRoleColor(user.role) + '.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {user.fullName}
                            </Typography>
                            <Chip
                              size="small"
                              label={getRoleText(user.role)}
                              color={getRoleColor(user.role)}
                            />
                            {user.active && <Chip size="small" label="فعال" color="success" variant="outlined" />}
                          </Box>
                        }
                        secondary={`@${user.username} • آخرین ورود: ${user.lastLogin}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenUserDialog(user)}
                        >
                          <EditIcon />
                        </IconButton>
                        {user.username !== 'superadmin' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Access Level Management */}
      {tabValue === 3 && (
        <AccessLevelManagement />
      )}

      {/* Tab 4: Organization Settings */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  اطلاعات سازمان
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  اطلاعات اساسی سازمان که در فرم‌ها و گزارشات استفاده می‌شود
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="نام سازمان"
                      defaultValue="شرکت داروسازی سینا"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="کد اقتصادی"
                      defaultValue="10861234567"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="شناسه ملی"
                      defaultValue="14008123456"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="کد پستی"
                      defaultValue="1234567890"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="آدرس کامل"
                      defaultValue="تهران، خیابان ولیعصر، نرسیده به پل صدر، پلاک 123"
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="تلفن ثابت"
                      defaultValue="021-12345678"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="فکس"
                      defaultValue="021-87654321"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ایمیل سازمان"
                      defaultValue="info@sina-pharma.com"
                      variant="outlined"
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="وب‌سایت"
                      defaultValue="www.sina-pharma.com"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="نام مدیرعامل"
                      defaultValue="دکتر علی رضایی"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="نام مسئول فنی"
                      defaultValue="دکتر فاطمه محمدی"
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => alert('تغییرات لغو شد')}
                      >
                        لغو
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={() => alert('اطلاعات سازمان ذخیره شد')}
                      >
                        ذخیره تغییرات
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Logo Upload Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  لوگوی سازمان
                </Typography>
                <Box 
                  sx={{ 
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    mb: 2
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <BusinessIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    لوگوی سازمان را انتخاب کنید
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    فرمت‌های مجاز: PNG, JPG, SVG (حداکثر 2MB)
                  </Typography>
                </Box>
                <Button variant="outlined" fullWidth>
                  انتخاب فایل
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Additional Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  تنظیمات اضافی
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="زبان پیش‌فرض" 
                      secondary="فارسی"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="اعلان‌های سیستم" 
                      secondary="فعال"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BackupIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="پشتیبان‌گیری خودکار" 
                      secondary="روزانه ساعت 2:00"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialog افزودن/ویرایش کاربر */}
      <Dialog 
        open={openUserDialog} 
        onClose={handleCloseUserDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام کاربری"
                value={userFormData.username}
                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                disabled={selectedUser?.role === 'superadmin'}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام و نام خانوادگی"
                value={userFormData.fullName}
                onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ایمیل"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نقش"
                select
                SelectProps={{ native: true }}
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                disabled={selectedUser?.role === 'superadmin'}
              >
                <option value="manager">مسئول انبار</option>
                <option value="admin">مدیر</option>
                <option value="superadmin">سوپر ادمین</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="رمز عبور"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                helperText={selectedUser ? "برای تغییر رمز عبور وارد کنید" : "رمز عبور الزامی است"}
                required={!selectedUser}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>انصراف</Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {selectedUser ? 'ویرایش' : 'افزودن'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog افزودن/ویرایش تامین‌کننده */}
      <Dialog 
        open={openSupplierDialog} 
        onClose={handleCloseSupplierDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedSupplier ? 'ویرایش تامین‌کننده' : 'افزودن تامین‌کننده جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام شرکت"
                value={supplierFormData.name}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="کد شرکت"
                value={supplierFormData.code}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, code: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="تلفن"
                value={supplierFormData.phone}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ایمیل"
                type="email"
                value={supplierFormData.email}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="آدرس"
                multiline
                rows={2}
                value={supplierFormData.address}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام نماینده"
                value={supplierFormData.contact}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, contact: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="تلفن نماینده"
                value={supplierFormData.contactPhone}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, contactPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="تخصص‌ها (با کاما جدا کنید)"
                value={supplierFormData.specialties}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, specialties: e.target.value })}
                helperText="مثال: مسکن، آنتی بیوتیک، ویتامین"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSupplierDialog}>انصراف</Button>
          <Button variant="contained" onClick={handleSaveSupplier}>
            {selectedSupplier ? 'ویرایش' : 'افزودن'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
