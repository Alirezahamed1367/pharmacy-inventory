import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Divider,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  SwapHoriz as TransferIcon,
} from '@mui/icons-material'
import { DrugSelect, SupplierSelect, WarehouseSelect, UnitSelect } from './DropdownSelects'
import { DRUGS_DATABASE, SUPPLIERS, WAREHOUSES, UNITS, getDrugsSortedSmart, getDrugDisplayName } from '../data/systemData'

/**
 * کامپوننت مشترک برای مدیریت انتقال کالا
 * کاربردها: حواله انتقالی بین انبارها، رسید کالا
 */
export default function TransferDialog({
  open,
  onClose,
  onSave,
  title = "حواله انتقالی",
  type = "transfer", // "transfer" | "receipt"
  initialData = null,
  mode = "add", // "add" | "edit"
}) {
  // حالت اولیه برای انواع مختلف
  const getInitialFormData = () => {
    const baseData = {
      items: [],
      notes: '',
      date: new Date().toLocaleDateString('fa-IR'),
    }

    if (type === "transfer") {
      return {
        ...baseData,
        fromWarehouse: null,
        toWarehouse: null,
        transferNumber: `T-1404-${String(Date.now()).slice(-3)}`,
      }
    } else if (type === "receipt") {
      return {
        ...baseData,
        supplier: null,
        warehouse: null,
        receiptNumber: `R-1404-${String(Date.now()).slice(-3)}`,
        status: 'pending'
      }
    }
    return baseData
  }

  const [formData, setFormData] = useState(initialData || getInitialFormData())
  const [newItem, setNewItem] = useState({
    drug: null,
    quantity: '',
    unit: { id: 1, name: 'عدد' }, // مقدار پیش‌فرض
    price: ''
  })

  // فیلتر داروهای موجود برای انتقال
  const availableDrugs = useMemo(() => {
    if (type === "transfer" && formData.fromWarehouse) {
      // برای انتقال: فقط داروهای موجود در انبار مبدا
      const warehouse = WAREHOUSES.find(w => w.id === formData.fromWarehouse?.id)
      if (warehouse && warehouse.drugs) {
        return warehouse.drugs.map(drugItem => {
          const fullDrug = DRUGS_DATABASE.find(d => d.name === drugItem.name)
          return fullDrug ? { ...fullDrug, availableQuantity: drugItem.quantity } : null
        }).filter(Boolean)
      }
      return []
    }
    // برای رسید: تمام داروها با مرتب‌سازی هوشمند
    return getDrugsSortedSmart()
  }, [type, formData.fromWarehouse])

  const handleAddItem = () => {
    if (!newItem.drug || !newItem.quantity || !newItem.unit) {
      alert('لطفاً تمام فیلدهای ضروری را پر کنید')
      return
    }

    // بررسی موجودی برای انتقال
    if (type === "transfer" && newItem.drug.availableQuantity) {
      if (parseInt(newItem.quantity) > newItem.drug.availableQuantity) {
        alert(`موجودی کافی نیست! حداکثر ${newItem.drug.availableQuantity} عدد موجود است`)
        return
      }
    }

    const item = {
      id: formData.items.length + 1,
      drug: newItem.drug,
      quantity: parseInt(newItem.quantity),
      unit: newItem.unit,
      price: type === "receipt" ? parseInt(newItem.price || 0) : 0
    }

    setFormData({
      ...formData,
      items: [...formData.items, item]
    })

    setNewItem({
      drug: null,
      quantity: '',
      unit: { id: 1, name: 'عدد' },
      price: ''
    })
  }

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      items: updatedItems
    })
  }

  const handleSave = () => {
    if (formData.items.length === 0) {
      alert('لطفاً حداقل یک کالا اضافه کنید')
      return
    }

    if (type === "transfer") {
      if (!formData.fromWarehouse || !formData.toWarehouse) {
        alert('لطفاً انبار مبدا و مقصد را انتخاب کنید')
        return
      }
      if (formData.fromWarehouse.id === formData.toWarehouse.id) {
        alert('انبار مبدا و مقصد نمی‌توانند یکسان باشند')
        return
      }
    } else if (type === "receipt") {
      if (!formData.supplier || !formData.warehouse) {
        alert('لطفاً تامین‌کننده و انبار را انتخاب کنید')
        return
      }
    }

    // محاسبه ارزش کل
    const totalValue = formData.items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0)
    
    const finalData = {
      ...formData,
      totalValue
    }

    onSave(finalData)
    handleClose()
  }

  const handleClose = () => {
    setFormData(getInitialFormData())
    setNewItem({
      drug: null,
      quantity: '',
      unit: { id: 1, name: 'عدد' },
      price: ''
    })
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xl" 
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {type === "transfer" ? <TransferIcon /> : <InventoryIcon />}
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ minHeight: '600px' }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Header Information */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              اطلاعات اولیه
            </Typography>
          </Grid>

          {type === "transfer" ? (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="شماره انتقال"
                  value={formData.transferNumber}
                  disabled
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="تاریخ"
                  value={formData.date ? dayjs(formData.date, 'YYYY-MM-DD') : dayjs()}
                  onChange={(newValue) => {
                    setFormData({ 
                      ...formData, 
                      date: newValue ? newValue.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
                    })
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "medium",
                      helperText: "فرمت: روز/ماه/سال"
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}></Grid>
              <Grid item xs={12} sm={6} md={6}>
                <WarehouseSelect
                  value={formData.fromWarehouse}
                  onChange={(newValue) => setFormData({ 
                    ...formData, 
                    fromWarehouse: newValue,
                    items: [] // Clear items when source changes
                  })}
                  warehouses={WAREHOUSES.filter(w => w.id !== 6)} // Exclude transit warehouse
                  label="از انبار"
                  required
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <WarehouseSelect
                  value={formData.toWarehouse}
                  onChange={(newValue) => setFormData({ ...formData, toWarehouse: newValue })}
                  warehouses={WAREHOUSES.filter(w => 
                    w.id !== 6 && w.id !== formData.fromWarehouse?.id
                  )}
                  label="به انبار"
                  required
                  size="medium"
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="شماره رسید"
                  value={formData.receiptNumber}
                  disabled
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="تاریخ"
                  value={formData.date ? dayjs(formData.date, 'YYYY-MM-DD') : dayjs()}
                  onChange={(newValue) => {
                    setFormData({ 
                      ...formData, 
                      date: newValue ? newValue.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
                    })
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "medium",
                      helperText: "فرمت: روز/ماه/سال"
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}></Grid>
              <Grid item xs={12} sm={6} md={6}>
                <SupplierSelect
                  value={formData.supplier}
                  onChange={(newValue) => setFormData({ ...formData, supplier: newValue })}
                  suppliers={SUPPLIERS}
                  label="تامین‌کننده"
                  required
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <WarehouseSelect
                  value={formData.warehouse}
                  onChange={(newValue) => setFormData({ ...formData, warehouse: newValue })}
                  warehouses={WAREHOUSES}
                  label="انبار مقصد"
                  excludeTransit={true}
                  required
                  size="medium"
                />
              </Grid>
            </>
          )}

          {/* Add Item Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              افزودن کالا
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              برای اضافه کردن کالا، فیلدهای زیر را پر کرده و روی "افزودن کالا" کلیک کنید
            </Alert>
          </Grid>

          <Grid item xs={12} sm={12} md={6}>
            <DrugSelect
              value={newItem.drug}
              onChange={(newValue) => setNewItem({ ...newItem, drug: newValue })}
              drugs={availableDrugs}
              label="انتخاب دارو"
              sortBy="smart"
              showExpiry={true}
              required
              size="medium"
              helperText={type === "transfer" && formData.fromWarehouse ? 
                "داروهای موجود در انبار مبدا" : 
                "تمام داروها"
              }
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextField
              fullWidth
              label="تعداد"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              size="medium"
              inputProps={{ min: 1 }}
              helperText={
                type === "transfer" && newItem.drug?.availableQuantity ? 
                `موجود: ${newItem.drug.availableQuantity}` : 
                ""
              }
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <UnitSelect
              value={newItem.unit}
              onChange={(newValue) => setNewItem({ ...newItem, unit: newValue })}
              units={UNITS}
              label="واحد"
              required
              size="medium"
            />
          </Grid>

          {type === "receipt" && (
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="قیمت واحد"
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                size="medium"
                inputProps={{ min: 0 }}
              />
            </Grid>
          )}

          <Grid item xs={6} sm={3} md={1}>
            <Button
              variant="contained"
              onClick={handleAddItem}
              startIcon={<AddIcon />}
              fullWidth
              size="large"
              sx={{ height: '56px' }}
            >
              افزودن
            </Button>
          </Grid>

          {/* Items List */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              لیست کالاهای {type === "transfer" ? "انتقالی" : "دریافتی"}
            </Typography>
          </Grid>

          {formData.items.length > 0 ? (
            <Grid item xs={12}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>نام دارو</TableCell>
                      <TableCell>تاریخ انقضا</TableCell>
                      <TableCell>تعداد</TableCell>
                      <TableCell>واحد</TableCell>
                      {type === "receipt" && <TableCell>قیمت واحد</TableCell>}
                      {type === "receipt" && <TableCell>قیمت کل</TableCell>}
                      <TableCell width="80">عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" sx={{ 
                              maxWidth: '200px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {item.drug.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{
                              display: 'block',
                              maxWidth: '200px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {item.drug.genericName || item.drug.description} • {item.drug.manufacturer || item.drug.company}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              <Chip
                                size="small"
                                label={item.drug.dosage || 'نامشخص'}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '18px' }}
                              />
                              {(item.drug.availableQuantity || item.drug.quantity) && (
                                <Chip
                                  size="small"
                                  label={`موجود: ${item.drug.availableQuantity || item.drug.quantity}`}
                                  color="info"
                                  sx={{ fontSize: '0.7rem', height: '18px' }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={item.drug.expiryDate}
                            color={
                              new Date(item.drug.expiryDate.replace(/\//g, '-')) < new Date() ? 'error' :
                              new Date(item.drug.expiryDate.replace(/\//g, '-')) < new Date(Date.now() + 30*24*60*60*1000) ? 'warning' :
                              'success'
                            }
                          />
                        </TableCell>
                        <TableCell>{item.quantity.toLocaleString()}</TableCell>
                        <TableCell>{item.unit?.name}</TableCell>
                        {type === "receipt" && (
                          <TableCell>{item.price.toLocaleString()} ریال</TableCell>
                        )}
                        {type === "receipt" && (
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {(item.quantity * item.price).toLocaleString()} ریال
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {type === "receipt" && formData.items.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary">
                    ارزش کل: {formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()} ریال
                  </Typography>
                </Box>
              )}
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                هنوز کالایی اضافه نشده است
              </Alert>
            </Grid>
          )}

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="توضیحات"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              size="medium"
              placeholder="توضیحات اضافی در مورد این انتقال..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} size="large">
          انصراف
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          size="large"
          disabled={formData.items.length === 0}
        >
          {mode === "edit" ? "ویرایش" : "ثبت"} {type === "transfer" ? "انتقال" : "رسید"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}