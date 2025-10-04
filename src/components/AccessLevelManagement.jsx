import React, { useEffect, useState } from 'react';
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

import { PERMISSION_GROUPS, ALL_PERMISSIONS } from '../services/permissions';
import { accessControlAPI, supabase } from '../services/supabase';

// کاربران از دیتابیس Supabase دریافت می‌شوند

const AccessLevelManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [groupDialog, setGroupDialog] = useState(false);
  const [groupForm, setGroupForm] = useState({ id: null, name: '', code: '', description: '', permissions: [], warehouseIds: [] });
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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
        permissions: []
      });
    }
    setOpenDialog(true);
  };

  const loadGroups = async () => {
    setLoadingGroups(true)
    const { data } = await accessControlAPI.listGroups()
    setGroups(data || [])
    const { data: wh } = await supabase.from('warehouses').select('id,name')
    setWarehouses(wh || [])
    setLoadingGroups(false)
  }

  useEffect(() => {
    loadGroups()
  }, [])

  const openGroupCreate = () => {
    setGroupForm({ id: null, name: '', code: '', description: '', permissions: [], warehouseIds: [] })
    setGroupDialog(true)
  }
  const editGroup = (g) => {
    setGroupForm({ id: g.id, name: g.name, code: g.code, description: g.description || '', permissions: [], warehouseIds: [] })
    setGroupDialog(true)
  }
  const saveGroup = async () => {
    if (!groupForm.name || !groupForm.code) { setErrorMsg('نام و کد اجباری است'); return }
    if (groupForm.id) {
      await accessControlAPI.updateGroup(groupForm.id, { name: groupForm.name, description: groupForm.description, permissions: groupForm.permissions, warehouseIds: groupForm.warehouseIds })
    } else {
      await accessControlAPI.createGroup({ name: groupForm.name, code: groupForm.code, description: groupForm.description, permissions: groupForm.permissions, warehouseIds: groupForm.warehouseIds })
    }
    setGroupDialog(false)
    loadGroups()
  }
  const togglePermission = (perm) => {
    setGroupForm(f => ({ ...f, permissions: f.permissions.includes(perm) ? f.permissions.filter(p => p !== perm) : [...f.permissions, perm] }))
  }
  const toggleWarehouse = (wid) => {
    setGroupForm(f => ({ ...f, warehouseIds: f.warehouseIds.includes(wid) ? f.warehouseIds.filter(i => i !== wid) : [...f.warehouseIds, wid] }))
  }

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

      {/* Access Groups Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">گروه‌های دسترسی ({groups.length})</Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={openGroupCreate}>گروه جدید</Button>
          </Box>
          <Grid container spacing={2}>
            {groups.map(g => (
              <Grid item xs={12} md={6} lg={4} key={g.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight="bold">{g.name}</Typography>
                      <IconButton size="small" onClick={() => editGroup(g)}><EditIcon fontSize="small" /></IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{g.code}</Typography>
                    {g.description && <Typography variant="body2" sx={{ mt: 1 }}>{g.description}</Typography>}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {groups.length === 0 && (
              <Grid item xs={12}><Alert severity="info">گروهی ثبت نشده است.</Alert></Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>فهرست کاربران (نمونه محلی - اتصال واقعی بعداً)</Typography>
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
      <Dialog open={groupDialog} onClose={() => setGroupDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{groupForm.id ? 'ویرایش گروه' : 'گروه جدید'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField label="نام گروه" fullWidth value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} sx={{ mb: 2 }} />
              <TextField label="کد" fullWidth value={groupForm.code} onChange={e => setGroupForm({ ...groupForm, code: e.target.value })} sx={{ mb: 2 }} disabled={!!groupForm.id} />
              <TextField label="توضیحات" fullWidth multiline minRows={3} value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} />
              {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>مجوزها</Typography>
              {PERMISSION_GROUPS.map(pg => (
                <Box key={pg.key} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>{pg.label}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: .5, mt: .5 }}>
                    {pg.permissions.map(p => (
                      <Chip key={p.key} label={p.label} size="small" color={groupForm.permissions.includes(p.key) ? 'primary' : 'default'} onClick={() => togglePermission(p.key)} />
                    ))}
                  </Box>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>انبارهای مجاز</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: .5 }}>
                {warehouses.map(w => (
                  <Chip key={w.id} label={w.name} variant={groupForm.warehouseIds.includes(w.id) ? 'filled' : 'outlined'} color={groupForm.warehouseIds.includes(w.id) ? 'success' : 'default'} onClick={() => toggleWarehouse(w.id)} />
                ))}
                {warehouses.length === 0 && <Typography variant="caption">انبار ثبت نشده</Typography>}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupDialog(false)}>انصراف</Button>
          <Button onClick={saveGroup} variant="contained">ذخیره</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccessLevelManagement;
