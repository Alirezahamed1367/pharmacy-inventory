import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import rtlPlugin from 'stylis-plugin-rtl'
import { prefixer } from 'stylis'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'

// import { supabase } from './services/supabase' // غیرفعال برای تست محلی
import React, { Suspense, lazy } from 'react'
const LoginPage = lazy(()=> import('./pages/LoginPage'))
const Dashboard = lazy(()=> import('./pages/Dashboard'))
const DrugManagement = lazy(()=> import('./pages/DrugManagement'))
const ReceiptManagement = lazy(()=> import('./pages/ReceiptManagement'))
const Transfers = lazy(()=> import('./pages/Transfers'))
const WarehouseManagement = lazy(()=> import('./pages/WarehouseManagement'))
const Reports = lazy(()=> import('./pages/Reports'))
const Settings = lazy(()=> import('./pages/Settings'))
import Layout from './components/Layout'

// ایجاد cache برای RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})

// تم Material UI با پشتیبانی از RTL
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Vazirmatn, Arial, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { fontSize: 'clamp(1.9rem, 1.5rem + 1.2vw, 2.4rem)', fontWeight: 700 },
    h2: { fontSize: 'clamp(1.6rem, 1.3rem + 0.9vw, 2rem)', fontWeight: 600 },
    h3: { fontSize: 'clamp(1.3rem, 1.1rem + 0.6vw, 1.6rem)', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    body1: { fontSize: '.95rem', lineHeight: 1.7 },
    body2: { fontSize: '.83rem', lineHeight: 1.55 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '.3px'
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          transition: 'box-shadow .25s, transform .25s',
          '&:hover': {
            boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          }
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { direction: 'rtl', fontWeight: 500 }
      }
    }
  },
})

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // بررسی وضعیت احراز هویت کاربر
    const checkAuth = () => {
      // بررسی localStorage برای کاربر ورود کرده
      const savedUser = localStorage.getItem('currentUser')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch {
          // در صورت خطا در parsing، localStorage را پاک کن
          localStorage.removeItem('currentUser')
          localStorage.removeItem('userRole')
        }
      }
      setLoading(false)
    }

    checkAuth()

    // Listen for storage changes (برای logout در tabs دیگر)
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue))
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // تابع خروج
  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userRole')
    setUser(null)
  }

  if (loading) {
    return (
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            direction: 'rtl',
            fontFamily: 'Vazirmatn, Arial, sans-serif'
          }}>
            <div>در حال بارگذاری...</div>
          </div>
        </ThemeProvider>
      </CacheProvider>
    )
  }

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Router>
            <div dir="rtl">
              {!user ? (
                <Suspense fallback={<div style={{padding:40}}>در حال بارگذاری...</div>}><LoginPage onLogin={setUser} /></Suspense>
              ) : (
                <Layout onLogout={handleLogout}>
                  <Suspense fallback={<div style={{padding:40}}>در حال بارگذاری ماژول...</div>}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/drugs" element={<DrugManagement />} />
                      <Route path="/receipts" element={<ReceiptManagement />} />
                      <Route path="/warehouses" element={<WarehouseManagement />} />
                      <Route path="/transfers" element={<Transfers />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              )}
            </div>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default App
