import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Async thunks
export const fetchAnalyticsData = createAsyncThunk(
  'analytics/fetchData',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Add query params for filtering
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`${API_URL}/admin/reports?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics data');
    }
  }
);

// Mock data for development
const generateMockAnalyticsData = () => {
  return {
    totalApplications: 1250,
    approvalRate: 68,
    rejectionRate: 12,
    pendingCount: 250,
    trend: Array(6).fill().map((_, i) => ({
      date: `2025-${i + 1}`,
      count: Math.floor(Math.random() * 100) + 50
    })),
    statusCounts: {
      pending: 250,
      approved: 850,
      rejected: 150
    },
    districts: [
      { name: 'Ranchi', count: 320 },
      { name: 'Dhanbad', count: 280 },
      { name: 'Jamshedpur', count: 220 },
      { name: 'Bokaro', count: 180 },
      { name: 'Hazaribagh', count: 130 },
      { name: 'Deoghar', count: 120 }
    ]
  };
};

// Initial state
const initialState = {
  analyticsData: generateMockAnalyticsData(),
  loading: false,
  error: null,
  timeRange: 'month',
  districtFilter: 'all',
  reportType: 'summary'
};

// Create slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
    setDistrictFilter: (state, action) => {
      state.districtFilter = action.payload;
    },
    setReportType: (state, action) => {
      state.reportType = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.loading = false;
        
        // Format the data based on report type
        if (action.payload.type === 'Summary Report') {
          state.analyticsData = {
            totalApplications: action.payload.data.total || 0,
            approvalRate: action.payload.data.approvalRate || 0,
            rejectionRate: action.payload.data.rejectionRate || 0,
            pendingCount: action.payload.data.pending || 0,
            statusCounts: {
              pending: action.payload.data.pending || 0,
              approved: action.payload.data.approved || 0,
              rejected: action.payload.data.rejected || 0
            },
            // Keep existing trend and district data if not provided
            trend: state.analyticsData.trend,
            districts: state.analyticsData.districts
          };
        } else if (action.payload.type === 'Time Report') {
          // Format time report data for chart
          const trend = action.payload.data.map(item => ({
            date: new Date(item.date).toLocaleDateString(),
            count: item.count
          }));
          
          state.analyticsData = {
            ...state.analyticsData,
            trend
          };
        } else if (action.payload.type === 'District Report') {
          // Format district report data for chart
          const districts = action.payload.data.map(item => ({
            name: item.district,
            count: item.count
          }));
          
          state.analyticsData = {
            ...state.analyticsData,
            districts
          };
        } else if (action.payload.type === 'Status Report') {
          // Format status report data
          const statusData = action.payload.data.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
          }, {});
          
          state.analyticsData = {
            ...state.analyticsData,
            statusCounts: {
              pending: statusData.pending || 0,
              approved: statusData.approved || 0,
              rejected: statusData.rejected || 0
            }
          };
        }
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearAnalyticsError,
  setTimeRange,
  setDistrictFilter,
  setReportType
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

// Selectors
export const selectAnalyticsData = (state) => state.analytics.analyticsData;
export const selectAnalyticsLoading = (state) => state.analytics.loading;
export const selectAnalyticsError = (state) => state.analytics.error;
export const selectAnalyticsTimeRange = (state) => state.analytics.timeRange;
export const selectAnalyticsDistrictFilter = (state) => state.analytics.districtFilter;
export const selectAnalyticsReportType = (state) => state.analytics.reportType;