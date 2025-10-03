import React, { useState, useEffect } from 'react'
import { Paper, Typography, Button, Alert, Box } from '@mui/material'
import { supabase } from '../services/supabase'

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('در حال بررسی...')
  const [dbStatus, setDbStatus] = useState('در حال بررسی...')
  const [storageStatus, setStorageStatus] = useState('در حال بررسی...')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    // تست اتصال اولیه
    if (!supabase) {
      setConnectionStatus('❌ خطا: متغیرهای محیطی تنظیم نشده')
      return
    }
    setConnectionStatus('✅ اتصال برقرار')

    // تست دیتابیس
    try {
      const { error: dbError } = await supabase.from('users').select('count').limit(1)
      if (dbError) setDbStatus(`❌ خطا در دیتابیس: ${dbError.message}`)
      else setDbStatus('✅ دیتابیس متصل')
    } catch (error) {
      setDbStatus(`❌ خطا: ${error.message}`)
    }

    // تست Storage
    try {
      const { error: stError } = await supabase.storage.from('drug-images').list('', { limit: 1 })
      if (stError) setStorageStatus(`❌ خطا در Storage: ${stError.message}`)
      else setStorageStatus('✅ Storage متصل')
    } catch (error) {
      setStorageStatus(`❌ خطا: ${error.message}`)
    }
  }

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" mb={2}>تست اتصال به Supabase</Typography>
      
      <Box mb={2}>
        <Typography><strong>اتصال کلی:</strong> {connectionStatus}</Typography>
      </Box>
      
      <Box mb={2}>
        <Typography><strong>دیتابیس:</strong> {dbStatus}</Typography>
      </Box>
      
      <Box mb={2}>
        <Typography><strong>Storage:</strong> {storageStatus}</Typography>
      </Box>

      <Button onClick={testConnection} variant="contained">
        تست مجدد
      </Button>

      <Alert severity="info" sx={{ mt: 2 }}>
        <strong>نکات مهم:</strong>
        <br />• اگر خطای "متغیرهای محیطی" دارید، فایل .env را بررسی کنید
        <br />• اگر خطای دیتابیس دارید، Schema را در Supabase اجرا کنید
        <br />• اگر خطای Storage دارید، bucket "drug-images" را ایجاد کنید
      </Alert>
    </Paper>
  )
}

export default SupabaseConnectionTest