import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Async thunks
export const fetchBeneficiaries = createAsyncThunk(
  'beneficiaries/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`${API_URL}/admin/beneficiaries?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch beneficiaries');
    }
  }
);

export const fetchBeneficiaryById = createAsyncThunk(
  'beneficiaries/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/beneficiaries/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch beneficiary details');
    }
  }
);

export const verifyBeneficiary = createAsyncThunk(
  'beneficiaries/verify',
  async ({ beneficiaryId, verified }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/admin/beneficiaries/${beneficiaryId}/verify`, {
        verified
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify beneficiary');
    }
  }
);

export const deactivateBeneficiary = createAsyncThunk(
  'beneficiaries/deactivate',
  async ({ beneficiaryId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/admin/beneficiaries/${beneficiaryId}/status`, {
        active: false,
        reason
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate beneficiary');
    }
  }
);

export const activateBeneficiary = createAsyncThunk(
  'beneficiaries/activate',
  async (beneficiaryId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/admin/beneficiaries/${beneficiaryId}/status`, {
        active: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate beneficiary');
    }
  }
);

// Initial state
const initialState = {
  beneficiaries: [],
  currentBeneficiary: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  filters: {
    district: '',
    block: '',
    isVerified: '',
    isActive: '',
    search: ''
  },
  loading: false,
  error: null,
  success: false,
  successMessage: ''
};

// Create slice
const beneficiariesSlice = createSlice({
  name: 'beneficiaries',
  initialState,
  reducers: {
    clearBeneficiaryError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.success = false;
      state.successMessage = '';
    },
    updateBeneficiaryFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    resetCurrentBeneficiary: (state) => {
      state.currentBeneficiary = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch beneficiaries
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.loading = false;
        state.beneficiaries = action.payload.beneficiaries;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch beneficiary by ID
      .addCase(fetchBeneficiaryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeneficiaryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBeneficiary = action.payload;
      })
      .addCase(fetchBeneficiaryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify beneficiary
      .addCase(verifyBeneficiary.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyBeneficiary.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = `Beneficiary ${action.payload.verified ? 'verified' : 'unverified'} successfully`;
        
        // Update beneficiary in the list if it exists
        if (state.currentBeneficiary && state.currentBeneficiary._id === action.payload._id) {
          state.currentBeneficiary = action.payload;
        }
        
        // Update in beneficiaries list if it exists
        const index = state.beneficiaries.findIndex(ben => ben._id === action.payload._id);
        if (index !== -1) {
          state.beneficiaries[index] = action.payload;
        }
      })
      .addCase(verifyBeneficiary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Deactivate beneficiary
      .addCase(deactivateBeneficiary.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deactivateBeneficiary.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Beneficiary deactivated successfully';
        
        // Update beneficiary in the list if it exists
        if (state.currentBeneficiary && state.currentBeneficiary._id === action.payload._id) {
          state.currentBeneficiary = action.payload;
        }
        
        // Update in beneficiaries list if it exists
        const index = state.beneficiaries.findIndex(ben => ben._id === action.payload._id);
        if (index !== -1) {
          state.beneficiaries[index] = action.payload;
        }
      })
      .addCase(deactivateBeneficiary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Activate beneficiary
      .addCase(activateBeneficiary.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(activateBeneficiary.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Beneficiary activated successfully';
        
        // Update beneficiary in the list if it exists
        if (state.currentBeneficiary && state.currentBeneficiary._id === action.payload._id) {
          state.currentBeneficiary = action.payload;
        }
        
        // Update in beneficiaries list if it exists
        const index = state.beneficiaries.findIndex(ben => ben._id === action.payload._id);
        if (index !== -1) {
          state.beneficiaries[index] = action.payload;
        }
      })
      .addCase(activateBeneficiary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { 
  clearBeneficiaryError, 
  clearSuccessMessage, 
  updateBeneficiaryFilters,
  resetCurrentBeneficiary
} = beneficiariesSlice.actions;

export default beneficiariesSlice.reducer;

// Selectors
export const selectBeneficiaries = (state) => state.beneficiaries.beneficiaries;
export const selectCurrentBeneficiary = (state) => state.beneficiaries.currentBeneficiary;
export const selectBeneficiaryLoading = (state) => state.beneficiaries.loading;
export const selectBeneficiaryError = (state) => state.beneficiaries.error;
export const selectBeneficiarySuccess = (state) => state.beneficiaries.success;
export const selectBeneficiarySuccessMessage = (state) => state.beneficiaries.successMessage;
export const selectBeneficiaryPagination = (state) => state.beneficiaries.pagination;
export const selectBeneficiaryFilters = (state) => state.beneficiaries.filters;