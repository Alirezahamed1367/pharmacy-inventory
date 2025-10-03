import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Medication as MedicationIcon,
  Warehouse as WarehouseIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { supabase, getInventoryDetailed, isBackendAvailable } from '../services/supabase'
import Skeleton from '@mui/material/Skeleton'
import dayjs from 'dayjs'
import 'dayjs/locale/fa'

dayjs.locale('fa')

export default function Dashboard() {
  const [data, setData] = useState({
    stats: { totalDrugs: 0, totalWarehouses: 0, expiringSoon: 0, expired: 0 },
    recentActivities: [],
    expiringDrugs: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isBackendAvailable()) {
      // داده نمایشی برای حالت آفلاین
      setData({
        stats: { totalDrugs: 0, totalWarehouses: 0, expiringSoon: 0, expired: 0 },
        recentActivities: [],
        expiringDrugs: []
      })
      setError(null)
      setLoading(false)
      return
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // تعداد کل داروها (هر واریانت یک ردیف)
      const { data: drugsData, error: drugsError } = await supabase
        .from('drugs')
        .select('id')
      if (drugsError) throw drugsError

      // تعداد کل انبارها
      const { data: warehousesData, error: warehousesError } = await supabase
        .from('warehouses')
        .select('id')
      if (warehousesError) throw warehousesError

      // موجودی تفصیلی جهت محاسبه وضعیت انقضا
      const inventoryDetailed = await getInventoryDetailed()
      if (inventoryDetailed.error) throw new Error(inventoryDetailed.error.message)
      const today = new Date()
      const classified = inventoryDetailed.data.map(row => {
        const expire = row.drug?.expire_date ? new Date(row.drug.expire_date) : null
        let diffDays = null
        let status = 'unknown'
        if (expire) {
          diffDays = Math.ceil((expire - today) / 86400000)
          if (diffDays < 0) status = 'expired'
          else if (diffDays <= 30) status = 'soon'
          else if (diffDays <= 90) status = 'mid'
          else status = 'healthy'
        }
        return { ...row, diffDays, status, drug_name: row.drug?.name }
      })
      const expiringSoon = classified.filter(r => r.status === 'soon')
      const expired = classified.filter(r => r.status === 'expired')

      // فعلاً فعالیت‌های اخیر: 5 آخرین رسید یا حواله (ساده‌سازی)
      const recent = []
      const { data: lastReceipts } = await supabase.from('receipts').select('id, created_at, status').order('created_at', { ascending: false }).limit(3)
      const { data: lastTransfers } = await supabase.from('transfers').select('id, created_at, status').order('created_at', { ascending: false }).limit(3)
      if (lastReceipts) lastReceipts.forEach(r => recent.push({ type: 'receipt', ...r }))
      if (lastTransfers) lastTransfers.forEach(t => recent.push({ type: 'transfer', ...t }))
      recent.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
      const recentActivities = recent.slice(0,5)

      setData({
        stats: {
          totalDrugs: drugsData?.length || 0,
          totalWarehouses: warehousesData?.length || 0,
          expiringSoon: expiringSoon.length,
          expired: expired.length
        },
        recentActivities,
        expiringDrugs: expiringSoon.slice(0,5)
      })

      setError(null)
    } catch (err) {
      console.error('خطا در دریافت داده‌های داشبورد:', err)
      setError('خطا در دریافت اطلاعات داشبورد')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-drug':
        navigate('/drugs')
        break
      case 'add-warehouse':
        navigate('/warehouses')
        break
      case 'transfer':
        navigate('/warehouses')
        break
      case 'reports':
        navigate('/reports')
        break
      default:
        break
    }
  }

  const StatCard = ({ title, value, icon, color = 'primary', trend = null }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color === 'warning' ? '#f57c00' : color === 'error' ? '#d32f2f' : '#388e3c'} 0%, ${color === 'primary' ? '#42a5f5' : color === 'warning' ? '#ffb74d' : color === 'error' ? '#f44336' : '#66bb6a'} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
              {title}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              width: 60,
              height: 60,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )

  const getActivityIcon = (type) => {
    switch (type) {
      case 'transfer':
        return <InventoryIcon color="primary" />
      case 'add':
        return <MedicationIcon color="success" />
      case 'warning':
        return <WarningIcon color="warning" />
      default:
        return <DashboardIcon color="primary" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'transfer':
        return 'primary'
      case 'add':
        return 'success'
      case 'warning':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ pt: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          داشبورد مدیریت
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          خوش آمدید! خلاصه‌ای از وضعیت کنونی سیستم انبارداری را مشاهده کنید.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Array.from({ length:4 }).map((_,i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}><Skeleton variant="rounded" height={400} /></Grid>
            <Grid item xs={12} md={6}><Skeleton variant="rounded" height={400} /></Grid>
          </Grid>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="کل داروها"
            value={data.stats.totalDrugs}
            icon={<MedicationIcon sx={{ fontSize: 30 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="کل انبارها"
            value={data.stats.totalWarehouses}
            icon={<WarehouseIcon sx={{ fontSize: 30 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="نزدیک به انقضا"
            value={data.stats.expiringSoon}
            icon={<AccessTimeIcon sx={{ fontSize: 30 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="منقضی شده"
            value={data.stats.expired}
            icon={<WarningIcon sx={{ fontSize: 30 }} />}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                فعالیت‌های اخیر
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {data.recentActivities.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">فعالیتی ثبت نشده است.</Typography>
                ) : (
                  data.recentActivities.map((activity) => (
                    <ListItem key={activity.id} alignItems="flex-start">
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" component="span">
                              {activity.message}
                            </Typography>
                            <Chip
                              size="small"
                              label={activity.type === 'transfer' ? 'انتقال' : activity.type === 'add' ? 'افزودن' : 'هشدار'}
                              color={getActivityColor(activity.type)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {activity.time} - {activity.user}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Expiring Drugs */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                داروهای نزدیک به انقضا
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {data.expiringDrugs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">داروی نزدیک به انقضا وجود ندارد.</Typography>
                ) : (
                  data.expiringDrugs.map((drug, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                          <WarningIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={drug.name}
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" display="block">
                              انبار: {drug.warehouse}
                            </Typography>
                            <Typography variant="caption" display="block">
                              تاریخ انقضا: {drug.expireDate}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${drug.quantity} عدد`}
                              color="primary"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="outlined" color="warning" size="small">
                  مشاهده همه
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                عملیات سریع
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<MedicationIcon />}
                  onClick={() => handleQuickAction('add-drug')}
                >
                  افزودن داروی جدید
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<WarehouseIcon />}
                  onClick={() => handleQuickAction('add-warehouse')}
                >
                  تعریف انبار جدید
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<InventoryIcon />}
                  onClick={() => handleQuickAction('transfer')}
                >
                  حواله انتقالی
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DashboardIcon />}
                  onClick={() => handleQuickAction('reports')}
                >
                  گزارش کامل
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
