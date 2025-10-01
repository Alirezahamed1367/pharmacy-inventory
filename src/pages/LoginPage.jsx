import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
  LocalPharmacy,
} from '@mui/icons-material'
import { signIn, supabase } from '../services/supabase'

export default function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])

  // بارگذاری کاربران از دیتابیس
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username, full_name, role')
          .eq('is_active', true)
        
        if (error) {
          console.error('خطا در بارگذاری کاربران:', error)
          // اگر دیتابیس در دسترس نباشد، از کاربران دائمی استفاده کن
          setUsers([
            { username: 'superadmin', full_name: 'علیرضا حامد (توسعه دهنده)', role: 'super_admin' },
            { username: 'admin', full_name: 'مدیر سیستم', role: 'admin' }
          ])
        } else {
          setUsers(data || [])
        }
      } catch (err) {
        console.error('خطا در اتصال:', err)
        // در صورت عدم اتصال، از کاربران دائمی استفاده کن
        setUsers([
          { username: 'superadmin', full_name: 'علیرضا حامد (توسعه دهنده)', role: 'super_admin' },
          { username: 'admin', full_name: 'مدیر سیستم', role: 'admin' }
        ])
      }
    }

    fetchUsers()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // کاربران دائمی سیستم (غیر قابل تغییر)
      const permanentUsers = [
        { username: 'superadmin', password: 'A25893Aa', role: 'super_admin', full_name: 'علیرضا حامد (توسعه دهنده)' },
        { username: 'admin', password: 'password', role: 'admin', full_name: 'مدیر سیستم' }
      ]

      // بررسی اعتبار کاربر
      const user = permanentUsers.find(u => u.username === formData.username && u.password === formData.password)
      
      if (!user) {
        // اگر کاربر در لیست دائمی نبود، از دیتابیس بررسی کن
        const result = await signIn(formData.username, formData.password)
        if (result.error) {
          setError('نام کاربری یا رمز عبور اشتباه است')
          return
        }
        
        // ذخیره اطلاعات کاربر در localStorage
        localStorage.setItem('currentUser', JSON.stringify(result.user))
        localStorage.setItem('userRole', result.user.role)
        
        // اطلاع به App component
        onLogin(result.user)
      } else {
        // ورود کاربر دائمی
        const userInfo = {
          id: user.username === 'superadmin' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          is_permanent: true
        }
        
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
        localStorage.setItem('userRole', user.role)
        
        // اطلاع به App component
        onLogin(userInfo)
      }

    } catch (err) {
      setError('خطا در اتصال به سرور. لطفاً مجدداً تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              color: 'white',
              py: 4,
              textAlign: 'center',
            }}
          >
            <LocalPharmacy sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              سیستم انبارداری دارو
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              سامانه مدیریت هوشمند انبار دارویی
            </Typography>
          </Box>

          {/* Login Form */}
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth required>
                  <InputLabel>انتخاب کاربر</InputLabel>
                  <Select
                    name="username"
                    value={formData.username}
                    label="انتخاب کاربر"
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <AccountCircle color="primary" />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.username} value={user.username}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {user.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.username} - {user.role}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="رمز عبور"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                loading={loading}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  },
                  mb: 2
                }}
              >
                {loading ? 'در حال ورود...' : 'ورود به سیستم'}
              </Button>
            </form>
          </CardContent>

          {/* Footer */}
          <Box
            sx={{
              py: 2,
              px: 4,
              backgroundColor: '#f8f9fa',
              textAlign: 'center',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              طراحی و توسعه نرم‌افزار توسط علیرضا حامد - پاییز 1404
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
