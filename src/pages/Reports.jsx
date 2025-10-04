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
import { getInventoryDetailed, getWarehouses, getActiveDrugs, isBackendAvailable, getExpiryReport } from '../services/supabase'
import Skeleton from '@mui/material/Skeleton'
import ExpiryChip from '../components/ExpiryChip'

const Reports = () => {
  const [tabValue, setTabValue] = useState(0)
  const [matrix, setMatrix] = useState({ rows: [], columns: [], data: {} })
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  // statusFilter حذف شد (نیاز فعلی ندارد)
  const [drugFilter, setDrugFilter] = useState('')
  const [selectedDrugForWarehouse, setSelectedDrugForWarehouse] = useState('')
  const [inventory, setInventory] = useState([])
  const [expiryLots, setExpiryLots] = useState([])
  const [expired, setExpired] = useState([])
  const [expiringSoon, setExpiringSoon] = useState([])
  const [expiringMid, setExpiringMid] = useState([])
  const computeTotals = () => {
    const totalQty = inventory.reduce((sum,i)=> sum + (i.quantity||0),0)
    const expiredQty = expired.reduce((sum,i)=> sum + (i.quantity||0),0)
    const imminentQty = expiringSoon.reduce((sum,i)=> sum + (i.quantity||0),0)
    const midQty = expiringMid.reduce((sum,i)=> sum + (i.quantity||0),0)
    const safeQty = totalQty - expiredQty - imminentQty - midQty
    return { totalQty, expiredQty, imminentQty, midQty, safeQty }
  }
  const [warehouses, setWarehouses] = useState([])
  const [drugs, setDrugs] = useState([])
  const [movements] = useState([]) // حرکات فعلا از view جداگانه خوانده نمی‌شود
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
      const [inventoryResult, warehousesResult, drugsResult, expiryReportRes] = await Promise.all([
        getInventoryDetailed(),
        getWarehouses(),
        getActiveDrugs(),
        getExpiryReport()
      ])
      if (inventoryResult.error) throw new Error(inventoryResult.error.message)
      if (warehousesResult.error) throw new Error(warehousesResult.error.message)
      if (drugsResult.error) throw new Error(drugsResult.error.message)
      if (expiryReportRes.error) throw new Error(expiryReportRes.error.message)

      const inventoryData = (inventoryResult.data || []).map(item => ({
        ...item,
        drug_name: item.drug?.name,
  // تاریخ انقضا فقط از lot پس از حذف ستون drug.expire_date
  expire_date: item.lot?.expire_date || null,
        lot_number: item.lot?.lot_number || null,
        package_type: item.drug?.package_type,
        warehouse_name: item.warehouse?.name,
        image_url: item.drug?.image_url
      }))
  setInventory(inventoryData)
      setExpiryLots(expiryReportRes.data || [])
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
      // ساخت ماتریس انبار × دارو (جمع موجودی)
      const uniqueDrugs = Array.from(new Set(inventoryData.map(i=> i.drug_name))).filter(Boolean).sort((a,b)=>a.localeCompare(b,'fa'))
      const uniqueWarehouses = Array.from(new Set(inventoryData.map(i=> i.warehouse_name))).filter(Boolean).sort((a,b)=>a.localeCompare(b,'fa'))
      const matrixData = {}
      for (const d of uniqueDrugs) {
        for (const w of uniqueWarehouses) {
          const sum = inventoryData.filter(x=> x.drug_name===d && x.warehouse_name===w).reduce((s,x)=> s + (x.quantity||0),0)
          if (!matrixData[d]) matrixData[d] = {}
            matrixData[d][w] = sum
        }
      }
      setMatrix({ rows: uniqueDrugs, columns: uniqueWarehouses, data: matrixData })
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

      {/* KPI Cards */}
      {!loading && !error && (
        <Grid container spacing={2} sx={{ mb:3 }}>
          {(() => { const k = computeTotals(); const pct = v => k.totalQty? ((v/k.totalQty)*100).toFixed(1):'0.0'; return (
            <>
              <Grid item xs={12} md={2}><Card><CardContent><Typography variant='subtitle2'>کل موجودی</Typography><Typography variant='h5'>{k.totalQty}</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={2}><Card><CardContent><Typography variant='subtitle2'>منقضی</Typography><Typography color='error' variant='h5'>{k.expiredQty}</Typography><Typography variant='caption'>{pct(k.expiredQty)}%</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={2}><Card><CardContent><Typography variant='subtitle2'>تا 30 روز</Typography><Typography color='warning.main' variant='h5'>{k.imminentQty}</Typography><Typography variant='caption'>{pct(k.imminentQty)}%</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={2}><Card><CardContent><Typography variant='subtitle2'>31-90 روز</Typography><Typography color='secondary' variant='h5'>{k.midQty}</Typography><Typography variant='caption'>{pct(k.midQty)}%</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={2}><Card><CardContent><Typography variant='subtitle2'>ایمن</Typography><Typography color='success.main' variant='h5'>{k.safeQty}</Typography><Typography variant='caption'>{pct(k.safeQty)}%</Typography></CardContent></Card></Grid>
            </>
          )})()}
        </Grid>
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
            <Tab icon={<ReportIcon />} label="ماتریس انبار × دارو" />
            <Tab icon={<WarningIcon />} label="تجمیع انقضا (لات)" />
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
                      {item.expire_date ? new Date(item.expire_date).toLocaleDateString('fa-IR') : 'نامشخص'}
                    </TableCell>
                    <TableCell><ExpiryChip date={item.expire_date} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* ماتریس انبار × دارو */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant='h6' sx={{ mb:2 }}>ماتریس تجمعی موجودی (جمع تعداد بر اساس دارو و انبار)</Typography>
          <TableContainer component={Paper}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight:'bold' }}>دارو \ انبار</TableCell>
                  {matrix.columns.map(col=> <TableCell key={col} sx={{ fontWeight:'bold' }}>{col}</TableCell>)}
                  <TableCell sx={{ fontWeight:'bold' }}>جمع دارو</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matrix.rows.map(drugName => {
                  const rowData = matrix.data[drugName] || {}
                  const rowSum = matrix.columns.reduce((s,c)=> s + (rowData[c]||0),0)
                  return (
                    <TableRow key={drugName}>
                      <TableCell>{drugName}</TableCell>
                      {matrix.columns.map(c=> <TableCell key={c}>{rowData[c]||0}</TableCell>)}
                      <TableCell sx={{ fontWeight:'bold' }}>{rowSum}</TableCell>
                    </TableRow>
                  )
                })}
                {matrix.rows.length===0 && (
                  <TableRow><TableCell colSpan={matrix.columns.length + 2} align='center'>داده‌ای وجود ندارد</TableCell></TableRow>
                )}
                {/* Footer total per warehouse */}
                {matrix.rows.length>0 && (
                  <TableRow>
                    <TableCell sx={{ fontWeight:'bold' }}>جمع انبار</TableCell>
                    {matrix.columns.map(c=> {
                      const sum = matrix.rows.reduce((s,r)=> s + ((matrix.data[r]||{})[c]||0),0)
                      return <TableCell key={c} sx={{ fontWeight:'bold' }}>{sum}</TableCell>
                    })}
                    <TableCell sx={{ fontWeight:'bold' }}>{matrix.rows.reduce((s,r)=> s + matrix.columns.reduce((ss,c)=> ss + ((matrix.data[r]||{})[c]||0),0),0)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* گزارش تجمیعی انقضا بر اساس لات */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant='h6' sx={{ mb:2 }}>گزارش تجمیعی انقضا (سطح لات)</Typography>
          <Alert severity='info' sx={{ mb:2 }}>این گزارش بر اساس مجموع مقادیر هر لات (دارو + تاریخ انقضا + شماره بچ) محاسبه شده است.</Alert>
          <TableContainer component={Paper}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>نام دارو</TableCell>
                  <TableCell>نوع بسته بندی</TableCell>
                  <TableCell>تاریخ انقضا</TableCell>
                  <TableCell>شماره بچ</TableCell>
                  <TableCell>موجودی کل</TableCell>
                  <TableCell>روز تا انقضا</TableCell>
                  <TableCell>وضعیت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiryLots.map((lot,idx)=>{
                  const today = new Date(); const exp = lot.expire_date ? new Date(lot.expire_date) : null
                  const diffDays = exp ? Math.ceil((exp - today)/(1000*60*60*24)) : null
                  return (
                    <TableRow key={idx}>
                      <TableCell>{lot.drug_name}</TableCell>
                      <TableCell>{lot.package_type || '-'}</TableCell>
                      <TableCell>{lot.expire_date ? new Date(lot.expire_date).toLocaleDateString('fa-IR') : '-'}</TableCell>
                      <TableCell>{lot.lot_number || '-'}</TableCell>
                      <TableCell>{lot.total_quantity}</TableCell>
                      <TableCell>{diffDays!==null ? (diffDays>=0? diffDays + ' روز' : Math.abs(diffDays)+'-') : '-'}</TableCell>
                      <TableCell><ExpiryChip date={lot.expire_date} /></TableCell>
                    </TableRow>
                  )
                })}
                {expiryLots.length===0 && <TableRow><TableCell colSpan={7} align='center'>داده‌ای وجود ندارد</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* گزارش حرکات */}
        <TabPanel value={tabValue} index={1}>
          <Alert severity="info">گزارش حرکات در نسخه فعلی غیرفعال است.</Alert>
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
                  <TableCell>وضعیت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expired.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug_name}</TableCell>
                    <TableCell>{item.warehouse_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.expire_date ? new Date(item.expire_date).toLocaleDateString('fa-IR') : 'نامشخص'}</TableCell>
                    <TableCell><Chip label={`${Math.abs(item.diffDays)}-`} color="error" size="small" /></TableCell>
                    <TableCell><ExpiryChip date={item.expire_date} /></TableCell>
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
                  <TableCell>وضعیت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiringSoon.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug_name}</TableCell>
                    <TableCell>{item.warehouse_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.expire_date ? new Date(item.expire_date).toLocaleDateString('fa-IR') : 'نامشخص'}</TableCell>
                    <TableCell><Chip label={`${item.diffDays} روز`} color="error" size="small" /></TableCell>
                    <TableCell><ExpiryChip date={item.expire_date} /></TableCell>
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
                  <TableCell>وضعیت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiringMid.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug_name}</TableCell>
                    <TableCell>{item.warehouse_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.expire_date ? new Date(item.expire_date).toLocaleDateString('fa-IR') : 'نامشخص'}</TableCell>
                    <TableCell><Chip label={`${item.diffDays} روز`} color="warning" size="small" /></TableCell>
                    <TableCell><ExpiryChip date={item.expire_date} /></TableCell>
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
                      {item.expire_date ? new Date(item.expire_date).toLocaleDateString('fa-IR') : 'نامشخص'}
                    </TableCell>
                    <TableCell><ExpiryChip date={item.expire_date} /></TableCell>
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