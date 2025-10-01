import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material'
import * as XLSX from 'xlsx'
import {
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  Inventory as InventoryIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material'

// داده‌های نمونه برای گزارشات
const sampleReports = {
  inventory: [
    { drug: 'آسپرین', warehouse: 'انبار مرکزی', quantity: 100, expireDate: '1404/08/15', status: 'active' },
    { drug: 'ایبوپروفن', warehouse: 'انبار شعبه شرق', quantity: 75, expireDate: '1404/06/20', status: 'expiring' },
    { drug: 'پنی‌سیلین', warehouse: 'انبار شعبه غرب', quantity: 25, expireDate: '1404/05/10', status: 'expired' },
    { drug: 'آسپرین', warehouse: 'انبار شعبه شرق', quantity: 50, expireDate: '1404/09/10', status: 'active' },
    { drug: 'آسپرین', warehouse: 'انبار شعبه غرب', quantity: 30, expireDate: '1404/07/20', status: 'expiring' },
    { drug: 'ایبوپروفن', warehouse: 'انبار مرکزی', quantity: 40, expireDate: '1404/10/15', status: 'active' },
    { drug: 'پنی‌سیلین', warehouse: 'انبار شعبه شمال', quantity: 60, expireDate: '1404/11/05', status: 'active' },
  ],
  movements: [
    {
      id: 1,
      drug: 'آسپرین',
      fromWarehouse: 'انبار مرکزی',
      toWarehouse: 'انبار شعبه شرق',
      quantity: 50,
      date: '1404/07/01',
      user: 'علی احمدی',
      status: 'completed'
    },
    {
      id: 2,
      drug: 'ایبوپروفن',
      fromWarehouse: 'انبار شعبه شمال',
      toWarehouse: 'انبار مرکزی',
      quantity: 30,
      date: '1404/07/02',
      user: 'فاطمه محمدی',
      status: 'in_transit'
    },
  ],
  expiring: [
    { drug: 'پنی‌سیلین', warehouse: 'انبار مرکزی', quantity: 50, expireDate: '1404/07/10', daysLeft: 5 },
    { drug: 'آموکسی‌سیلین', warehouse: 'انبار شعبه غرب', quantity: 30, expireDate: '1404/07/15', daysLeft: 10 },
    { drug: 'سیپروفلوکساسین', warehouse: 'انبار شعبه شمال', quantity: 25, expireDate: '1404/07/20', daysLeft: 15 },
  ]
}

export default function Reports() {
  const [tabValue, setTabValue] = useState(0)
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [reportType, setReportType] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drugFilter, setDrugFilter] = useState('')
  const [selectedDrugForWarehouse, setSelectedDrugForWarehouse] = useState('')

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleExport = (format) => {
    const filteredData = getFilteredInventory()
    
    if (format === 'excel') {
      // تبدیل داده‌ها به فرمت اکسل
      const excelData = filteredData.map(item => ({
        'نام دارو': item.drug,
        'انبار': item.warehouse,
        'موجودی': item.quantity,
        'وضعیت': getStatusText(item.status),
        'تاریخ انقضا': item.expiry || 'نامشخص'
      }))

      // ایجاد workbook
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'گزارش موجودی')

      // تنظیم عرض ستون‌ها
      const colWidths = [
        { wch: 25 }, // نام دارو
        { wch: 20 }, // انبار
        { wch: 10 }, // موجودی
        { wch: 15 }, // وضعیت
        { wch: 15 }  // تاریخ انقضا
      ]
      ws['!cols'] = colWidths

      // دانلود فایل
      const fileName = `گزارش_موجودی_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '_')}.xlsx`
      XLSX.writeFile(wb, fileName)
    } else {
      alert(`گزارش در قالب ${format} آماده شد!`)
    }
  }

  const getFilteredInventory = () => {
    return sampleReports.inventory.filter(item => {
      const matchesWarehouse = !selectedWarehouse || item.warehouse.includes(selectedWarehouse)
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesDrug = !drugFilter || item.drug.toLowerCase().includes(drugFilter.toLowerCase())
      
      return matchesWarehouse && matchesStatus && matchesDrug
    })
  }

  const getFilteredMovements = () => {
    return sampleReports.movements.filter(item => {
      const matchesWarehouse = !selectedWarehouse || 
        item.fromWarehouse.includes(selectedWarehouse) || 
        item.toWarehouse.includes(selectedWarehouse)
      const matchesDrug = !drugFilter || item.drug.toLowerCase().includes(drugFilter.toLowerCase())
      
      return matchesWarehouse && matchesDrug
    })
  }

  // گزارش موجودی یک دارو در تمام انبارها
  const getDrugInventoryAcrossWarehouses = () => {
    if (!selectedDrugForWarehouse) return []
    
    return sampleReports.inventory
      .filter(item => item.drug === selectedDrugForWarehouse)
      .sort((a, b) => a.warehouse.localeCompare(b.warehouse, 'fa'))
  }

  // لیست نام داروهای موجود
  const getAvailableDrugs = () => {
    const drugs = [...new Set(sampleReports.inventory.map(item => item.drug))]
    return drugs.sort((a, b) => a.localeCompare(b, 'fa'))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'expiring': return 'warning'
      case 'expired': return 'error'
      case 'completed': return 'success'
      case 'in_transit': return 'info'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'فعال'
      case 'expiring': return 'نزدیک به انقضا'
      case 'expired': return 'منقضی شده'
      case 'completed': return 'تکمیل شده'
      case 'in_transit': return 'در راه'
      default: return 'نامشخص'
    }
  }

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          گزارشات و آمار
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          گزارشات تفصیلی از وضعیت داروها، انبارها و گردش موجودی
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            فیلترها و تنظیمات گزارش
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="از تاریخ"
                placeholder="1404/01/01"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="تا تاریخ"
                placeholder="1404/12/29"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>انبار</InputLabel>
                <Select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  label="انبار"
                >
                  <MenuItem value="">همه انبارها</MenuItem>
                  <MenuItem value="1">انبار مرکزی</MenuItem>
                  <MenuItem value="2">انبار شعبه شرق</MenuItem>
                  <MenuItem value="3">انبار شعبه غرب</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت"
                >
                  <MenuItem value="all">همه</MenuItem>
                  <MenuItem value="active">فعال</MenuItem>
                  <MenuItem value="expiring">نزدیک به انقضا</MenuItem>
                  <MenuItem value="expired">منقضی شده</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="جستجوی دارو"
                placeholder="نام دارو..."
                value={drugFilter}
                onChange={(e) => setDrugFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => {
                    setStatusFilter('all')
                    setDrugFilter('')
                    setSelectedWarehouse('')
                    setDateRange({ from: '', to: '' })
                  }}
                >
                  پاک کردن
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('excel')}
                >
                  خروجی
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">125</Typography>
                  <Typography variant="subtitle1">کل داروها</Typography>
                </Box>
                <MedicationIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">45</Typography>
                  <Typography variant="subtitle1">انتقالات امروز</Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">15</Typography>
                  <Typography variant="subtitle1">نزدیک به انقضا</Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">3</Typography>
                  <Typography variant="subtitle1">منقضی شده</Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
            <Tab label="گزارش موجودی" />
            <Tab label="گزارش انتقالات" />
            <Tab label="داروهای نزدیک به انقضا" />
            <Tab label="موجودی دارو در انبارها" />
            <Tab label="آمار و نمودار" />
          </Tabs>
        </Box>

        {/* موجودی انبار */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              گزارش موجودی انبارها
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                      <TableCell>{item.drug}</TableCell>
                      <TableCell>{item.warehouse}</TableCell>
                      <TableCell>
                        <Chip label={`${item.quantity} عدد`} color="primary" variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>{item.expireDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(item.status)}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </TabPanel>

        {/* گزارش انتقالات */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              گزارش انتقالات داروها
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>دارو</TableCell>
                    <TableCell>از انبار</TableCell>
                    <TableCell>به انبار</TableCell>
                    <TableCell>تعداد</TableCell>
                    <TableCell>تاریخ</TableCell>
                    <TableCell>کاربر</TableCell>
                    <TableCell>وضعیت</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredMovements().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.drug}</TableCell>
                      <TableCell>{item.fromWarehouse}</TableCell>
                      <TableCell>{item.toWarehouse}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(item.status)}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </TabPanel>

        {/* داروهای نزدیک به انقضا */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              توجه: داروهای زیر در معرض انقضا قرار دارند و نیاز به بررسی فوری دارند.
            </Alert>
            <Typography variant="h6" gutterBottom>
              داروهای نزدیک به انقضا
            </Typography>
            <List>
              {sampleReports.expiring.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <WarningIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${item.drug} - ${item.warehouse}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          موجودی: {item.quantity} عدد | تاریخ انقضا: {item.expireDate}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${item.daysLeft} روز باقی‌مانده`}
                          color={item.daysLeft <= 7 ? 'error' : 'warning'}
                          sx={{ mr: 1, mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </TabPanel>

        {/* موجودی دارو در انبارها */}
        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              موجودی دارو در تمام انبارها
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              برای مشاهده موجودی یک دارو در تمام انبارها، نام دارو را انتخاب کنید
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>انتخاب دارو</InputLabel>
                  <Select
                    value={selectedDrugForWarehouse}
                    onChange={(e) => setSelectedDrugForWarehouse(e.target.value)}
                    label="انتخاب دارو"
                  >
                    <MenuItem value="">همه داروها</MenuItem>
                    {getAvailableDrugs().map((drug) => (
                      <MenuItem key={drug} value={drug}>{drug}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {selectedDrugForWarehouse ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  موجودی دارو "{selectedDrugForWarehouse}" در تمام انبارها:
                </Alert>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>انبار</TableCell>
                        <TableCell>موجودی</TableCell>
                        <TableCell>تاریخ انقضا</TableCell>
                        <TableCell>وضعیت</TableCell>
                        <TableCell>روزهای باقی‌مانده</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getDrugInventoryAcrossWarehouses().map((item, index) => {
                        const today = new Date()
                        const expireDate = new Date(item.expireDate.replace(/\//g, '-'))
                        const daysLeft = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24))
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <InventoryIcon color="primary" />
                                {item.warehouse}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${item.quantity} عدد`} 
                                color={item.quantity > 50 ? 'success' : item.quantity > 20 ? 'warning' : 'error'}
                                variant="outlined" 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>{item.expireDate}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusText(item.status)}
                                color={getStatusColor(item.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={daysLeft > 0 ? `${daysLeft} روز` : 'منقضی شده'}
                                color={daysLeft > 30 ? 'success' : daysLeft > 7 ? 'warning' : 'error'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* خلاصه آمار */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    خلاصه آمار برای "{selectedDrugForWarehouse}":
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">کل موجودی:</Typography>
                      <Typography variant="h6" color="primary">
                        {getDrugInventoryAcrossWarehouses().reduce((sum, item) => sum + item.quantity, 0)} عدد
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">تعداد انبارها:</Typography>
                      <Typography variant="h6" color="success.main">
                        {getDrugInventoryAcrossWarehouses().length} انبار
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">موجودی فعال:</Typography>
                      <Typography variant="h6" color="success.main">
                        {getDrugInventoryAcrossWarehouses().filter(item => item.status === 'active').reduce((sum, item) => sum + item.quantity, 0)} عدد
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">نزدیک به انقضا:</Typography>
                      <Typography variant="h6" color="warning.main">
                        {getDrugInventoryAcrossWarehouses().filter(item => item.status === 'expiring').reduce((sum, item) => sum + item.quantity, 0)} عدد
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Alert severity="info">
                لطفاً یک دارو را انتخاب کنید تا موجودی آن در تمام انبارها نمایش داده شود.
              </Alert>
            )}
          </CardContent>
        </TabPanel>

        {/* آمار و نمودار */}
        <TabPanel value={tabValue} index={4}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              آمار و نمودارها
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      توزیع داروها بر اساس انبار
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        نمودار دایره‌ای توزیع داروها
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      روند انتقالات ماهانه
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        نمودار خطی انتقالات
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </TabPanel>
      </Card>
    </Box>
  )
}
