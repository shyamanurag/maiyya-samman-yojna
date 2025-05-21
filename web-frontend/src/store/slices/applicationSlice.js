import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Async thunks
export const fetchApplications = createAsyncThunk(
  'applications/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`${API_URL}/admin/applications?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  'applications/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/applications/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch application details');
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ applicationId, status, notes }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/admin/applications/${applicationId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update application status');
    }
  }
);

export const fetchVerificationQueue = createAsyncThunk(
  'applications/fetchQueue',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add params to query params
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`${API_URL}/admin/verification-queue?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch verification queue');
    }
  }
);

export const submitNewApplication = createAsyncThunk(
  'applications/submit',
  async (applicationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/applications/submit`, applicationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit application');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'applications/uploadDocument',
  async ({ applicationId, documentData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/applications/my-applications/${applicationId}/documents`, 
        documentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

// Initial state
const initialState = {
  applications: [],
  currentApplication: null,
  verificationQueue: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  filters: {
    status: 'all',
    district: '',
    block: '',
    search: ''
  },
  loading: false,
  error: null,
  success: false,
  successMessage: ''
};

// Create slice
const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearApplicationError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.success = false;
      state.successMessage = '';
    },
    updateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    resetCurrentApplication: (state) => {
      state.currentApplication = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch applications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.applications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch application by ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update application status
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Application status updated successfully';
        
        // Update application in the list if it exists
        if (state.currentApplication && state.currentApplication._id === action.payload.application._id) {
          state.currentApplication = action.payload.application;
        }
        
        // Update in applications list if it exists
        const index = state.applications.findIndex(app => app._id === action.payload.application._id);
        if (index !== -1) {
          state.applications[index] = action.payload.application;
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch verification queue
      .addCase(fetchVerificationQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerificationQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationQueue = action.payload.applications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVerificationQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit new application
      .addCase(submitNewApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitNewApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Application submitted successfully';
        state.currentApplication = action.payload.application;
      })
      .addCase(submitNewApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Document uploaded successfully';
        
        // Update current application if it matches
        if (state.currentApplication && 
            state.currentApplication._id === action.payload.application._id) {
          state.currentApplication = action.payload.application;
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearApplicationError, 
  clearSuccessMessage, 
  updateFilters,
  resetCurrentApplication
} = applicationSlice.actions;

export default applicationSlice.reducer;

// Selectors
export const selectApplications = (state) => state.applications.applications;
export const selectCurrentApplication = (state) => state.applications.currentApplication;
export const selectVerificationQueue = (state) => state.applications.verificationQueue;
export const selectApplicationLoading = (state) => state.applications.loading;
export const selectApplicationError = (state) => state.applications.error;
export const selectApplicationSuccess = (state) => state.applications.success;
export const selectApplicationSuccessMessage = (state) => state.applications.successMessage;
export const selectApplicationPagination = (state) => state.applications.pagination;
export const selectApplicationFilters = (state) => state.applications.filters;