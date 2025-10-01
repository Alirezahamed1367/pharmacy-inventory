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

export default function LoginPage() {
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
          .select('username, name, role')
          .eq('active', true)
        
        if (error) {
          console.error('خطا در بارگذاری کاربران:', error)
          // اگر دیتابیس در دسترس نباشد، از کاربران پیش‌فرض استفاده کن
          setUsers([
            { username: 'superadmin', name: 'سوپر ادمین', role: 'superadmin' },
            { username: 'admin1', name: 'مدیر کل', role: 'admin' },
            { username: 'manager1', name: 'مدیر انبار', role: 'manager' },
            { username: 'operator1', name: 'کارمند', role: 'operator' }
          ])
        } else {
          setUsers(data || [])
        }
      } catch (err) {
        console.error('خطا در اتصال:', err)
        // در صورت عدم اتصال، از کاربران پیش‌فرض استفاده کن
        setUsers([
          { username: 'superadmin', name: 'سوپر ادمین', role: 'superadmin' },
          { username: 'admin1', name: 'مدیر کل', role: 'admin' },
          { username: 'manager1', name: 'مدیر انبار', role: 'manager' },
          { username: 'operator1', name: 'کارمند', role: 'operator' }
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
      // بررسی رمزهای آپدیت شده از localStorage
      const savedPasswords = JSON.parse(localStorage.getItem('userPasswords') || '[]')
      
      // کاربران پیش‌فرض
      let defaultUsers = [
        { username: 'superadmin', password: 'A25893Aa', role: 'superadmin', name: 'سوپر ادمین' },
        { username: 'admin1', password: '123456', role: 'admin', name: 'مدیر کل' },
        { username: 'manager1', password: '123456', role: 'manager', name: 'مدیر انبار' },
        { username: 'operator1', password: '123456', role: 'operator', name: 'کارمند' }
      ]

      // اگر رمزهای آپدیت شده وجود دارد، آنها را جایگزین کن
      if (savedPasswords.length > 0) {
        defaultUsers = defaultUsers.map(defaultUser => {
          const updatedUser = savedPasswords.find(u => u.username === defaultUser.username)
          return updatedUser ? { ...defaultUser, password: updatedUser.password } : defaultUser
        })
      }

      const foundUser = defaultUsers.find(u => 
        u.username === formData.username && u.password === formData.password
      )

      if (foundUser) {
        localStorage.setItem('user', JSON.stringify({
          username: foundUser.username,
          role: foundUser.role,
          name: foundUser.name
        }))
        window.location.reload()
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است')
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
                            {user.name}
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

              {/* دکمه ورود سریع برای تست */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => {
                  setFormData({ username: 'superadmin', password: 'A25893Aa' })
                  setTimeout(() => {
                    handleSubmit({ preventDefault: () => {} })
                  }, 100)
                }}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderColor: '#42a5f5',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                ورود سریع (Super Admin)
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
