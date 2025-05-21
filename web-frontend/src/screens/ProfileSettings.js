import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoCameraIcon,
  AccountCircle as AccountCircleIcon,
  Lock as LockIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// Components
import Layout from '../components/layout/Layout';

// Redux
import { 
  updateUserProfile, 
  changePassword,
  verifyPasswordReset,
  selectUser, 
  selectAuthLoading, 
  selectAuthError 
} from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    designation: '',
    department: '',
    employeeId: '',
    profileImage: null
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        designation: user.designation || '',
        department: user.department || '',
        employeeId: user.employeeId || '',
        profileImage: null
      });
    }
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleTogglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        profileImage: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (profileData.phoneNumber && !/^\d{10}$/.test(profileData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (key === 'profileImage' && profileData[key]) {
          formData.append(key, profileData[key]);
        } else if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });
      
      await dispatch(updateUserProfile(formData)).unwrap();
      
      dispatch(showToast({
        message: 'Profile updated successfully',
        type: 'success'
      }));
    } catch (err) {
      // Error is handled by the slice
    }
  };
  
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      dispatch(showToast({
        message: 'Password updated successfully',
        type: 'success'
      }));
    } catch (err) {
      // Error is handled by the slice
    }
  };
  
  const handleInitiatePasswordReset = () => {
    setShowConfirmDialog(true);
  };
  
  const handleConfirmPasswordReset = async () => {
    try {
      await dispatch(verifyPasswordReset({
        email: user.email
      })).unwrap();
      
      setShowConfirmDialog(false);
      
      dispatch(showToast({
        message: 'Password reset email sent successfully',
        type: 'success'
      }));
    } catch (err) {
      // Error is handled by the slice
    }
  };
  
  return (
    <Layout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<AccountCircleIcon />} label="Profile" />
            <Tab icon={<LockIcon />} label="Security" />
            <Tab icon={<HistoryIcon />} label="Activity Log" />
          </Tabs>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Profile Picture */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={imagePreview || user?.profilePic}
                  alt={user?.name}
                  sx={{ width: 150, height: 150, mb: 2 }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                  >
                    Change Photo
                  </Button>
                </label>
                
                <Box sx={{ mt: 3, width: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Account Information
                  </Typography>
                  <Box sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body1">
                      {user?.id || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1">
                      {user?.role || 'Administrator'}
                    </Typography>
                  </Box>
                  <Box sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Account Created
                    </Typography>
                    <Typography variant="body1">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            {/* Profile Details */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Full Name"
                      value={profileData.name}
                      onChange={handleProfileInputChange}
                      fullWidth
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="email"
                      label="Email Address"
                      value={profileData.email}
                      onChange={handleProfileInputChange}
                      fullWidth
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="phoneNumber"
                      label="Phone Number"
                      value={profileData.phoneNumber}
                      onChange={handleProfileInputChange}
                      fullWidth
                      error={!!formErrors.phoneNumber}
                      helperText={formErrors.phoneNumber}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Work Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="designation"
                      label="Designation"
                      value={profileData.designation}
                      onChange={handleProfileInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="department"
                      label="Department"
                      value={profileData.department}
                      onChange={handleProfileInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="employeeId"
                      label="Employee ID"
                      value={profileData.employeeId}
                      onChange={handleProfileInputChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={isLoading ? <CircularProgress size={24} /> : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {/* Password Change */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="currentPassword"
                      label="Current Password"
                      type={showPassword.currentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      fullWidth
                      error={!!formErrors.currentPassword}
                      helperText={formErrors.currentPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => handleTogglePasswordVisibility('currentPassword')}
                              edge="end"
                            >
                              {showPassword.currentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="newPassword"
                      label="New Password"
                      type={showPassword.newPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      fullWidth
                      error={!!formErrors.newPassword}
                      helperText={formErrors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => handleTogglePasswordVisibility('newPassword')}
                              edge="end"
                            >
                              {showPassword.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showPassword.confirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      fullWidth
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => handleTogglePasswordVisibility('confirmPassword')}
                              edge="end"
                            >
                              {showPassword.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={isLoading ? <CircularProgress size={24} /> : <SaveIcon />}
                    onClick={handleChangePassword}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* Security Settings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Forgot Password
                    </Typography>
                    <Typography variant="body2" paragraph>
                      If you've forgotten your password, you can request a password reset. A reset link will be sent to your email address.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleInitiatePasswordReset}
                    >
                      Reset Password
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Two-Factor Authentication
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Two-factor authentication is currently disabled. Enable it to add an extra layer of security to your account.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      disabled
                    >
                      Enable 2FA
                    </Button>
                  </CardContent>
                </Card>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {tabValue === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Log
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your account activity will be displayed here.
            </Alert>
            
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Last Login
                </Typography>
                <Typography variant="body2">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activity log data will be available in a future update.
            </Typography>
          </Paper>
        )}
      </Box>
      
      {/* Password Reset Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Confirm Password Reset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset your password? A reset link will be sent to your email address: {user?.email}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmPasswordReset} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ProfileSettings;