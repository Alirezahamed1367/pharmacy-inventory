import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Switch, Alert, Avatar, Tooltip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { PERMISSION_GROUPS } from '../services/permissions';
import { accessControlAPI, supabase, listUsersWithGroups, createUserWithGroups, updateUserGroups } from '../services/supabase';

const AccessLevelManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [groupDialog, setGroupDialog] = useState(false);
  const [groupForm, setGroupForm] = useState({ id: null, name: '', code: '', description: '', permissions: [], warehouseIds: [] });
  const [errorMsg, setErrorMsg] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ id: null, username: '', name: '', password: '', isActive: true, groupIds: [] });

  const loadGroups = async () => {
    const { data } = await accessControlAPI.listGroups();
    setGroups(data || []);
    const { data: wh } = await supabase.from('warehouses').select('id,name');
    setWarehouses(wh || []);
  };
  const loadUsers = async () => {
    const { data } = await listUsersWithGroups();
    setUsers(data || []);
  };
  useEffect(() => { loadGroups(); loadUsers(); }, []);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({ id: user.id, username: user.username, name: user.full_name || user.username, password: '', isActive: user.is_active !== false, groupIds: (user.groups || []).map(g => g.id) });
    } else {
      setSelectedUser(null);
      setFormData({ id: null, username: '', name: '', password: '', isActive: true, groupIds: [] });
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => { setOpenDialog(false); setSelectedUser(null); setErrorMsg(''); };

  const openGroupCreate = () => { setGroupForm({ id: null, name: '', code: '', description: '', permissions: [], warehouseIds: [] }); setGroupDialog(true); };
  const editGroup = (g) => { setGroupForm({ id: g.id, name: g.name, code: g.code, description: g.description || '', permissions: [], warehouseIds: [] }); setGroupDialog(true); };

  const togglePermission = (perm) => setGroupForm(f => ({ ...f, permissions: f.permissions.includes(perm) ? f.permissions.filter(p => p !== perm) : [...f.permissions, perm] }));
  const toggleWarehouse = (wid) => setGroupForm(f => ({ ...f, warehouseIds: f.warehouseIds.includes(wid) ? f.warehouseIds.filter(i => i !== wid) : [...f.warehouseIds, wid] }));

  const saveGroup = async () => {
    if (!groupForm.name || !groupForm.code) { setErrorMsg('نام و کد اجباری است'); return }
    if (groupForm.id) {
      await accessControlAPI.updateGroup(groupForm.id, { name: groupForm.name, description: groupForm.description, permissions: groupForm.permissions, warehouseIds: groupForm.warehouseIds });
    } else {
      await accessControlAPI.createGroup({ name: groupForm.name, code: groupForm.code, description: groupForm.description, permissions: groupForm.permissions, warehouseIds: groupForm.warehouseIds });
    }
    setGroupDialog(false); setErrorMsg(''); loadGroups();
  };

  const handleSaveUser = () => {
    const persist = async () => {
      if (!formData.username) { setErrorMsg('نام کاربری الزامی است'); return }
      if (!selectedUser) {
        const { error } = await createUserWithGroups({ username: formData.username, full_name: formData.name, is_active: formData.isActive }, formData.password || '123456', formData.groupIds);
        if (error) { setErrorMsg(error.message); return }
      } else {
        await updateUserGroups(formData.id, formData.groupIds);
      }
      await loadUsers();
      handleCloseDialog();
    };
    persist();
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>مدیریت سطوح دسترسی</Typography>
          <Typography variant="subtitle1" color="text.secondary">تعریف و مدیریت گروه‌های دسترسی و کاربران</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>افزودن کاربر جدید</Button>
      </Box>

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
            {groups.length === 0 && <Grid item xs={12}><Alert severity="info">گروهی ثبت نشده است.</Alert></Grid>}
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>فهرست کاربران</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>کاربر</TableCell>
                  <TableCell>گروه‌ها</TableCell>
                  <TableCell align="center">وضعیت</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2 }}>{(u.full_name || u.username).charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">{u.full_name || u.username}</Typography>
                          <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{(u.groups || []).map(g => <Chip key={g.id} size="small" label={g.name} sx={{ mr: .5 }} />)}</TableCell>
                    <TableCell align="center"><Switch checked={u.is_active !== false} disabled /></TableCell>
                    <TableCell align="center">
                      <Tooltip title="ویرایش">
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(u)}><EditIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="نام کاربری" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} disabled={selectedUser?.username === 'superadmin'} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="نام و نام خانوادگی" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
            {!selectedUser && (
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="رمز عبور" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </Grid>
            )}
            <Grid item xs={12}>
              <Alert severity="info">گروه‌های دسترسی را انتخاب کنید. سطح دسترسی از اتحاد مجوزهای گروه‌ها بدست می‌آید.</Alert>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: .5 }}>
                {groups.map(g => (
                  <Chip key={g.id} label={g.name} color={formData.groupIds.includes(g.id) ? 'primary' : 'default'} onClick={() => setFormData(f => ({ ...f, groupIds: f.groupIds.includes(g.id) ? f.groupIds.filter(id => id !== g.id) : [...f.groupIds, g.id] }))} />
                ))}
                {groups.length === 0 && <Typography variant="caption">گروهی وجود ندارد</Typography>}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Switch checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} /> فعال
            </Grid>
            {errorMsg && <Grid item xs={12}><Alert severity="error">{errorMsg}</Alert></Grid>}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>انصراف</Button>
          <Button variant="contained" onClick={handleSaveUser}>{selectedUser ? 'ویرایش' : 'ایجاد کاربر'}</Button>
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
                {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}
