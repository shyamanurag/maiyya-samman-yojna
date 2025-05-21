import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

// Generate chart data for the last 6 months
const generateMockTrendData = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  months.forEach(month => {
    data.push({
      month,
      applications: Math.floor(Math.random() * 100) + 20,
      approved: Math.floor(Math.random() * 60) + 10,
      rejected: Math.floor(Math.random() * 20) + 5
    });
  });
  
  return data;
};

// Initial state
const initialState = {
  stats: {
    totalApplications: 0,
    pendingVerification: 0,
    approved: 0,
    rejected: 0,
    approvalRate: 0,
    rejectionRate: 0
  },
  applications: [],
  districtData: [],
  blockData: [],
  trendData: generateMockTrendData(),
  loading: false,
  error: null
};

// Create slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update statistics
        state.stats = {
          totalApplications: action.payload.totalApplications || 0,
          pendingVerification: action.payload.statusCounts?.pending || 0,
          approved: action.payload.statusCounts?.approved || 0,
          rejected: action.payload.statusCounts?.rejected || 0,
          approvalRate: action.payload.totalApplications > 0 
            ? Math.round((action.payload.statusCounts?.approved / action.payload.totalApplications) * 100) 
            : 0,
          rejectionRate: action.payload.totalApplications > 0 
            ? Math.round((action.payload.statusCounts?.rejected / action.payload.totalApplications) * 100) 
            : 0
        };
        
        // Get district data if available
        if (action.payload.districtData) {
          state.districtData = action.payload.districtData;
        }
        
        // Recent applications
        if (action.payload.recentApplications) {
          state.applications = action.payload.recentApplications;
        }
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Selectors
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectDashboardApplications = (state) => state.dashboard.applications;
export const selectDashboardDistrictData = (state) => state.dashboard.districtData;
export const selectDashboardBlockData = (state) => state.dashboard.blockData;
export const selectDashboardTrendData = (state) => state.dashboard.trendData;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;