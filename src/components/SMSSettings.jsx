import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
  Snackbar,
  Divider,
  Chip
} from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import {
  Sms as SmsIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Check as CheckIcon
} from '@mui/icons-material'
import SMSService, { KavenegarSMS, GhasedakSMS, MelipayamakSMS, RahyabSMS, RahyabUserPassSMS } from '../services/smsService'

const SMSSettings = () => {
  const [smsConfig, setSmsConfig] = useState({
    provider: 'custom', // custom, kavenegar, ghasedak, melipayamak, rahyab, rahyab-userpass
    apiUrl: '',
    apiKey: '',
    username: '',
    password: '',
    senderNumber: '',
    adminPhone: '',
    enabled: false
  })

  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  // بارگذاری تنظیمات از localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('smsConfig')
    if (savedConfig) {
      setSmsConfig(JSON.parse(savedConfig))
    }
  }, [])

  // ذخیره تنظیمات
  const handleSave = () => {
    localStorage.setItem('smsConfig', JSON.stringify(smsConfig))
    
    // آپدیت environment variables
    window.process = { env: {} }
    process.env.VITE_SMS_API_URL = smsConfig.apiUrl
    process.env.VITE_SMS_API_KEY = smsConfig.apiKey
    process.env.VITE_SMS_USERNAME = smsConfig.username
    process.env.VITE_SMS_PASSWORD = smsConfig.password
    process.env.VITE_SMS_SENDER_NUMBER = smsConfig.senderNumber
    process.env.VITE_ADMIN_PHONE_NUMBER = smsConfig.adminPhone

    setSnackbar({ 
      open: true, 
      message: 'تنظیمات پیامک با موفقیت ذخیره شد', 
      severity: 'success' 
    })
  }

  // تست ارسال پیامک
  const handleTest = async () => {
    if (!smsConfig.adminPhone) {
      setSnackbar({ 
        open: true, 
        message: 'لطفاً شماره تلفن مدیر را وارد کنید', 
        severity: 'error' 
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      let smsService

      switch (smsConfig.provider) {
        case 'kavenegar':
          smsService = new KavenegarSMS()
          break
        case 'ghasedak':
          smsService = new GhasedakSMS()
          break
        case 'melipayamak':
          smsService = new MelipayamakSMS()
          break
        case 'rahyab':
          smsService = new RahyabSMS()
          break
        case 'rahyab-userpass':
          smsService = new RahyabUserPassSMS()
          break
        default:
          smsService = new SMSService()
      }

      // تنظیم مقادیر موقت
      smsService.apiUrl = smsConfig.apiUrl
      smsService.apiKey = smsConfig.apiKey
      smsService.username = smsConfig.username
      smsService.password = smsConfig.password
      smsService.senderNumber = smsConfig.senderNumber
      smsService.adminPhone = smsConfig.adminPhone

      const result = await smsService.testConnection()
      setTestResult(result)

      if (result.success) {
        setSnackbar({ 
          open: true, 
          message: 'پیامک تست با موفقیت ارسال شد', 
          severity: 'success' 
        })
      } else {
        setSnackbar({ 
          open: true, 
          message: `خطا در ارسال پیامک: ${result.error}`, 
          severity: 'error' 
        })
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message })
      setSnackbar({ 
        open: true, 
        message: `خطا در تست پیامک: ${error.message}`, 
        severity: 'error' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const providerConfigs = {
    kavenegar: {
      name: 'کاوه نگار',
      apiUrl: 'https://api.kavenegar.com/v1/{API_KEY}/sms/send.json',
      needsUsername: false,
      needsPassword: false
    },
    ghasedak: {
      name: 'قاصدک',
      apiUrl: 'https://api.ghasedak.me/v2/sms/send/simple',
      needsUsername: false,
      needsPassword: false
    },
    melipayamak: {
      name: 'ملی پیامک',
      apiUrl: 'https://rest.payamak-panel.com/api/SendSMS/SendSMS',
      needsUsername: true,
      needsPassword: true
    },
    rahyab: {
      name: 'رهیاب پیام گستران ایران (API Key)',
      apiUrl: 'https://api.rahyab-sms.ir/rest/sms/send',
      needsUsername: false,
      needsPassword: false
    },
    'rahyab-userpass': {
      name: 'رهیاب پیام گستران ایران (نام کاربری)',
      apiUrl: 'https://panel.rahyab-sms.ir/webservice/v1rest/sendsms',
      needsUsername: true,
      needsPassword: true
    },
    custom: {
      name: 'سفارشی',
      apiUrl: '',
      needsUsername: true,
      needsPassword: true
    }
  }

  const currentProviderConfig = providerConfigs[smsConfig.provider]

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <SmsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">تنظیمات سیستم پیامک</Typography>
          </Box>

          <Grid container spacing={3}>
            {/* انتخاب ارائه‌دهنده */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>ارائه‌دهنده پیامک</InputLabel>
                <Select
                  value={smsConfig.provider}
                  label="ارائه‌دهنده پیامک"
                  onChange={(e) => setSmsConfig({
                    ...smsConfig,
                    provider: e.target.value,
                    apiUrl: providerConfigs[e.target.value].apiUrl
                  })}
                >
                  {Object.entries(providerConfigs).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      {config.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* فعال/غیرفعال کردن */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={smsConfig.enabled}
                    onChange={(e) => setSmsConfig({...smsConfig, enabled: e.target.checked})}
                  />
                }
                label="فعال‌سازی ارسال پیامک"
              />
            </Grid>

            {/* API URL */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="آدرس API"
                value={smsConfig.apiUrl}
                onChange={(e) => setSmsConfig({...smsConfig, apiUrl: e.target.value})}
                disabled={smsConfig.provider !== 'custom'}
                helperText={smsConfig.provider !== 'custom' ? 'آدرس API بر اساس ارائه‌دهنده انتخابی تنظیم می‌شود' : ''}
              />
            </Grid>

            {/* API Key */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Key"
                value={smsConfig.apiKey}
                onChange={(e) => setSmsConfig({...smsConfig, apiKey: e.target.value})}
                type="password"
              />
            </Grid>

            {/* شماره فرستنده */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="شماره فرستنده"
                value={smsConfig.senderNumber}
                onChange={(e) => setSmsConfig({...smsConfig, senderNumber: e.target.value})}
                placeholder="10004346"
              />
            </Grid>

            {/* نام کاربری و رمز عبور */}
            {currentProviderConfig.needsUsername && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="نام کاربری"
                    value={smsConfig.username}
                    onChange={(e) => setSmsConfig({...smsConfig, username: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="رمز عبور"
                    value={smsConfig.password}
                    onChange={(e) => setSmsConfig({...smsConfig, password: e.target.value})}
                    type="password"
                  />
                </Grid>
              </>
            )}

            {/* شماره مدیر */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="شماره تلفن مدیر"
                value={smsConfig.adminPhone}
                onChange={(e) => setSmsConfig({...smsConfig, adminPhone: e.target.value})}
                placeholder="09123456789"
                helperText="شماره‌ای که پیامک‌های اطلاع‌رسانی به آن ارسال می‌شود"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* دکمه‌های عملیات */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={handleSave}
            >
              ذخیره تنظیمات
            </Button>

            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              onClick={handleTest}
              disabled={isLoading || !smsConfig.adminPhone}
            >
              {isLoading ? 'در حال ارسال...' : 'تست ارسال پیامک'}
            </Button>
          </Box>

          {/* نتیجه تست */}
          {testResult && (
            <Box mt={2}>
              <Alert 
                severity={testResult.success ? 'success' : 'error'}
                icon={testResult.success ? <CheckIcon /> : undefined}
              >
                {testResult.success ? 
                  'پیامک تست با موفقیت ارسال شد' : 
                  `خطا در ارسال پیامک: ${testResult.error}`
                }
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* راهنمای تنظیمات */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            راهنمای تنظیمات
          </Typography>
          
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              ارائه‌دهندگان پشتیبانی‌شده:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label="کاوه نگار" size="small" />
              <Chip label="قاصدک" size="small" />
              <Chip label="ملی پیامک" size="small" />
              <Chip label="رهیاب پیام گستران" size="small" color="primary" />
              <Chip label="سفارشی" size="small" />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary">
            • پس از انتخاب ارائه‌دهنده، API Key و سایر اطلاعات مورد نیاز را از پنل خود دریافت کنید
            <br />
            • برای تست اتصال، شماره تلفن مدیر را وارد کرده و روی "تست ارسال پیامک" کلیک کنید
            <br />
            • پیامک‌ها در موارد زیر ارسال می‌شوند: ثبت دارو جدید، کمبود موجودی، داروهای منقضی‌شده، انتقالات
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <MuiAlert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default SMSSettings