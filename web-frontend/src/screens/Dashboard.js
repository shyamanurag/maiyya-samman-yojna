import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PendingActions as PendingIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip as ChartTooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { loadDashboardData, selectDashboardData, selectDashboardLoading, selectDashboardError } from '../store/slices/dashboardSlice';
import { fetchRecentApplications, selectRecentApplications } from '../store/slices/applicationSlice';
import Layout from '../components/layout/Layout';
import ApplicationsList from '../components/applications/ApplicationsList';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const StatCard = ({ title, value, icon, color, subtitle, change, changeDirection }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color="text.primary" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {subtitle}
              </Typography>
            )}
            {change && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                {changeDirection === 'up' ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingUpIcon fontSize="small" color="error" sx={{ transform: 'rotate(180deg)' }} />
                )}
                <Typography 
                  variant="body2" 
                  color={changeDirection === 'up' ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {change}
                </Typography>
              </Box>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: '50%', 
              bgcolor: `${color}.light`, 
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const dashboardData = useSelector(selectDashboardData);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const recentApplications = useSelector(selectRecentApplications);
  
  const [timeRange, setTimeRange] = useState('week');
  const [chartMenuAnchorEl, setChartMenuAnchorEl] = useState(null);
  const [activeChartMenu, setActiveChartMenu] = useState(null);
  
  useEffect(() => {
    dispatch(loadDashboardData(timeRange));
    dispatch(fetchRecentApplications({ limit: 5 }));
  }, [dispatch, timeRange]);
  
  const handleRefresh = () => {
    dispatch(loadDashboardData(timeRange));
    dispatch(fetchRecentApplications({ limit: 5 }));
  };
  
  const handleChartMenuOpen = (event, menuId) => {
    setChartMenuAnchorEl(event.currentTarget);
    setActiveChartMenu(menuId);
  };
  
  const handleChartMenuClose = () => {
    setChartMenuAnchorEl(null);
    setActiveChartMenu(null);
  };
  
  // Sample chart data
  const applicationTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Applications',
        data: dashboardData?.applicationTrends || [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: theme.palette.primary.main,
        tension: 0.1
      },
      {
        label: 'Approvals',
        data: dashboardData?.approvalTrends || [28, 48, 40, 19, 86, 27, 90],
        fill: false,
        borderColor: theme.palette.success.main,
        tension: 0.1
      }
    ]
  };
  
  const applicationStatusData = {
    labels: ['Approved', 'Pending', 'Rejected', 'Under Review'],
    datasets: [
      {
        data: dashboardData?.statusDistribution || [300, 50, 100, 80],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          theme.palette.info.main
        ],
        borderColor: [
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          theme.palette.info.main
        ],
        borderWidth: 1
      }
    ]
  };
  
  const districtWiseData = {
    labels: dashboardData?.districtWise?.map(d => d.district) || 
      ['Ranchi', 'Dhanbad', 'Jamshedpur', 'Bokaro', 'Hazaribagh'],
    datasets: [
      {
        label: 'Applications by District',
        data: dashboardData?.districtWise?.map(d => d.count) || [120, 190, 30, 50, 20],
        backgroundColor: theme.palette.primary.main
      }
    ]
  };
  
  if (isLoading && !dashboardData) {
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
            Error loading dashboard data: {error}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
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
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back, Admin! Here's what's happening with the Maiyya Samman Yojna
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Applications" 
              value={dashboardData?.totalApplications || '0'}
              icon={<AssignmentIcon />}
              color="primary"
              change="12% increase"
              changeDirection="up"
              subtitle="This month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Approved" 
              value={dashboardData?.approvedApplications || '0'}
              icon={<CheckCircleIcon />}
              color="success"
              change="8% increase"
              changeDirection="up"
              subtitle="Overall approval rate"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Pending" 
              value={dashboardData?.pendingApplications || '0'}
              icon={<PendingIcon />}
              color="warning"
              change="5% decrease"
              changeDirection="down"
              subtitle="Requires attention"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Rejected" 
              value={dashboardData?.rejectedApplications || '0'}
              icon={<CancelIcon />}
              color="error"
              change="3% increase"
              changeDirection="up"
              subtitle="Failed verification"
            />
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Application Trends
                </Typography>
                <IconButton 
                  size="small"
                  onClick={(e) => handleChartMenuOpen(e, 'trend')}
                >
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={applicationTrendsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Application Status
                </Typography>
                <IconButton 
                  size="small"
                  onClick={(e) => handleChartMenuOpen(e, 'status')}
                >
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut 
                  data={applicationStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  District-wise Distribution
                </Typography>
                <IconButton 
                  size="small"
                  onClick={(e) => handleChartMenuOpen(e, 'district')}
                >
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={districtWiseData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Recent Applications
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/applications')}
                >
                  View All
                </Button>
              </Box>
              <ApplicationsList applications={recentApplications} isCompact />
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Chart Menu */}
      <Menu
        anchorEl={chartMenuAnchorEl}
        open={Boolean(chartMenuAnchorEl)}
        onClose={handleChartMenuClose}
      >
        <MenuItem onClick={handleChartMenuClose}>
          Export as PNG
        </MenuItem>
        <MenuItem onClick={handleChartMenuClose}>
          Export as CSV
        </MenuItem>
        <MenuItem onClick={handleChartMenuClose}>
          Refresh Data
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleChartMenuClose}>
          View Full Report
        </MenuItem>
      </Menu>
    </Layout>
  );
};

export default Dashboard;