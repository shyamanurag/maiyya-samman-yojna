import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import applicationReducer from './slices/applicationSlice';
import dashboardReducer from './slices/dashboardSlice';
import analyticsReducer from './slices/analyticsSlice';
import uiReducer from './slices/uiSlice';
import beneficiariesReducer from './slices/beneficiariesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    applications: applicationReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
    beneficiaries: beneficiariesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;