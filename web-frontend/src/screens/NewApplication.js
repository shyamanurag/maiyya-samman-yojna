import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Grid,
  Paper,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  MenuItem,
  InputLabel,
  Select,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { MuiFileInput } from 'mui-file-input';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from '../components/layout/Layout';
import { 
  createApplication, 
  selectApplicationSubmitting, 
  selectApplicationSubmitError 
} from '../store/slices/applicationSlice';
import { showToast } from '../store/slices/uiSlice';

const steps = [
  'Personal Information',
  'Address Details',
  'Bank & ID Details',
  'Document Upload',
  'Review & Submit'
];

const districts = [
  'Ranchi', 'Dhanbad', 'Jamshedpur', 'Bokaro', 'Hazaribagh', 'Giridih',
  'Deoghar', 'Dumka', 'Godda', 'Koderma', 'Chatra', 'Lohardaga'
];

const requiredDocuments = [
  { id: 'aadhaar', name: 'Aadhaar Card', required: true },
  { id: 'incomeProof', name: 'Income Certificate', required: true },
  { id: 'bankStatement', name: 'Bank Statement', required: true },
  { id: 'photograph', name: 'Recent Photograph', required: true },
  { id: 'residenceProof', name: 'Residence Proof', required: false },
  { id: 'otherDocuments', name: 'Other Supporting Documents', required: false }
];

const NewApplication = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isSubmitting = useSelector(selectApplicationSubmitting);
  const submitError = useSelector(selectApplicationSubmitError);
  
  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    applicantName: '',
    dateOfBirth: null,
    contactNumber: '',
    email: '',
    maritalStatus: '',
    address: '',
    district: '',
    block: '',
    village: '',
    pinCode: '',
    aadhaarNumber: '',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    monthlyIncome: '',
    documents: {}
  });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Mark field as touched
    if (!formTouched[name]) {
      setFormTouched({
        ...formTouched,
        [name]: true
      });
    }
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Handle date field changes
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
    
    // Mark field as touched
    if (!formTouched[name]) {
      setFormTouched({
        ...formTouched,
        [name]: true
      });
    }
    
    // Clear error when user changes date
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Handle file uploads
  const handleFileChange = (file, documentId) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [documentId]: file
      }
    });
    
    // Mark field as touched
    if (!formTouched[`documents.${documentId}`]) {
      setFormTouched({
        ...formTouched,
        [`documents.${documentId}`]: true
      });
    }
    
    // Clear error when user uploads a file
    if (formErrors[`documents.${documentId}`]) {
      setFormErrors({
        ...formErrors,
        [`documents.${documentId}`]: ''
      });
    }
  };
  
  // Delete an uploaded file
  const handleDeleteFile = (documentId) => {
    const updatedDocuments = { ...formData.documents };
    delete updatedDocuments[documentId];
    
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };
  
  // Validate current step
  const validateStep = () => {
    const errors = {};
    
    if (activeStep === 0) {
      // Personal Information validation
      if (!formData.applicantName.trim()) {
        errors.applicantName = 'Name is required';
      }
      
      if (!formData.dateOfBirth) {
        errors.dateOfBirth = 'Date of birth is required';
      }
      
      if (!formData.contactNumber) {
        errors.contactNumber = 'Contact number is required';
      } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
        errors.contactNumber = 'Enter a valid 10-digit contact number';
      }
      
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Enter a valid email address';
      }
      
      if (!formData.maritalStatus) {
        errors.maritalStatus = 'Marital status is required';
      }
    } 
    else if (activeStep === 1) {
      // Address Details validation
      if (!formData.address.trim()) {
        errors.address = 'Address is required';
      }
      
      if (!formData.district) {
        errors.district = 'District is required';
      }
      
      if (!formData.block.trim()) {
        errors.block = 'Block is required';
      }
      
      if (!formData.village.trim()) {
        errors.village = 'Village/Town is required';
      }
      
      if (!formData.pinCode) {
        errors.pinCode = 'PIN code is required';
      } else if (!/^[0-9]{6}$/.test(formData.pinCode)) {
        errors.pinCode = 'Enter a valid 6-digit PIN code';
      }
    } 
    else if (activeStep === 2) {
      // Bank & ID Details validation
      if (!formData.aadhaarNumber) {
        errors.aadhaarNumber = 'Aadhaar number is required';
      } else if (!/^[0-9]{12}$/.test(formData.aadhaarNumber)) {
        errors.aadhaarNumber = 'Enter a valid 12-digit Aadhaar number';
      }
      
      if (!formData.bankAccountNumber) {
        errors.bankAccountNumber = 'Bank account number is required';
      }
      
      if (!formData.bankName.trim()) {
        errors.bankName = 'Bank name is required';
      }
      
      if (!formData.ifscCode.trim()) {
        errors.ifscCode = 'IFSC code is required';
      } else if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(formData.ifscCode)) {
        errors.ifscCode = 'Enter a valid IFSC code';
      }
      
      if (!formData.monthlyIncome) {
        errors.monthlyIncome = 'Monthly income is required';
      }
    } 
    else if (activeStep === 3) {
      // Document Upload validation
      requiredDocuments.forEach(doc => {
        if (doc.required && !formData.documents[doc.id]) {
          errors[`documents.${doc.id}`] = `${doc.name} is required`;
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Create FormData for file uploads
      const applicationData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'documents') {
          if (key === 'dateOfBirth' && formData[key]) {
            applicationData.append(key, formData[key].toISOString());
          } else if (formData[key] !== null && formData[key] !== undefined) {
            applicationData.append(key, formData[key]);
          }
        }
      });
      
      // Add documents
      Object.keys(formData.documents).forEach(docId => {
        applicationData.append(`documents.${docId}`, formData.documents[docId]);
      });
      
      // Submit application
      const result = await dispatch(createApplication(applicationData)).unwrap();
      
      dispatch(showToast({
        message: 'Application submitted successfully!',
        type: 'success'
      }));
      
      // Navigate to the application details page
      navigate(`/applications/${result._id}`);
    } catch (error) {
      // Error is handled in the slice
    }
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="applicantName"
                label="Full Name"
                fullWidth
                required
                value={formData.applicantName}
                onChange={handleChange}
                error={!!formErrors.applicantName}
                helperText={formErrors.applicantName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth *"
                  value={formData.dateOfBirth}
                  onChange={(date) => handleDateChange('dateOfBirth', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth
                      error={!!formErrors.dateOfBirth}
                      helperText={formErrors.dateOfBirth}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactNumber"
                label="Contact Number"
                fullWidth
                required
                value={formData.contactNumber}
                onChange={handleChange}
                error={!!formErrors.contactNumber}
                helperText={formErrors.contactNumber}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email Address"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" required error={!!formErrors.maritalStatus}>
                <FormLabel component="legend">Marital Status</FormLabel>
                <RadioGroup
                  row
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Single" control={<Radio />} label="Single" />
                  <FormControlLabel value="Married" control={<Radio />} label="Married" />
                  <FormControlLabel value="Widowed" control={<Radio />} label="Widowed" />
                  <FormControlLabel value="Divorced" control={<Radio />} label="Divorced" />
                </RadioGroup>
                {formErrors.maritalStatus && (
                  <Typography variant="caption" color="error">
                    {formErrors.maritalStatus}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Address Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Full Address"
                fullWidth
                required
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.district}>
                <InputLabel id="district-label">District</InputLabel>
                <Select
                  labelId="district-label"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  label="District"
                >
                  {districts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.district && (
                  <Typography variant="caption" color="error">
                    {formErrors.district}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="block"
                label="Block"
                fullWidth
                required
                value={formData.block}
                onChange={handleChange}
                error={!!formErrors.block}
                helperText={formErrors.block}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="village"
                label="Village/Town"
                fullWidth
                required
                value={formData.village}
                onChange={handleChange}
                error={!!formErrors.village}
                helperText={formErrors.village}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="pinCode"
                label="PIN Code"
                fullWidth
                required
                value={formData.pinCode}
                onChange={handleChange}
                error={!!formErrors.pinCode}
                helperText={formErrors.pinCode}
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Bank & ID Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="aadhaarNumber"
                label="Aadhaar Number"
                fullWidth
                required
                value={formData.aadhaarNumber}
                onChange={handleChange}
                error={!!formErrors.aadhaarNumber}
                helperText={formErrors.aadhaarNumber}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Bank Details
                </Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="bankAccountNumber"
                label="Bank Account Number"
                fullWidth
                required
                value={formData.bankAccountNumber}
                onChange={handleChange}
                error={!!formErrors.bankAccountNumber}
                helperText={formErrors.bankAccountNumber}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="bankName"
                label="Bank Name"
                fullWidth
                required
                value={formData.bankName}
                onChange={handleChange}
                error={!!formErrors.bankName}
                helperText={formErrors.bankName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="ifscCode"
                label="IFSC Code"
                fullWidth
                required
                value={formData.ifscCode}
                onChange={handleChange}
                error={!!formErrors.ifscCode}
                helperText={formErrors.ifscCode}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Income Details
                </Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="monthlyIncome"
                label="Monthly Income (in ₹)"
                fullWidth
                required
                type="number"
                value={formData.monthlyIncome}
                onChange={handleChange}
                error={!!formErrors.monthlyIncome}
                helperText={formErrors.monthlyIncome}
              />
            </Grid>
          </Grid>
        );
      
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Document Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please upload clear scanned copies or photos of the following documents. 
                Documents marked with * are mandatory.
              </Typography>
            </Grid>
            
            {requiredDocuments.map((doc) => (
              <Grid item xs={12} key={doc.id}>
                <Paper
                  elevation={0}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 1 }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle1">
                        {doc.name} {doc.required && '*'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      {formData.documents[doc.id] ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {formData.documents[doc.id].name}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFile(doc.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <MuiFileInput
                          placeholder="Choose file"
                          value={null}
                          onChange={(file) => handleFileChange(file, doc.id)}
                          InputProps={{
                            startAdornment: <UploadIcon />,
                          }}
                          error={!!formErrors[`documents.${doc.id}`]}
                          helperText={formErrors[`documents.${doc.id}`]}
                          fullWidth
                        />
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        );
      
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review & Submit
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please review all information before submitting your application.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Name:</Typography>
                    <Typography variant="body1">{formData.applicantName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Date of Birth:</Typography>
                    <Typography variant="body1">
                      {formData.dateOfBirth ? formData.dateOfBirth.toLocaleDateString() : 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Contact Number:</Typography>
                    <Typography variant="body1">{formData.contactNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Email:</Typography>
                    <Typography variant="body1">{formData.email || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Marital Status:</Typography>
                    <Typography variant="body1">{formData.maritalStatus}</Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Address Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Full Address:</Typography>
                    <Typography variant="body1">{formData.address}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">District:</Typography>
                    <Typography variant="body1">{formData.district}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Block:</Typography>
                    <Typography variant="body1">{formData.block}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Village/Town:</Typography>
                    <Typography variant="body1">{formData.village}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">PIN Code:</Typography>
                    <Typography variant="body1">{formData.pinCode}</Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Bank & ID Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Aadhaar Number:</Typography>
                    <Typography variant="body1">{formData.aadhaarNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Bank Account Number:</Typography>
                    <Typography variant="body1">{formData.bankAccountNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Bank Name:</Typography>
                    <Typography variant="body1">{formData.bankName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">IFSC Code:</Typography>
                    <Typography variant="body1">{formData.ifscCode}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Monthly Income:</Typography>
                    <Typography variant="body1">₹{formData.monthlyIncome}</Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Uploaded Documents
                </Typography>
                <Grid container spacing={2}>
                  {requiredDocuments.map((doc) => (
                    <Grid item xs={12} sm={6} key={doc.id}>
                      <Typography variant="subtitle2">{doc.name}:</Typography>
                      <Typography variant="body1">
                        {formData.documents[doc.id] ? 
                          formData.documents[doc.id].name : 
                          <Typography variant="body2" color="error">Not uploaded</Typography>
                        }
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            
            {submitError && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {submitError}
                </Alert>
              </Grid>
            )}
          </Grid>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Layout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate('/applications')}
          >
            Back to Applications
          </Button>
        </Box>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            New Application
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Fill in all the required details to submit a new application
          </Typography>
          
          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 4, mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Step Content */}
          <Box sx={{ mt: 3, mb: 5 }}>
            {getStepContent(activeStep)}
          </Box>
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={<NextIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default NewApplication;