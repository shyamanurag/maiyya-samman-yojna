import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Layout from '../components/layout/Layout';
import BeneficiaryList from '../components/beneficiaries/BeneficiaryList';

// Redux
import { 
  fetchBeneficiaries,
  exportBeneficiaryData,
  importBeneficiaryData, 
  selectBeneficiaries, 
  selectBeneficiariesLoading, 
  selectBeneficiariesError 
} from '../store/slices/beneficiariesSlice';
import { showToast } from '../store/slices/uiSlice';

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { value: 'SUSPENDED', label: 'Suspended' }
];

const sortOptions = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'newest', label: 'Registration Date (Newest)' },
  { value: 'oldest', label: 'Registration Date (Oldest)' }
];

const Beneficiaries = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const beneficiaries = useSelector(selectBeneficiaries);
  const isLoading = useSelector(selectBeneficiariesLoading);
  const error = useSelector(selectBeneficiariesError);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    district: '',
    registrationFromDate: null,
    registrationToDate: null,
    sortBy: 'name_asc'
  });
  
  // File upload state
  const [importFile, setImportFile] = useState(null);
  
  useEffect(() => {
    handleFetchBeneficiaries();
  }, [dispatch]);
  
  const handleFetchBeneficiaries = () => {
    dispatch(fetchBeneficiaries(filters));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleDateChange = (name, date) => {
    setFilters({
      ...filters,
      [name]: date
    });
  };
  
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      district: '',
      registrationFromDate: null,
      registrationToDate: null,
      sortBy: 'name_asc'
    });
  };
  
  const handleExport = (format) => {
    dispatch(exportBeneficiaryData({
      format,
      filters
    })).unwrap().then(() => {
      dispatch(showToast({
        message: `Beneficiary data exported as ${format.toUpperCase()} successfully`,
        type: 'success'
      }));
    }).catch((err) => {
      dispatch(showToast({
        message: `Export failed: ${err.message}`,
        type: 'error'
      }));
    });
  };
  
  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };
  
  const handleImport = () => {
    if (!importFile) {
      dispatch(showToast({
        message: 'Please select a file to import',
        type: 'error'
      }));
      return;
    }
    
    const formData = new FormData();
    formData.append('file', importFile);
    
    dispatch(importBeneficiaryData(formData)).unwrap().then(() => {
      setImportFile(null);
      dispatch(showToast({
        message: 'Beneficiary data imported successfully',
        type: 'success'
      }));
      handleFetchBeneficiaries();
    }).catch((err) => {
      dispatch(showToast({
        message: `Import failed: ${err.message}`,
        type: 'error'
      }));
    });
  };
  
  // Filter and sort beneficiaries
  const filteredBeneficiaries = beneficiaries.filter(beneficiary => {
    // Status filter
    if (filters.status !== 'ALL' && beneficiary.status !== filters.status) return false;
    
    // District filter
    if (filters.district && beneficiary.district !== filters.district) return false;
    
    // Date range filter
    if (filters.registrationFromDate && new Date(beneficiary.registrationDate || beneficiary.createdAt) < filters.registrationFromDate) return false;
    if (filters.registrationToDate && new Date(beneficiary.registrationDate || beneficiary.createdAt) > filters.registrationToDate) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        beneficiary.name?.toLowerCase().includes(searchLower) ||
        beneficiary.beneficiaryId?.toLowerCase().includes(searchLower) ||
        beneficiary.aadhaarNumber?.includes(searchLower) ||
        beneficiary.phoneNumber?.includes(searchLower) ||
        beneficiary.email?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort beneficiaries
  const sortedBeneficiaries = [...filteredBeneficiaries].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'newest':
        return new Date(b.registrationDate || b.createdAt) - new Date(a.registrationDate || a.createdAt);
      case 'oldest':
        return new Date(a.registrationDate || a.createdAt) - new Date(b.registrationDate || b.createdAt);
      case 'name_asc':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  
  return (
    <Layout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Beneficiaries
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleFetchBeneficiaries}
            >
              Refresh
            </Button>
            <Button 
              variant="outlined"
              startIcon={<UploadIcon />}
              component="label"
            >
              Import
              <input
                type="file"
                hidden
                accept=".csv,.xlsx"
                onChange={handleFileChange}
              />
            </Button>
            <Button 
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export
            </Button>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/beneficiaries/add')}
            >
              Add Beneficiary
            </Button>
          </Box>
        </Box>
        
        {importFile && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleImport}
              >
                Upload
              </Button>
            }
          >
            Selected file: {importFile.name}
          </Alert>
        )}
        
        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  name="search"
                  placeholder="Search by name, ID, Aadhaar or contact details"
                  fullWidth
                  value={filters.search}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: filters.search ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setFilters({ ...filters, search: '' })}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="sort-select-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-select-label"
                    name="sortBy"
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={handleFilterChange}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant={showFilters ? "contained" : "outlined"}
                  color="primary"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </Grid>
              
              {showFilters && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="status-select-label">Status</InputLabel>
                      <Select
                        labelId="status-select-label"
                        name="status"
                        value={filters.status}
                        label="Status"
                        onChange={handleFilterChange}
                      >
                        {statusOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="district-select-label">District</InputLabel>
                      <Select
                        labelId="district-select-label"
                        name="district"
                        value={filters.district}
                        label="District"
                        onChange={handleFilterChange}
                      >
                        <MenuItem value="">All Districts</MenuItem>
                        <MenuItem value="Ranchi">Ranchi</MenuItem>
                        <MenuItem value="Dhanbad">Dhanbad</MenuItem>
                        <MenuItem value="Jamshedpur">Jamshedpur</MenuItem>
                        <MenuItem value="Bokaro">Bokaro</MenuItem>
                        <MenuItem value="Hazaribagh">Hazaribagh</MenuItem>
                        <MenuItem value="Giridih">Giridih</MenuItem>
                        <MenuItem value="Deoghar">Deoghar</MenuItem>
                        <MenuItem value="Dumka">Dumka</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Registration From"
                        value={filters.registrationFromDate}
                        onChange={(date) => handleDateChange('registrationFromDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Registration To"
                        value={filters.registrationToDate}
                        onChange={(date) => handleDateChange('registrationToDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleClearFilters}
                      startIcon={<ClearIcon />}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
        
        {/* Results Stats */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredBeneficiaries.length} out of {beneficiaries.length} beneficiaries
          </Typography>
          
          {/* Active filters */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filters.search && (
              <Chip 
                size="small" 
                label={`Search: ${filters.search}`} 
                onDelete={() => setFilters({...filters, search: ''})} 
              />
            )}
            {filters.status !== 'ALL' && (
              <Chip 
                size="small" 
                label={`Status: ${statusOptions.find(o => o.value === filters.status)?.label}`} 
                onDelete={() => setFilters({...filters, status: 'ALL'})} 
              />
            )}
            {filters.district && (
              <Chip 
                size="small" 
                label={`District: ${filters.district}`} 
                onDelete={() => setFilters({...filters, district: ''})} 
              />
            )}
            {filters.registrationFromDate && (
              <Chip 
                size="small" 
                label={`From: ${filters.registrationFromDate.toLocaleDateString()}`} 
                onDelete={() => setFilters({...filters, registrationFromDate: null})} 
              />
            )}
            {filters.registrationToDate && (
              <Chip 
                size="small" 
                label={`To: ${filters.registrationToDate.toLocaleDateString()}`} 
                onDelete={() => setFilters({...filters, registrationToDate: null})} 
              />
            )}
          </Box>
        </Box>
        
        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Beneficiary List */}
        <BeneficiaryList 
          beneficiaries={sortedBeneficiaries} 
          isLoading={isLoading} 
        />
      </Box>
    </Layout>
  );
};

export default Beneficiaries;