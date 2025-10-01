import React, { useState, useMemo } from 'react'
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  Paper,
  InputAdornment,
} from '@mui/material'
import {
  Search as SearchIcon,
  MedicalServices as MedicalIcon,
  Business as BusinessIcon,
  Warehouse as WarehouseIcon,
  Category as CategoryIcon,
  Scale as ScaleIcon,
  Person as PersonIcon,
} from '@mui/icons-material'

// Helper function to get expiry status
const getExpiryStatus = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate); // حالا که فرمت میلادی است نیازی به replace نیست
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { status: 'expired', color: 'error', text: 'منقضی' };
  if (diffDays <= 30) return { status: 'expiring', color: 'warning', text: `${diffDays} روز` };
  if (diffDays <= 90) return { status: 'soon', color: 'info', text: `${diffDays} روز` };
  return { status: 'good', color: 'success', text: `${diffDays} روز` };
};

// Common text field styles for better sizing
const commonTextFieldStyles = {
  '& .MuiInputBase-root': {
    minHeight: '64px', // افزایش ارتفاع بیشتر
  },
  '& .MuiAutocomplete-input': {
    fontSize: '1rem',
    minWidth: '400px', // افزایش سایز بیشتر
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
  },
  '& .MuiAutocomplete-endAdornment': {
    right: '9px',
  }
};

// Common paper styles for dropdowns
const commonPaperStyles = {
  maxHeight: 600,
  width: 'auto',
  minWidth: '600px', // افزایش سایز بیشتر
  '& .MuiAutocomplete-listbox': {
    maxHeight: 550,
    '& .MuiAutocomplete-option': {
      minHeight: '100px', // افزایش سایز بیشتر
      padding: '24px 32px', // افزایش padding بیشتر
      borderBottom: '1px solid #f0f0f0',
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
      },
      '& .MuiTypography-root': {
        fontSize: '1rem', // افزایش سایز فونت
        lineHeight: 1.5,
      }
    }
  }
};

// Drug Select Component with Enhanced Sizing
export const DrugSelect = ({ 
  value, 
  onChange, 
  label = "انتخاب دارو", 
  drugs = [], 
  sortBy = 'expiry',
  showExpiry = true,
  required = false,
  error = false,
  helperText = "",
  size = "medium",
  ...props 
}) => {
  const [inputValue, setInputValue] = useState('');

  const sortedDrugs = useMemo(() => {
    let sorted = [...drugs];
    
    switch (sortBy) {
      case 'expiry':
        // مرتب‌سازی بر اساس تاریخ انقضا (نزدیک‌ترین ابتدا)
        sorted.sort((a, b) => {
          const dateA = new Date(a.expiryDate);
          const dateB = new Date(b.expiryDate);
          return dateA - dateB;
        });
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
        break;
      case 'quantity':
        // مرتب‌سازی بر اساس موجودی (بیشترین اول)
        sorted.sort((a, b) => (b.availableQuantity || b.quantity || 0) - (a.availableQuantity || a.quantity || 0));
        break;
      case 'smart':
        // مرتب‌سازی هوشمند (تاریخ انقضا + موجودی)
        sorted.sort((a, b) => {
          const dateA = new Date(a.expiryDate);
          const dateB = new Date(b.expiryDate);
          const dateDiff = dateA - dateB;
          
          // اگر تفاوت تاریخ کمتر از 30 روز باشد، بر اساس موجودی مرتب کن
          if (Math.abs(dateDiff) < 30 * 24 * 60 * 60 * 1000) {
            const qtyA = a.availableQuantity || a.quantity || 0;
            const qtyB = b.availableQuantity || b.quantity || 0;
            return qtyB - qtyA; // موجودی بیشتر اول
          }
          
          return dateDiff;
        });
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category, 'fa'));
        break;
      default:
        break;
    }
    
    return sorted;
  }, [drugs, sortBy]);

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={sortedDrugs}
      getOptionLabel={(option) => {
        if (!option) return '';
        const availableQty = option.availableQuantity || option.quantity || 0;
        return `${option.name} (موجودی: ${availableQty}) - ${option.expiryDate}`;
      }}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      filterOptions={(options, { inputValue }) => {
        const filterValue = inputValue.toLowerCase();
        return options.filter(option =>
          option.name.toLowerCase().includes(filterValue) ||
          option.genericName.toLowerCase().includes(filterValue) ||
          option.activeIngredient.toLowerCase().includes(filterValue) ||
          option.manufacturer.toLowerCase().includes(filterValue)
        );
      }}
      renderOption={(props, option) => {
        const expiryStatus = getExpiryStatus(option.expiryDate);
        const availableQty = option.availableQuantity || option.quantity || 0;
        
        return (
          <Box component="li" {...props} sx={{ 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            py: 1.5,
            width: '100%',
            minWidth: '320px'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              width: '100%', 
              alignItems: 'flex-start',
              gap: 2 
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="bold" sx={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px'
                }}>
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px'
                }}>
                  {option.genericName || option.description} • {option.manufacturer || option.company}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip
                    size="small"
                    label={`موجودی: ${availableQty}`}
                    color={availableQty > 10 ? 'success' : availableQty > 0 ? 'warning' : 'error'}
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                  <Chip
                    size="small"
                    label={option.dosage || option.unit || 'نامشخص'}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end', 
                gap: 0.5,
                minWidth: '100px'
              }}>
                {showExpiry && (
                  <Chip
                    size="small"
                    label={option.expiryDate}
                    color={expiryStatus.color}
                    sx={{ 
                      fontSize: '0.75rem',
                      height: '24px',
                      minWidth: '85px'
                    }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {expiryStatus.text}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          size={size}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <MedicalIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={commonTextFieldStyles}
        />
      )}
      PaperComponent={(props) => (
        <Paper {...props} sx={commonPaperStyles} />
      )}
      noOptionsText="دارویی یافت نشد"
      {...props}
    />
  );
};

// Supplier Select Component with Enhanced Sizing
export const SupplierSelect = ({ 
  value, 
  onChange, 
  label = "انتخاب تامین‌کننده", 
  suppliers = [], 
  required = false,
  error = false,
  helperText = "",
  size = "medium",
  ...props 
}) => {
  const [inputValue, setInputValue] = useState('');

  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
  }, [suppliers]);

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={sortedSuppliers}
      getOptionLabel={(option) => option ? option.name : ''}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2,
          minHeight: '80px',
          width: '100%'
        }}>
          <BusinessIcon color="primary" sx={{ fontSize: 24 }} />
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
              {option.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                {option.contact} • {option.phone}
              </Typography>
              <Chip
                label={`امتیاز: ${option.rating || 5}`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          size={size}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={commonTextFieldStyles}
        />
      )}
      PaperComponent={(props) => (
        <Paper {...props} sx={{
          maxHeight: 300,
          '& .MuiAutocomplete-listbox': {
            maxHeight: 250,
            '& .MuiAutocomplete-option': {
              minHeight: '50px',
              padding: '8px 16px'
            }
          }
        }} />
      )}
      noOptionsText="تامین‌کننده‌ای یافت نشد"
      {...props}
    />
  );
};

// Warehouse Select Component with Enhanced Sizing
export const WarehouseSelect = ({ 
  value, 
  onChange, 
  label = "انتخاب انبار", 
  warehouses = [], 
  excludeTransit = false,
  required = false,
  error = false,
  helperText = "",
  size = "medium",
  ...props 
}) => {
  const [inputValue, setInputValue] = useState('');

  const filteredWarehouses = useMemo(() => {
    let filtered = excludeTransit 
      ? warehouses.filter(w => w.id !== 6) // Exclude transit warehouse (ID 6)
      : warehouses;
    
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
  }, [warehouses, excludeTransit]);

  const getCapacityColor = (current, total) => {
    const percentage = (current / total) * 100;
    if (percentage > 80) return 'error';
    if (percentage > 60) return 'warning';
    return 'success';
  };

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={filteredWarehouses}
      getOptionLabel={(option) => option ? option.name : ''}
      renderOption={(props, option) => {
        const capacityPercentage = Math.round((option.currentStock / option.capacity) * 100);
        return (
          <Box component="li" {...props} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2,
            minHeight: '80px',
            width: '100%'
          }}>
            <WarehouseIcon color="primary" sx={{ fontSize: 24 }} />
            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                {option.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  {option.manager || 'مسئول تعیین نشده'}
                </Typography>
                <Chip
                  label={`${capacityPercentage || 0}% پر`}
                  size="small"
                  color={getCapacityColor(option.currentStock || 0, option.capacity || 100)}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          size={size}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <WarehouseIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={commonTextFieldStyles}
        />
      )}
      PaperComponent={(props) => (
        <Paper {...props} sx={{
          maxHeight: 300,
          '& .MuiAutocomplete-listbox': {
            maxHeight: 250,
            '& .MuiAutocomplete-option': {
              minHeight: '50px',
              padding: '8px 16px'
            }
          }
        }} />
      )}
      noOptionsText="انباری یافت نشد"
      {...props}
    />
  );
};

// Unit Select Component with Enhanced Sizing
export const UnitSelect = ({ 
  value, 
  onChange, 
  label = "انتخاب واحد", 
  units = [], 
  required = false,
  error = false,
  helperText = "",
  size = "medium",
  ...props 
}) => {
  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      options={units}
      getOptionLabel={(option) => option ? option.name : ''}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
          <ScaleIcon color="primary" sx={{ fontSize: 18 }} />
          <Typography variant="body2">
            {option.name} {option.symbol && `(${option.symbol})`}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          size={size}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <ScaleIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={commonTextFieldStyles}
        />
      )}
      PaperComponent={(props) => (
        <Paper {...props} sx={{
          maxHeight: 200,
          '& .MuiAutocomplete-listbox': {
            maxHeight: 150,
            '& .MuiAutocomplete-option': {
              minHeight: '40px',
              padding: '6px 16px'
            }
          }
        }} />
      )}
      noOptionsText="واحدی یافت نشد"
      {...props}
    />
  );
};

// Category Select Component with Enhanced Sizing
export const CategorySelect = ({ 
  value, 
  onChange, 
  label = "انتخاب دسته‌بندی", 
  categories = [], 
  required = false,
  error = false,
  helperText = "",
  size = "medium",
  ...props 
}) => {
  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      options={categories}
      getOptionLabel={(option) => option || ''}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
          <CategoryIcon color="primary" sx={{ fontSize: 18 }} />
          <Typography variant="body2">
            {option}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          size={size}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <CategoryIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={commonTextFieldStyles}
        />
      )}
      PaperComponent={(props) => (
        <Paper {...props} sx={{
          maxHeight: 200,
          '& .MuiAutocomplete-listbox': {
            maxHeight: 150,
            '& .MuiAutocomplete-option': {
              minHeight: '40px',
              padding: '6px 16px'
            }
          }
        }} />
      )}
      noOptionsText="دسته‌بندی یافت نشد"
      {...props}
    />
  );
};

// Manager Select Component
export const ManagerSelect = ({ 
  value, 
  onChange, 
  managers = [], 
  label = "مسئول انبار",
  required = false,
  size = "medium",
  disabled = false,
  ...props 
}) => {
  return (
    <Autocomplete
      options={managers}
      getOptionLabel={(option) => `${option.full_name} - ${option.role}`}
      value={managers.find(manager => manager.full_name === value) || null}
      onChange={(event, newValue) => {
        onChange(newValue ? newValue.full_name : '')
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          size={size}
          disabled={disabled}
          helperText="انتخاب مسئول از لیست"
          sx={commonTextFieldStyles}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <PersonIcon sx={{ color: 'primary.main' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                {option.full_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.role} - {option.phone}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      PaperComponent={(props) => (
        <Paper {...props} sx={commonPaperStyles} />
      )}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      noOptionsText="مسئولی یافت نشد"
      clearText="پاک کردن"
      closeText="بستن"
      openText="باز کردن"
      disabled={disabled}
      {...props}
    />
  );
};