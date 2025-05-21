import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Switch,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  InputLabel
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Notifications as NotificationsIcon,
  Translate as TranslateIcon,
  Security as SecurityIcon,
  Storage as DatabaseIcon,
  AccountCircle as UserIcon,
  Backup as BackupIcon,
  Sms as SmsIcon,
  Email as EmailIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Components
import Layout from '../components/layout/Layout';

// Redux
import { 
  toggleDarkMode, 
  setLanguage, 
  updateNotificationSettings,
  selectDarkMode, 
  selectLanguage,
  selectNotificationSettings
} from '../store/slices/uiSlice';
import { updateSystemSettings, selectSystemSettings } from '../store/slices/applicationSlice';

const Settings = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const darkMode = useSelector(selectDarkMode);
  const language = useSelector(selectLanguage);
  const notificationSettings = useSelector(selectNotificationSettings);
  const systemSettings = useSelector(selectSystemSettings);
  
  // Local state
  const [activeSection, setActiveSection] = useState('appearance');
  const [successMessage, setSuccessMessage] = useState('');
  const [formValues, setFormValues] = useState({
    // System settings
    applicationIdPrefix: systemSettings?.applicationIdPrefix || 'MSY',
    maxApplicationsPerUser: systemSettings?.maxApplicationsPerUser || 1,
    enableFraudDetection: systemSettings?.enableFraudDetection ?? true,
    enableAadhaarVerification: systemSettings?.enableAadhaarVerification ?? true,
    
    // Notification settings
    emailNotifications: notificationSettings?.emailNotifications ?? true,
    smsNotifications: notificationSettings?.smsNotifications ?? true,
    applicationStatusUpdates: notificationSettings?.applicationStatusUpdates ?? true,
    adminAlerts: notificationSettings?.adminAlerts ?? true
  });
  
  // Navigation items
  const settingsSections = [
    { id: 'appearance', label: 'Appearance', icon: <DarkModeIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    { id: 'language', label: 'Language', icon: <TranslateIcon /> },
    { id: 'system', label: 'System Settings', icon: <DatabaseIcon /> },
    { id: 'security', label: 'Security', icon: <SecurityIcon /> },
    { id: 'backup', label: 'Backup & Restore', icon: <BackupIcon /> },
    { id: 'communication', label: 'Communication', icon: <SmsIcon /> }
  ];
  
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };
  
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode());
  };
  
  const handleLanguageChange = (event) => {
    dispatch(setLanguage(event.target.value));
  };
  
  const handleNotificationSettingChange = (setting) => (event) => {
    const updatedSettings = {
      ...formValues,
      [setting]: event.target.checked
    };
    
    setFormValues(updatedSettings);
  };
  
  const handleSaveNotificationSettings = () => {
    dispatch(updateNotificationSettings({
      emailNotifications: formValues.emailNotifications,
      smsNotifications: formValues.smsNotifications,
      applicationStatusUpdates: formValues.applicationStatusUpdates,
      adminAlerts: formValues.adminAlerts
    }));
    
    setSuccessMessage('Notification settings saved successfully');
  };
  
  const handleSaveSystemSettings = () => {
    dispatch(updateSystemSettings({
      applicationIdPrefix: formValues.applicationIdPrefix,
      maxApplicationsPerUser: parseInt(formValues.maxApplicationsPerUser),
      enableFraudDetection: formValues.enableFraudDetection,
      enableAadhaarVerification: formValues.enableAadhaarVerification
    }));
    
    setSuccessMessage('System settings saved successfully');
  };
  
  const renderAppearanceSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Appearance Settings
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <List disablePadding>
            <ListItem>
              <ListItemIcon>
                <DarkModeIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Dark Mode" 
                secondary="Use dark theme across the application"
              />
              <Switch
                edge="end"
                checked={darkMode}
                onChange={handleDarkModeToggle}
                inputProps={{
                  'aria-labelledby': 'dark-mode-toggle',
                }}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <TranslateIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Language" 
                secondary="Select your preferred language"
              />
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  size="small"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
        </CardContent>
      </Card>
      
      <Typography variant="h6" gutterBottom>
        Theme Customization
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Theme customization will be available in a future update.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderNotificationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notification Settings
      </Typography>
      <Card>
        <CardContent>
          <List disablePadding>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Email Notifications" 
                secondary="Receive notifications via email"
              />
              <Switch
                edge="end"
                checked={formValues.emailNotifications}
                onChange={handleNotificationSettingChange('emailNotifications')}
                inputProps={{
                  'aria-labelledby': 'email-notifications-toggle',
                }}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <SmsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="SMS Notifications" 
                secondary="Receive notifications via SMS"
              />
              <Switch
                edge="end"
                checked={formValues.smsNotifications}
                onChange={handleNotificationSettingChange('smsNotifications')}
                inputProps={{
                  'aria-labelledby': 'sms-notifications-toggle',
                }}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Application Status Updates" 
                secondary="Get notified when application status changes"
              />
              <Switch
                edge="end"
                checked={formValues.applicationStatusUpdates}
                onChange={handleNotificationSettingChange('applicationStatusUpdates')}
                inputProps={{
                  'aria-labelledby': 'status-updates-toggle',
                }}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Admin Alerts" 
                secondary="Important system notifications for administrators"
              />
              <Switch
                edge="end"
                checked={formValues.adminAlerts}
                onChange={handleNotificationSettingChange('adminAlerts')}
                inputProps={{
                  'aria-labelledby': 'admin-alerts-toggle',
                }}
              />
            </ListItem>
          </List>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSaveNotificationSettings}
            >
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderSystemSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Settings
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="applicationIdPrefix"
                label="Application ID Prefix"
                fullWidth
                value={formValues.applicationIdPrefix}
                onChange={handleInputChange}
                helperText="Prefix used for all application IDs"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxApplicationsPerUser"
                label="Max Applications Per User"
                fullWidth
                type="number"
                value={formValues.maxApplicationsPerUser}
                onChange={handleInputChange}
                helperText="Maximum number of applications allowed per user"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.enableFraudDetection}
                    onChange={(e) => handleInputChange({
                      target: {
                        name: 'enableFraudDetection',
                        checked: e.target.checked,
                        type: 'checkbox'
                      }
                    })}
                  />
                }
                label="Enable Fraud Detection"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.enableAadhaarVerification}
                    onChange={(e) => handleInputChange({
                      target: {
                        name: 'enableAadhaarVerification',
                        checked: e.target.checked,
                        type: 'checkbox'
                      }
                    })}
                  />
                }
                label="Enable Aadhaar Verification"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSaveSystemSettings}
            >
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderSecuritySettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Security settings can be configured by administrators only.
          </Alert>
          
          <List disablePadding>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Two-Factor Authentication" 
                secondary="Require 2FA for all admin accounts"
              />
              <Switch
                edge="end"
                disabled
                checked={true}
                inputProps={{
                  'aria-labelledby': '2fa-toggle',
                }}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Session Timeout" 
                secondary="Automatically log out inactive users"
              />
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={30}
                  size="small"
                  disabled
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderBackupSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Backup & Restore
      </Typography>
      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Backup and restore functionality is restricted to system administrators.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button 
                variant="outlined" 
                fullWidth
                startIcon={<BackupIcon />}
                disabled
              >
                Create Backup
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                variant="outlined" 
                fullWidth
                color="secondary"
                disabled
              >
                Restore from Backup
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderCommunicationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Communication Settings
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="SMTP Server"
                fullWidth
                disabled
                value="smtp.example.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="SMTP Port"
                fullWidth
                disabled
                value="587"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="SMTP Username"
                fullWidth
                disabled
                value="notifications@example.com"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="SMS Gateway API Endpoint"
                fullWidth
                disabled
                value="https://api.smsgateway.com/v1/send"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              Communication settings can only be configured by system administrators.
            </Alert>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderLanguageSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Language Settings
      </Typography>
      <Card>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="language-select-label">Default Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              onChange={handleLanguageChange}
              label="Default Language"
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle2" gutterBottom>
            Available Languages
          </Typography>
          <List disablePadding>
            <ListItem>
              <ListItemIcon>
                <TranslateIcon />
              </ListItemIcon>
              <ListItemText 
                primary="English" 
                secondary="Default language"
              />
              <ListItemText 
                primary="100%" 
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <TranslateIcon />
              </ListItemIcon>
              <ListItemText 
                primary="हिंदी (Hindi)" 
                secondary="Complete translation"
              />
              <ListItemText 
                primary="100%" 
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  // Render appropriate settings section based on activeSection
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'system':
        return renderSystemSettings();
      case 'security':
        return renderSecuritySettings();
      case 'backup':
        return renderBackupSettings();
      case 'communication':
        return renderCommunicationSettings();
      case 'language':
        return renderLanguageSettings();
      default:
        return renderAppearanceSettings();
    }
  };
  
  return (
    <Layout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Grid container spacing={3}>
          {/* Left sidebar navigation */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ height: '100%' }}>
              <List component="nav" aria-label="settings sections">
                {settingsSections.map((section) => (
                  <ListItemButton
                    key={section.id}
                    selected={activeSection === section.id}
                    onClick={() => handleSectionChange(section.id)}
                  >
                    <ListItemIcon>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText primary={section.label} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Main content area */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 3 }}>
              {renderActiveSection()}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Success message */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          message={successMessage}
        />
      </Box>
    </Layout>
  );
};

export default Settings;