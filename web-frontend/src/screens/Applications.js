import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Tooltip,
  CircularProgress
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
import Layout from '../components/layout/Layout';
import ApplicationsList from '../components/applications/ApplicationsList';
import { 
  fetchApplications, 
  selectApplications, 
  selectApplicationsLoading, 
  selectApplicationsError,
  exportApplications
} from '../store/slices/applicationSlice';

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'INCOMPLETE', label: 'Incomplete' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' }
];

const Applications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const applications = useSelector(selectApplications);
  const isLoading = useSelector(selectApplicationsLoading);
  const error = useSelector(selectApplicationsError);
  
  // Filter state
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    district: '',
    fromDate: null,
    toDate: null,
    sortBy: 'newest'
  });
  
  // Apply filters to applications
  const filteredApplications = applications.filter(app => {
    // Tab filter (All, Pending, Approved, Rejected)
    if (tabValue === 1 && app.status !== 'PENDING') return false;
    if (tabValue === 2 && app.status !== 'APPROVED') return false;
    if (tabValue === 3 && app.status !== 'REJECTED') return false;
    
    // Status filter
    if (filters.status !== 'ALL' && app.status !== filters.status) return false;
    
    // District filter
    if (filters.district && app.district !== filters.district) return false;
    
    // Date range filter
    if (filters.fromDate && new Date(app.createdAt) < filters.fromDate) return false;
    if (filters.toDate && new Date(app.createdAt) > filters.toDate) return false;
    
    // Search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        app.applicationId?.toLowerCase().includes(searchLower) ||
        app.applicantName?.toLowerCase().includes(searchLower) ||
        app.aadhaarNumber?.includes(searchLower) ||
        app.contactNumber?.includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name_asc':
        return (a.applicantName || '').localeCompare(b.applicantName || '');
      case 'name_desc':
        return (b.applicantName || '').localeCompare(a.applicantName || '');
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
  
  useEffect(() => {
    handleFetchApplications();
  }, [dispatch]);
  
  const handleFetchApplications = () => {
    dispatch(fetchApplications());
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
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
      fromDate: null,
      toDate: null,
      sortBy: 'newest'
    });
    setTabValue(0);
  };
  
  const handleExport = () => {
    dispatch(exportApplications({
      format: 'csv',
      filters: {
        ...filters,
        tabFilter: tabValue === 0 ? null : ['PENDING', 'APPROVED', 'REJECTED'][tabValue - 1]
      }
    }));
  };
  
  return (
    <Layout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Applications
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleFetchApplications}
            >
              Refresh
            </Button>
            <Button 
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/new-application')}
            >
              New Application
            </Button>
          </Box>
        </Box>
        
        {/* Tabs for quick filtering */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All Applications" />
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>
        </Paper>
        
        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  name="search"
                  placeholder="Search by name, application ID or Aadhaar number"
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
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="From Date"
                        value={filters.fromDate}
                        onChange={(date) => handleDateChange('fromDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="To Date"
                        value={filters.toDate}
                        onChange={(date) => handleDateChange('toDate', date)}
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
            Showing {sortedApplications.length} out of {applications.length} applications
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
            {filters.fromDate && (
              <Chip 
                size="small" 
                label={`From: ${filters.fromDate.toLocaleDateString()}`} 
                onDelete={() => setFilters({...filters, fromDate: null})} 
              />
            )}
            {filters.toDate && (
              <Chip 
                size="small" 
                label={`To: ${filters.toDate.toLocaleDateString()}`} 
                onDelete={() => setFilters({...filters, toDate: null})} 
              />
            )}
          </Box>
        </Box>
        
        {/* Applications List */}
        <Paper elevation={1}>
          <ApplicationsList 
            applications={sortedApplications} 
            isLoading={isLoading} 
          />
        </Paper>
      </Box>
    </Layout>
  );
};

export default Applications;