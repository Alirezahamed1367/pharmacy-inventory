import React, { useState } from 'react'
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
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
  LocalPharmacy,
} from '@mui/icons-material'
import { signIn } from '../services/supabase'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      // بررسی سوپر ادمین
      if (formData.username === 'superadmin' && formData.password === 'A25893Aa') {
        // شبیه‌سازی ورود سوپر ادمین
        localStorage.setItem('user', JSON.stringify({
          username: 'superadmin',
          role: 'superadmin',
          name: 'سوپر ادمین'
        }))
        window.location.reload()
        return
      }

      // سایر کاربران (می‌توانید کاربران بیشتری اضافه کنید)
      const demoUsers = [
        { username: 'admin1', password: '123456', role: 'admin', name: 'مدیر کل' },
        { username: 'manager1', password: '123456', role: 'manager', name: 'مدیر انبار' },
        { username: 'operator1', password: '123456', role: 'operator', name: 'کارمند' }
      ]

      const foundUser = demoUsers.find(u => 
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
                <TextField
                  fullWidth
                  name="username"
                  label="نام کاربری"
                  value={formData.username}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle color="primary" />
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

            {/* Demo Info */}
            <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                اطلاعات ورود برای تست:
              </Typography>
              <Typography variant="body2" color="primary" align="center" fontWeight="bold">
                سوپر ادمین: superadmin / A25893Aa
              </Typography>
              <Typography variant="body2" color="primary" align="center" fontWeight="bold">
                مدیر: admin1 / 123456
              </Typography>
              <Typography variant="body2" color="primary" align="center" fontWeight="bold">
                کارمند: operator1 / 123456
              </Typography>
            </Box>
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
