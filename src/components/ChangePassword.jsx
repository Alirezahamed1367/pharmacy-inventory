import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Lock,
  Key,
  Security
} from '@mui/icons-material'
import { supabase } from '../services/supabase'

const ChangePassword = ({ open, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
    if (success) setSuccess(false)
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    })
  }

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('لطفاً همه فیلدها را پر کنید')
      return false
    }

    if (formData.newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد')
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('رمز عبور جدید و تکرار آن یکسان نیست')
      return false
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('رمز عبور جدید باید با رمز عبور فعلی متفاوت باشد')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      // بررسی رمز عبور فعلی از دیتابیس
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('password')
        .eq('id', currentUser.id)
        .single()

      if (userError || !userData) {
        setError('خطا در دریافت اطلاعات کاربر')
        setLoading(false)
        return
      }

      // بررسی رمز عبور فعلی (در پروژه واقعی باید از hashing استفاده کنید)
      if (userData.password !== formData.currentPassword) {
        setError('رمز عبور فعلی اشتباه است')
        setLoading(false)
        return
      }

      // به‌روزرسانی رمز عبور در دیتابیس
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: formData.newPassword })
        .eq('id', currentUser.id)

      if (updateError) {
        setError('خطا در تغییر رمز عبور: ' + updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // بستن دیالوگ پس از ۲ ثانیه
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)

    } catch (error) {
      setError('خطا در تغییر رمز عبور. لطفاً مجدداً تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setError('')
    setSuccess(false)
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Security color="primary" />
          <Typography variant="h6">تغییر رمز عبور</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit}>
          {/* اطلاعات کاربر */}
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                کاربر: <strong>{currentUser?.name || currentUser?.username}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                نقش: <strong>{currentUser?.role === 'superadmin' ? 'سوپر ادمین' : 
                              currentUser?.role === 'admin' ? 'مدیر' :
                              currentUser?.role === 'manager' ? 'مدیر انبار' : 'کارمند'}</strong>
              </Typography>
            </CardContent>
          </Card>

          {/* نمایش پیام‌ها */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              رمز عبور با موفقیت تغییر کرد!
            </Alert>
          )}

          {/* رمز عبور فعلی */}
          <TextField
            fullWidth
            name="currentPassword"
            type={showPasswords.current ? 'text' : 'password'}
            label="رمز عبور فعلی"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Divider sx={{ my: 2 }} />

          {/* رمز عبور جدید */}
          <TextField
            fullWidth
            name="newPassword"
            type={showPasswords.new ? 'text' : 'password'}
            label="رمز عبور جدید"
            value={formData.newPassword}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            helperText="حداقل ۶ کاراکتر"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Key color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* تکرار رمز عبور جدید */}
          <TextField
            fullWidth
            name="confirmPassword"
            type={showPasswords.confirm ? 'text' : 'password'}
            label="تکرار رمز عبور جدید"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Key color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
        >
          انصراف
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={<Security />}
        >
          {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChangePassword