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
import { supabase } from '../services/supabase'
import { 
  getInventoryView, 
  getMovementsView, 
  getWarehouses, 
  getActiveDrugs 
} from '../services/supabase'

const Reports = () => {
  const [tabValue, setTabValue] = useState(0)
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drugFilter, setDrugFilter] = useState('')
  const [selectedDrugForWarehouse, setSelectedDrugForWarehouse] = useState('')
  const [inventory, setInventory] = useState([])
  const [movements, setMovements] = useState([])
  const [expiring, setExpiring] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [drugs, setDrugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // دریافت داده‌ها از دیتابیس
  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    setLoading(true)
    try {
      // دریافت موجودی از view
      const inventoryResult = await getInventoryView()
      if (inventoryResult.error) throw new Error(inventoryResult.error.message)

      // دریافت حرکت‌ها از view
      const movementsResult = await getMovementsView()
      if (movementsResult.error) throw new Error(movementsResult.error.message)

      // دریافت انبارها
      const warehousesResult = await getWarehouses()
      if (warehousesResult.error) throw new Error(warehousesResult.error.message)

      // دریافت داروها
      const drugsResult = await getActiveDrugs()
      if (drugsResult.error) throw new Error(drugsResult.error.message)

      setInventory(inventoryResult.data || [])
      setMovements(movementsResult.data || [])
      setWarehouses(warehousesResult.data || [])
      setDrugs(drugsResult.data || [])

      // محاسبه داروهای در حال انقضا
      const expiringDrugs = inventoryResult.data?.filter(item => {
        if (!item.expiry_date) return false
        const expiryDate = new Date(item.expiry_date)
        const today = new Date()
        const diffTime = expiryDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 90 && diffDays >= 0
      }) || []

      setExpiring(expiringDrugs)
      setError(null)
    } catch (error) {
      console.error('خطا در دریافت گزارشات:', error)
      setError('خطا در دریافت گزارشات: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleExport = (format) => {
    const filteredData = getFilteredInventory()
    
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

  const getFilteredMovements = () => {
    return movements.filter(item => {
      const matchesWarehouse = !selectedWarehouse || 
        item.from_warehouse?.includes(selectedWarehouse) || 
        item.to_warehouse?.includes(selectedWarehouse)
      const matchesDrug = !drugFilter || item.drug_name?.toLowerCase().includes(drugFilter.toLowerCase())
      
      return matchesWarehouse && matchesDrug
    })
  }

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>در حال بارگذاری گزارشات...</Typography>
      </Box>
    )
  }

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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام دارو</TableCell>
                  <TableCell>از انبار</TableCell>
                  <TableCell>به انبار</TableCell>
                  <TableCell>مقدار</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>نوع</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredMovements().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug_name}</TableCell>
                    <TableCell>{item.from_warehouse || '-'}</TableCell>
                    <TableCell>{item.to_warehouse || '-'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('fa-IR') : ''}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.movement_type === 'in' ? 'ورود' : 'خروج'} 
                        color={item.movement_type === 'in' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* داروهای منقضی */}
        <TabPanel value={tabValue} index={2}>
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
                {expiring.map((item, index) => {
                  const expiryDate = new Date(item.expiry_date)
                  const today = new Date()
                  const diffTime = expiryDate - today
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{item.drug_name}</TableCell>
                      <TableCell>{item.warehouse_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {expiryDate.toLocaleDateString('fa-IR')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${diffDays} روز`} 
                          color={diffDays <= 30 ? 'error' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
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