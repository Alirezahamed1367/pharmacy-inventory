import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
  Checkbox,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Lock as LockIcon,
  Key as KeyIcon
} from '@mui/icons-material';

// تعریف سطوح دسترسی
const ACCESS_LEVELS = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'مدیر کل سیستم',
    description: 'دسترسی کامل به تمام بخش‌ها',
    color: 'error',
    permissions: [
      'user_management',
      'system_settings',
      'all_warehouses',
      'all_drugs',
      'all_receipts',
      'reports',
      'backup_restore',
      'audit_logs'
    ]
  },
  ADMIN: {
    id: 'admin',
    name: 'مدیر',
    description: 'دسترسی به مدیریت عمومی',
    color: 'warning',
    permissions: [
      'user_management_limited',
      'all_warehouses',
      'all_drugs',
      'all_receipts',
      'reports',
      'audit_logs'
    ]
  },
  WAREHOUSE_MANAGER: {
    id: 'warehouse_manager',
    name: 'مدیر انبار',
    description: 'مدیریت انبار اختصاصی',
    color: 'info',
    permissions: [
      'assigned_warehouse',
      'warehouse_drugs',
      'warehouse_receipts',
      'warehouse_reports',
      'inventory_management'
    ]
  },
  PHARMACIST: {
    id: 'pharmacist',
    name: 'داروساز',
    description: 'مدیریت دارو و تجویز',
    color: 'success',
    permissions: [
      'drug_information',
      'prescription_management',
      'drug_reports',
      'expiry_alerts'
    ]
  },
  OPERATOR: {
    id: 'operator',
    name: 'اپراتور',
    description: 'دسترسی محدود به عملیات روزانه',
    color: 'default',
    permissions: [
      'basic_operations',
      'limited_reports'
    ]
  }
};

// تعریف مجوزها
const PERMISSIONS = {
  user_management: 'مدیریت کاربران',
  user_management_limited: 'مدیریت کاربران محدود',
  system_settings: 'تنظیمات سیستم',
  all_warehouses: 'دسترسی به همه انبارها',
  assigned_warehouse: 'دسترسی به انبار اختصاصی',
  all_drugs: 'مدیریت همه داروها',
  warehouse_drugs: 'مدیریت داروهای انبار',
  drug_information: 'اطلاعات دارو',
  all_receipts: 'مدیریت همه رسیدها',
  warehouse_receipts: 'مدیریت رسیدهای انبار',
  prescription_management: 'مدیریت نسخه‌ها',
  reports: 'گزارش‌گیری کامل',
  warehouse_reports: 'گزارش‌گیری انبار',
  drug_reports: 'گزارش‌گیری دارو',
  limited_reports: 'گزارش‌گیری محدود',
  inventory_management: 'مدیریت موجودی',
  backup_restore: 'پشتیبان‌گیری و بازیابی',
  audit_logs: 'لاگ‌های حسابرسی',
  expiry_alerts: 'هشدارهای انقضا',
  basic_operations: 'عملیات پایه'
};

// کاربران نمونه
const sampleUsers = [
  {
    id: 1,
    username: 'superadmin',
    name: 'مدیر کل سیستم',
    email: 'admin@pharmacy.com',
    accessLevel: 'super_admin',
    assignedWarehouses: ['all'],
    isActive: true,
    lastLogin: '1404/07/10 - 14:30',
    permissions: ACCESS_LEVELS.SUPER_ADMIN.permissions
  },
  {
    id: 2,
    username: 'manager1',
    name: 'احمد رضایی',
    email: 'ahmad@pharmacy.com',
    accessLevel: 'admin',
    assignedWarehouses: ['all'],
    isActive: true,
    lastLogin: '1404/07/09 - 16:45',
    permissions: ACCESS_LEVELS.ADMIN.permissions
  },
  {
    id: 3,
    username: 'warehouse1',
    name: 'فاطمه کریمی',
    email: 'fateme@pharmacy.com',
    accessLevel: 'warehouse_manager',
    assignedWarehouses: [1, 2], // انبار مرکزی و شعبه شرق
    isActive: true,
    lastLogin: '1404/07/10 - 08:15',
    permissions: ACCESS_LEVELS.WAREHOUSE_MANAGER.permissions
  },
  {
    id: 4,
    username: 'pharmacist1',
    name: 'دکتر علی محمدی',
    email: 'ali@pharmacy.com',
    accessLevel: 'pharmacist',
    assignedWarehouses: [1],
    isActive: true,
    lastLogin: '1404/07/10 - 12:20',
    permissions: ACCESS_LEVELS.PHARMACIST.permissions
  },
  {
    id: 5,
    username: 'operator1',
    name: 'مریم حسینی',
    email: 'maryam@pharmacy.com',
    accessLevel: 'operator',
    assignedWarehouses: [3],
    isActive: false,
    lastLogin: '1404/07/05 - 10:30',
    permissions: ACCESS_LEVELS.OPERATOR.permissions
  }
];

const AccessLevelManagement = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    accessLevel: 'operator',
    assignedWarehouses: [],
    isActive: true,
    permissions: []
  });

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        name: user.name,
        email: user.email,
        password: '',
        accessLevel: user.accessLevel,
        assignedWarehouses: user.assignedWarehouses,
        isActive: user.isActive,
        permissions: user.permissions || []
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        name: '',
        email: '',
        password: '',
        accessLevel: 'operator',
        assignedWarehouses: [],
        isActive: true,
        permissions: ACCESS_LEVELS.operator.permissions
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleAccessLevelChange = (newLevel) => {
    setFormData({
      ...formData,
      accessLevel: newLevel,
      permissions: ACCESS_LEVELS[newLevel.toUpperCase()]?.permissions || []
    });
  };

  const handlePermissionToggle = (permission) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({
      ...formData,
      permissions: newPermissions
    });
  };

  const handleSave = () => {
    if (selectedUser) {
      // ویرایش کاربر
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // ایجاد کاربر جدید
      const newUser = {
        id: users.length + 1,
        ...formData,
        lastLogin: 'هرگز'
      };
      setUsers([...users, newUser]);
    }
    handleCloseDialog();
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const getAccessLevelInfo = (level) => {
    return ACCESS_LEVELS[level.toUpperCase()] || ACCESS_LEVELS.OPERATOR;
  };

  const getWarehouseNames = (warehouseIds) => {
    if (warehouseIds.includes('all')) return 'همه انبارها';
    // در اینجا باید نام انبارها را از آرایه انبارها بگیریم
    return warehouseIds.map(id => `انبار ${id}`).join(', ');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            مدیریت سطوح دسترسی
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            تعریف و مدیریت سطوح دسترسی کاربران سیستم
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          افزودن کاربر جدید
        </Button>
      </Box>

      {/* Access Levels Overview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            سطوح دسترسی تعریف شده
          </Typography>
          <Grid container spacing={2}>
            {Object.values(ACCESS_LEVELS).map((level) => (
              <Grid item xs={12} md={6} lg={4} key={level.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SecurityIcon color={level.color} sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {level.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {level.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {level.permissions.length} مجوز
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            فهرست کاربران ({users.length} کاربر)
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>کاربر</TableCell>
                  <TableCell>سطح دسترسی</TableCell>
                  <TableCell>انبارهای اختصاصی</TableCell>
                  <TableCell>آخرین ورود</TableCell>
                  <TableCell align="center">وضعیت</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const levelInfo = getAccessLevelInfo(user.accessLevel);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: levelInfo.color + '.main' }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{user.username} • {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={levelInfo.name}
                          color={levelInfo.color}
                          size="small"
                          icon={<SecurityIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getWarehouseNames(user.assignedWarehouses)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.lastLogin}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={user.isActive}
                          onChange={() => handleToggleStatus(user.id)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="ویرایش">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {user.username !== 'superadmin' && (
                          <Tooltip title="حذف">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                اطلاعات پایه
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام کاربری"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={selectedUser?.username === 'superadmin'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام و نام خانوادگی"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ایمیل"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={selectedUser ? "رمز عبور جدید (اختیاری)" : "رمز عبور"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>

            {/* Access Level */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                سطح دسترسی
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>سطح دسترسی</InputLabel>
                <Select
                  value={formData.accessLevel}
                  onChange={(e) => handleAccessLevelChange(e.target.value)}
                  disabled={selectedUser?.username === 'superadmin'}
                >
                  {Object.values(ACCESS_LEVELS).map((level) => (
                    <MenuItem key={level.id} value={level.id}>
                      <Box display="flex" alignItems="center">
                        <SecurityIcon color={level.color} sx={{ mr: 1 }} />
                        {level.name} - {level.description}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Permissions */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    مجوزهای دسترسی ({formData.permissions.length} مجوز انتخاب شده)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {Object.entries(PERMISSIONS).map(([key, label]) => (
                      <Grid item xs={12} md={6} key={key}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permissions.includes(key)}
                              onChange={() => handlePermissionToggle(key)}
                            />
                          }
                          label={label}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="کاربر فعال"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>انصراف</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedUser ? 'ویرایش' : 'ایجاد کاربر'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccessLevelManagement;
