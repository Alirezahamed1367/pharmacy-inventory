import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Alert,
  AlertTitle,
  Chip,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const ReceiptConfirmationDialog = ({ 
  open, 
  onClose, 
  receipt, 
  onConfirm,
  userRole = 'warehouse_manager' // Default role
}) => {
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [notes, setNotes] = useState('');
  const [discrepancies, setDiscrepancies] = useState([]);
  const [confirmationStatus, setConfirmationStatus] = useState('pending'); // pending, partial, complete

  useEffect(() => {
    if (receipt?.items) {
      // Initialize received quantities with sent quantities
      const initialQuantities = {};
      receipt.items.forEach(item => {
        initialQuantities[item.id] = item.sentQuantity || item.quantity || 0;
      });
      setReceivedQuantities(initialQuantities);
    }
  }, [receipt]);

  useEffect(() => {
    // Calculate discrepancies whenever quantities change
    calculateDiscrepancies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receivedQuantities, receipt]);

  const calculateDiscrepancies = () => {
    if (!receipt?.items) return;

  const newDiscrepancies = [];

    receipt.items.forEach(item => {
      const sentQty = item.sentQuantity || item.quantity || 0;
      const receivedQty = receivedQuantities[item.id] || 0;
      const difference = receivedQty - sentQty;

      if (difference !== 0) {
        newDiscrepancies.push({
          itemId: item.id,
          itemName: item.drugName,
          sentQuantity: sentQty,
          receivedQuantity: receivedQty,
          difference: difference,
          type: difference > 0 ? 'excess' : 'shortage'
        });
      }
    });

    setDiscrepancies(newDiscrepancies);
    
    // Update confirmation status
    if (newDiscrepancies.length === 0) {
      setConfirmationStatus('complete');
    } else {
      setConfirmationStatus('partial');
    }
  };

  const handleQuantityChange = (itemId, value) => {
    const numValue = parseInt(value) || 0;
    setReceivedQuantities(prev => ({
      ...prev,
      [itemId]: numValue
    }));
  };

  const handleConfirm = () => {
    const confirmationData = {
      receiptId: receipt.id,
      status: confirmationStatus,
      receivedQuantities,
      discrepancies,
      notes,
      confirmedBy: userRole,
      confirmedAt: new Date().toISOString(),
      // Items that will remain in transit (due to discrepancies)
      transitItems: discrepancies.filter(d => d.difference < 0).map(d => ({
        itemId: d.itemId,
        itemName: d.itemName,
        quantity: Math.abs(d.difference),
        reason: 'shortage_in_delivery'
      }))
    };

    onConfirm(confirmationData);
    onClose();
  };

  const getTotalDiscrepancyValue = () => {
    return discrepancies.reduce((total, disc) => {
      const item = receipt.items.find(i => i.id === disc.itemId);
      return total + (Math.abs(disc.difference) * (item?.unitPrice || 0));
    }, 0);
  };

  const getStatusColor = (difference) => {
    if (difference === 0) return 'success';
    if (difference > 0) return 'warning';
    return 'error';
  };

  const getStatusIcon = (difference) => {
    if (difference === 0) return <CheckIcon />;
    if (difference > 0) return <WarningIcon />;
    return <ErrorIcon />;
  };

  if (!receipt) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      dir="rtl"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            تایید رسید انبار - شماره {receipt.receiptNumber}
          </Typography>
          <Chip 
            label={confirmationStatus === 'complete' ? 'کامل' : 'ناقص'}
            color={confirmationStatus === 'complete' ? 'success' : 'warning'}
            icon={confirmationStatus === 'complete' ? <CheckIcon /> : <WarningIcon />}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Receipt Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  تامین‌کننده
                </Typography>
                <Typography variant="body1">{receipt.supplierName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  انبار مقصد
                </Typography>
                <Typography variant="body1">{receipt.warehouseName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  تاریخ ارسال
                </Typography>
                <Typography variant="body1">{receipt.sentDate}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  وضعیت
                </Typography>
                <Chip 
                  label={receipt.status === 'in_transit' ? 'در راه' : 'ارسال شده'}
                  color="info"
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Discrepancy Summary */}
        {discrepancies.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>مغایرت در تحویل</AlertTitle>
            <Typography variant="body2">
              {discrepancies.length} قلم دارای مغایرت • 
              ارزش کل مغایرت: {getTotalDiscrepancyValue().toLocaleString()} تومان
            </Typography>
          </Alert>
        )}

        {/* Items Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نام دارو</TableCell>
                <TableCell align="center">مقدار ارسالی</TableCell>
                <TableCell align="center">مقدار دریافتی</TableCell>
                <TableCell align="center">مغایرت</TableCell>
                <TableCell align="center">وضعیت</TableCell>
                <TableCell align="center">قیمت واحد</TableCell>
                <TableCell align="center">ارزش مغایرت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipt.items?.map((item) => {
                const sentQty = item.sentQuantity || item.quantity || 0;
                const receivedQty = receivedQuantities[item.id] || 0;
                const difference = receivedQty - sentQty;
                const discrepancyValue = Math.abs(difference) * (item.unitPrice || 0);

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {item.drugName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          انقضا: {item.expiryDate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={sentQty.toLocaleString()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={receivedQty}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {difference !== 0 && (
                        <Chip
                          label={`${difference > 0 ? '+' : ''}${difference}`}
                          color={getStatusColor(difference)}
                          size="small"
                          icon={getStatusIcon(difference)}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          difference === 0 ? 'تطابق دارد' :
                          difference > 0 ? 'مازاد' : 'کسری'
                        }
                        color={getStatusColor(difference)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {item.unitPrice?.toLocaleString()} تومان
                    </TableCell>
                    <TableCell align="center">
                      {difference !== 0 && (
                        <Typography 
                          variant="body2" 
                          color={difference > 0 ? 'warning.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {discrepancyValue.toLocaleString()} تومان
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Discrepancy Details */}
        {discrepancies.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                جزئیات مغایرت‌ها
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {discrepancies.map((disc, index) => (
                <Alert 
                  key={index}
                  severity={disc.type === 'excess' ? 'warning' : 'error'}
                  sx={{ mb: 1 }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      <strong>{disc.itemName}</strong> - 
                      {disc.type === 'excess' ? ' مازاد: ' : ' کسری: '}
                      <strong>{Math.abs(disc.difference)} عدد</strong>
                    </Typography>
                    {disc.type === 'shortage' && (
                      <Chip 
                        label="باقی‌مانده در راه"
                        color="info"
                        size="small"
                      />
                    )}
                  </Box>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="یادداشت‌ها و توضیحات"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="توضیحات مربوط به مغایرت‌ها یا نکات مهم..."
          />
        </Box>

        {/* Action Info */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>اطلاعات مهم</AlertTitle>
          <Typography variant="body2">
            • اقلام با کسری به عنوان "کالای در راه" باقی می‌مانند
            <br />
            • اقلام مازاد به انبار اضافه خواهند شد
            <br />
            • تمام تغییرات در گزارش‌ها ثبت خواهد شد
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          انصراف
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          startIcon={<CheckIcon />}
        >
          تایید رسید
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptConfirmationDialog;
