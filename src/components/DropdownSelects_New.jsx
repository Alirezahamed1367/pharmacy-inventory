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
  const expiry = new Date(expiryDate.replace(/\//g, '-'));
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
    minHeight: '56px',
  },
  '& .MuiAutocomplete-input': {
    fontSize: '1rem',
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
  }
};

// Common paper styles for dropdowns
const commonPaperStyles = {
  maxHeight: 400,
  '& .MuiAutocomplete-listbox': {
    maxHeight: 350,
    '& .MuiAutocomplete-option': {
      minHeight: '60px',
      padding: '8px 16px'
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
        sorted.sort((a, b) => {
          const dateA = new Date(a.expiryDate.replace(/\//g, '-'));
          const dateB = new Date(b.expiryDate.replace(/\//g, '-'));
          return dateA - dateB;
        });
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
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
      getOptionLabel={(option) => option ? `${option.name}${showExpiry ? ` (${option.expiryDate})` : ''}` : ''}
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
        return (
          <Box component="li" {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="bold" noWrap>
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {option.genericName} • {option.manufacturer}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, ml: 1 }}>
                {showExpiry && (
                  <Chip
                    size="small"
                    label={option.expiryDate}
                    color={expiryStatus.color}
                    sx={{ 
                      minWidth: '90px',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
                <Typography variant="caption" color="text.secondary" noWrap>
                  بچ: {option.batchNumber}
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
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5 }}>
          <BusinessIcon color="primary" sx={{ fontSize: 20 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {option.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" noWrap>
                {option.contact} • {option.phone}
              </Typography>
              <Chip
                label={`امتیاز: ${option.rating}`}
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
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5 }}>
            <WarehouseIcon color="primary" sx={{ fontSize: 20 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight="bold" noWrap>
                {option.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {option.manager}
                </Typography>
                <Chip
                  label={`${capacityPercentage}% پر`}
                  size="small"
                  color={getCapacityColor(option.currentStock, option.capacity)}
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