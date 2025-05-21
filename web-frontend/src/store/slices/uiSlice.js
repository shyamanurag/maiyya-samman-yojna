import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  language: localStorage.getItem('language') || 'en',
  notifications: [],
  confirmDialog: {
    open: false,
    title: '',
    message: '',
    confirmAction: null,
    cancelAction: null
  },
  toast: {
    open: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    duration: 3000
  }
};

// Create slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        read: false,
        ...action.payload,
        timestamp: new Date().toISOString()
      });
    },
    markNotificationAsRead: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        state.notifications[index].read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    showConfirmDialog: (state, action) => {
      state.confirmDialog = {
        open: true,
        title: action.payload.title || 'Confirm Action',
        message: action.payload.message || 'Are you sure you want to proceed?',
        confirmAction: action.payload.confirmAction,
        cancelAction: action.payload.cancelAction
      };
    },
    hideConfirmDialog: (state) => {
      state.confirmDialog = {
        ...state.confirmDialog,
        open: false
      };
    },
    showToast: (state, action) => {
      state.toast = {
        open: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 3000
      };
    },
    hideToast: (state) => {
      state.toast = {
        ...state.toast,
        open: false
      };
    }
  }
});

export const {
  toggleSidebar,
  toggleDarkMode,
  setLanguage,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  showConfirmDialog,
  hideConfirmDialog,
  showToast,
  hideToast
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectLanguage = (state) => state.ui.language;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotificationsCount = (state) => 
  state.ui.notifications.filter(n => !n.read).length;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;
export const selectToast = (state) => state.ui.toast;