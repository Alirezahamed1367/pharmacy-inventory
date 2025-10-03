import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Inventory as InventoryIcon,
  SwapHoriz as MovementIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { getInventoryDetailed, getWarehouses, getActiveDrugs, isBackendAvailable } from '../services/supabase'
import Skeleton from '@mui/material/Skeleton'

const Reports = () => {
  const [tabValue, setTabValue] = useState(0)
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  // statusFilter حذف شد (نیاز فعلی ندارد)
  const [drugFilter, setDrugFilter] = useState('')
  const [selectedDrugForWarehouse, setSelectedDrugForWarehouse] = useState('')
  const [inventory, setInventory] = useState([])
  const [expired, setExpired] = useState([])
  const [expiringSoon, setExpiringSoon] = useState([])
  const [expiringMid, setExpiringMid] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [drugs, setDrugs] = useState([])
  // const [movements, setMovements] = useState([]) // حرکت داروها - فعلاً غیرفعال
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // دریافت داده‌ها از دیتابیس
  useEffect(() => {
    if (!isBackendAvailable()) {
      setLoading(false)
      setError(null)
      return
    }
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    setLoading(true)
    try {
      const [inventoryResult, warehousesResult, drugsResult] = await Promise.all([
        getInventoryDetailed(),
        getWarehouses(),
        getActiveDrugs()
      ])
      if (inventoryResult.error) throw new Error(inventoryResult.error.message)
      if (warehousesResult.error) throw new Error(warehousesResult.error.message)
      if (drugsResult.error) throw new Error(drugsResult.error.message)

      const inventoryData = (inventoryResult.data || []).map(item => ({
        ...item,
        drug_name: item.drug?.name,
        expire_date: item.drug?.expire_date,
        package_type: item.drug?.package_type,
        warehouse_name: item.warehouse?.name,
        image_url: item.drug?.image_url
      }))
      setInventory(inventoryData)
      setWarehouses(warehousesResult.data || [])
      setDrugs(drugsResult.data || [])

      // محاسبه وضعیت انقضا
      const today = new Date()
      const expiredList = []
      const expiringSoonList = []
      const expiringMidList = []
      for (const item of inventoryData) {
        if (!item.expire_date) continue
        const expiryDate = new Date(item.expire_date)
        const diffTime = expiryDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays < 0) {
          expiredList.push({ ...item, diffDays })
        } else if (diffDays <= 30) {
          expiringSoonList.push({ ...item, diffDays })
        } else if (diffDays <= 90) {
          expiringMidList.push({ ...item, diffDays })
        }
      }
      setExpired(expiredList)
      setExpiringSoon(expiringSoonList)
      setExpiringMid(expiringMidList)
      setError(null)
    } catch (error) {
      console.error('خطا در دریافت گزارشات:', error)
      setError(isBackendAvailable() ? ('خطا در دریافت گزارشات: ' + error.message) : 'اتصال به سرور برقرار نیست (حالت آفلاین)')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleExport = (format) => {
  // خروجی گزارش برای export (در نسخه ساده فعلی فقط اعلان نمایشی)
    
    if (format === 'excel') {
      // شبیه‌سازی دانلود اکسل
      const fileName = `گزارش_موجودی_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '_')}.xlsx`
      alert(`فایل ${fileName} آماده دانلود است`)
    } else {
      alert(`گزارش در قالب ${format} آماده شد!`)
    }
  }

  const getFilteredInventory = () => {
    return inventory.filter(item => {
      const matchesWarehouse = !selectedWarehouse || item.warehouse_name?.includes(selectedWarehouse)
      const matchesDrug = !drugFilter || item.drug_name?.toLowerCase().includes(drugFilter.toLowerCase())
      return matchesWarehouse && matchesDrug
    })
  }

  // گزارش حرکات غیرفعال شده؛ تابع فیلتر حذف شد

  // گزارش موجودی یک دارو در تمام انبارها
  const getDrugWarehouseReport = () => {
    if (!selectedDrugForWarehouse) return []
    return inventory
      .filter(item => item.drug_name === selectedDrugForWarehouse)
      .sort((a, b) => a.warehouse_name?.localeCompare(b.warehouse_name, 'fa'))
  }

  // لیست نام داروهای موجود
  const getAvailableDrugs = () => {
    return drugs.sort((a, b) => a.name?.localeCompare(b.name, 'fa'))
  }

  // status color/text توابع legacy حذف شدند

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  if (loading) {
    return (
      <Box p={3}>
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_,i) => (
            <Grid item xs={12} md={4} key={i}><Skeleton variant="rounded" height={160} /></Grid>
          ))}
          <Grid item xs={12}><Skeleton variant="rounded" height={420} /></Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      {!isBackendAvailable() && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          سیستم در حالت آفلاین اجرا شده است؛ برای مشاهده داده‌ها متغیرهای اتصال Supabase را تنظیم کنید.
        </Alert>
      )}
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          گزارشات و آمار
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          گزارشات تفصیلی از وضعیت داروها، انبارها و گردش موجودی
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            فیلترها و تنظیمات گزارش
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>انبار</InputLabel>
                <Select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  label="انبار"
                >
                  <MenuItem value="">همه انبارها</MenuItem>
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.name}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="جستجوی دارو"
                value={drugFilter}
                onChange={(e) => setDrugFilter(e.target.value)}
                placeholder="نام دارو را وارد کنید"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={fetchReportsData}
                startIcon={<RefreshIcon />}
                fullWidth
              >
                بروزرسانی
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={() => handleExport('excel')}
                startIcon={<DownloadIcon />}
                fullWidth
              >
                خروجی اکسل
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<InventoryIcon />} label="گزارش موجودی" />
            <Tab icon={<MovementIcon />} label="گزارش حرکات" />
            <Tab icon={<WarningIcon />} label="داروهای منقضی" />
            <Tab icon={<ReportIcon />} label="گزارش انبارها" />
          </Tabs>
        </Box>

        {/* گزارش موجودی */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام دارو</TableCell>
                  <TableCell>انبار</TableCell>
                  <TableCell>موجودی</TableCell>
                  <TableCell>تاریخ انقضا</TableCell>
                  <TableCell>وضعیت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredInventory().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug_name}</TableCell>
                    <TableCell>{item.warehouse_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('fa-IR') : 'نامشخص'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="فعال" 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* گزارش حرکات */}
        <TabPanel value={tabValue} index={1}>
          {movements.length === 0 ? (
            <Alert severity="info">حرکتی ثبت نشده است.</Alert>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>نوع</TableCell>
                    <TableCell>کد</TableCell>
                    <TableCell>تاریخ سند</TableCell>
                    <TableCell>تاریخ ایجاد</TableCell>
                    <TableCell>وضعیت</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map(m => (
                    <TableRow key={m.type+"-"+m.id}>
                      <TableCell>{m.type==='receipt'?'رسید':'حواله'}</TableCell>
                      <TableCell>{m.id.slice(0,8)}</TableCell>
                      <TableCell>{m.document_date ? new Date(m.document_date).toLocaleDateString('fa-IR') : '-'}</TableCell>
                      <TableCell>{new Date(m.created_at).toLocaleDateString('fa-IR')}</TableCell>
                      <TableCell>{m.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* داروهای منقضی */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>داروهای منقضی</Typography>
          <TableContainer sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام دارو</TableCell>
                  <TableCell>انبار</TableCell>
                  <TableCell>موجودی</TableCell>
                  <TableCell>تاریخ انقضا</TableCell>
                  <TableCell>روزهای منقضی</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expired.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug_name}</TableCell>
                    <TableCell>{item.warehouse_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.expire_date ? new Date(item.expire_date).toLocaleDateString('fa-IR') : 'نامشخص'}</TableCell>
                    <TableCell>
                      <Chip label={`${Math.abs(item.diffDays)}-`} color="error" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h6" sx={{ mb: 2 }}>داروهای در آستانه انقضا (تا ۳۰ روز آینده)</Typography>
          <TableContainer sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام دارو</TableCell>
                  <TableCell>انبار</TableCell>
                  <TableCell>موجودی</TableCell>
                  <TableCell>تاریخ انقضا</TableCell>
                  <TableCell>روزهای باقی‌مانده</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiringSoon.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug_name}</TableCell>
                    <TableCell>{item.warehouse_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.expire_date ? new Date(item.expire_date).toLocaleDateString('fa-IR') : 'نامشخص'}</TableCell>
                    <TableCell>
                      <Chip label={`${item.diffDays} روز`} color="error" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h6" sx={{ mb: 2 }}>داروهای در آستانه انقضا (۳۱ تا ۹۰ روز آینده)</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام دارو</TableCell>
                  <TableCell>انبار</TableCell>
                  <TableCell>موجودی</TableCell>
                  <TableCell>تاریخ انقضا</TableCell>
                  <TableCell>روزهای باقی‌مانده</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiringMid.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug_name}</TableCell>
                    <TableCell>{item.warehouse_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.expire_date ? new Date(item.expire_date).toLocaleDateString('fa-IR') : 'نامشخص'}</TableCell>
                    <TableCell>
                      <Chip label={`${item.diffDays} روز`} color="warning" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* گزارش انبارها */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>انتخاب دارو</InputLabel>
                <Select
                  value={selectedDrugForWarehouse}
                  onChange={(e) => setSelectedDrugForWarehouse(e.target.value)}
                  label="انتخاب دارو"
                >
                  <MenuItem value="">انتخاب کنید</MenuItem>
                  {getAvailableDrugs().map((drug) => (
                    <MenuItem key={drug.id} value={drug.name}>
                      {drug.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>انبار</TableCell>
                  <TableCell>موجودی</TableCell>
                  <TableCell>تاریخ انقضا</TableCell>
                  <TableCell>وضعیت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getDrugWarehouseReport().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.warehouse_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('fa-IR') : 'نامشخص'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="فعال" 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          طراحی و توسعه نرم‌افزار توسط علیرضا حامد در پاییز 1404
        </Typography>
      </Box>
    </Box>
  )
}

export default Reports