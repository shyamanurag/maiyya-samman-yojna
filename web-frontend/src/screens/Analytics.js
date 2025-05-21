import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Components
import Layout from '../components/layout/Layout';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import ApplicationTrendsChart from '../components/analytics/ApplicationTrendsChart';
import GeographicalDistribution from '../components/analytics/GeographicalDistribution';

// Redux
import {
  fetchAnalyticsData,
  exportAnalyticsReport,
  selectAnalyticsData,
  selectAnalyticsLoading,
  selectAnalyticsError
} from '../store/slices/analyticsSlice';

const Analytics = () => {
  const dispatch = useDispatch();
  
  const analyticsData = useSelector(selectAnalyticsData);
  const isLoading = useSelector(selectAnalyticsLoading);
  const error = useSelector(selectAnalyticsError);
  
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    dateRange: 'month',
    startDate: null,
    endDate: null,
    district: '',
    status: ''
  });
  
  useEffect(() => {
    handleFetchData();
  }, [dispatch]);
  
  const handleFetchData = () => {
    dispatch(fetchAnalyticsData(filterValues));
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterValues({
      ...filterValues,
      [name]: value
    });
  };
  
  const handleDateChange = (name, date) => {
    setFilterValues({
      ...filterValues,
      [name]: date
    });
  };
  
  const handleExport = (format) => {
    dispatch(exportAnalyticsReport({
      format,
      filters: filterValues,
      reportType: tabValue === 0 ? 'overview' : tabValue === 1 ? 'trends' : 'geographical'
    }));
  };
  
  if (isLoading && !analyticsData) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">
            Error loading analytics data: {error}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleFetchData}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics & Reports
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleFetchData}
            >
              Refresh
            </Button>
            <Button 
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button 
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => handleExport('pdf')}
            >
              Print Report
            </Button>
          </Box>
        </Box>
        
        {/* Filters */}
        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="date-range-label">Date Range</InputLabel>
                  <Select
                    labelId="date-range-label"
                    name="dateRange"
                    value={filterValues.dateRange}
                    label="Date Range"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                    <MenuItem value="quarter">Last Quarter</MenuItem>
                    <MenuItem value="year">Last Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {filterValues.dateRange === 'custom' && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date"
                        value={filterValues.startDate}
                        onChange={(date) => handleDateChange('startDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="End Date"
                        value={filterValues.endDate}
                        onChange={(date) => handleDateChange('endDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="district-label">District</InputLabel>
                  <Select
                    labelId="district-label"
                    name="district"
                    value={filterValues.district}
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
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={filterValues.status}
                    label="Status"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleFetchData}>
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {/* Analytics Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Overview" />
            <Tab label="Trends" />
            <Tab label="Geographical" />
          </Tabs>
        </Paper>
        
        {/* Tab Content */}
        {tabValue === 0 && (
          <Box>
            <AnalyticsDashboard data={analyticsData} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <ApplicationTrendsChart data={analyticsData} />
              </Grid>
              <Grid item xs={12} md={4}>
                <GeographicalDistribution data={analyticsData} />
              </Grid>
            </Grid>
            
            {/* Additional overview metrics */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Processing Efficiency
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Average Processing Time
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {analyticsData?.processingEfficiency?.averageTime || '0'} days
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Applications Processed Today
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {analyticsData?.processingEfficiency?.processedToday || '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Oldest Pending Application
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {analyticsData?.processingEfficiency?.oldestPending || '0'} days
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Applications Requiring Attention
                        </Typography>
                        <Typography variant="h5" color="error">
                          {analyticsData?.processingEfficiency?.requireAttention || '0'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Fraud Detection
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Potential Fraud Cases
                        </Typography>
                        <Typography variant="h5" color="error">
                          {analyticsData?.fraudMetrics?.potentialCases || '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Verified Fraud Cases
                        </Typography>
                        <Typography variant="h5" color="error">
                          {analyticsData?.fraudMetrics?.verifiedCases || '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Fraud Detection Rate
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {analyticsData?.fraudMetrics?.detectionRate || '0'}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Savings from Fraud Prevention
                        </Typography>
                        <Typography variant="h5" color="primary">
                          ₹{analyticsData?.fraudMetrics?.preventedAmount || '0'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ApplicationTrendsChart data={analyticsData} />
              </Grid>
              
              {/* Detailed trends analysis */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Trend Analysis
                    </Typography>
                    <Typography variant="body1" paragraph>
                      The application submission trend shows 
                      {analyticsData?.trendAnalysis?.trend === 'increasing' 
                        ? ' an increasing pattern' 
                        : analyticsData?.trendAnalysis?.trend === 'decreasing' 
                          ? ' a decreasing pattern' 
                          : ' a stable pattern'} 
                      over the selected time period. 
                      {analyticsData?.trendAnalysis?.description || ''}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Peak Submission Day
                        </Typography>
                        <Typography variant="body1">
                          {analyticsData?.trendAnalysis?.peakDay || 'Monday'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Average Weekly Applications
                        </Typography>
                        <Typography variant="body1">
                          {analyticsData?.trendAnalysis?.weeklyAverage || '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Projected Next Month
                        </Typography>
                        <Typography variant="body1">
                          {analyticsData?.trendAnalysis?.projection || '0'} applications
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <GeographicalDistribution data={analyticsData} />
            
            {/* Detailed geographical analysis */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Regional Insights
                </Typography>
                <Typography variant="body1" paragraph>
                  {analyticsData?.regionalInsights?.summary || 'Regional data analysis shows varying application patterns across different districts.'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Highest Application Areas
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {(analyticsData?.regionalInsights?.highestAreas || []).map((area, index) => (
                        <li key={index}>
                          <Typography variant="body2">
                            {area.name}: {area.count} applications ({area.percentage}%)
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Areas Needing Attention
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {(analyticsData?.regionalInsights?.lowCoverageAreas || []).map((area, index) => (
                        <li key={index}>
                          <Typography variant="body2">
                            {area.name}: {area.count} applications ({area.percentage}%)
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default Analytics;