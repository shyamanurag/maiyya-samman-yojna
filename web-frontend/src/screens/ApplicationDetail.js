import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  History as HistoryIcon,
  Assignment as DocumentIcon,
  Person as PersonIcon,
  Home as AddressIcon,
  AccountBalance as BankIcon,
  CreditCard as AadhaarIcon,
  AttachFile as AttachmentIcon,
  Warning as FraudWarningIcon,
  FlagCircle as FlagIcon,
  Comment as CommentIcon,
  Send as SendIcon
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import { 
  fetchApplicationDetails, 
  updateApplicationStatus, 
  deleteApplication,
  addApplicationComment,
  selectApplicationDetails,
  selectApplicationLoading,
  selectApplicationError
} from '../store/slices/applicationSlice';
import { showConfirmDialog, showToast } from '../store/slices/uiSlice';

// Status colors and labels
const statusColors = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  INCOMPLETE: 'default'
};

const statusLabels = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  INCOMPLETE: 'Incomplete'
};

// Application status steps
const applicationSteps = [
  'Application Submitted',
  'Document Verification',
  'Eligibility Check',
  'Final Decision'
];

const getStepPosition = (status) => {
  switch (status) {
    case 'APPROVED':
      return 3;
    case 'REJECTED':
      return 3;
    case 'UNDER_REVIEW':
      return 2;
    case 'PENDING':
      return 1;
    case 'INCOMPLETE':
    default:
      return 0;
  }
};

const ApplicationDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const applicationDetails = useSelector(selectApplicationDetails);
  const isLoading = useSelector(selectApplicationLoading);
  const error = useSelector(selectApplicationError);
  
  const [tabValue, setTabValue] = useState(0);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [viewingAttachment, setViewingAttachment] = useState(null);
  
  useEffect(() => {
    if (applicationId) {
      dispatch(fetchApplicationDetails(applicationId));
    }
  }, [dispatch, applicationId]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleUpdateStatus = (newStatus) => {
    dispatch(showConfirmDialog({
      title: `Change status to ${statusLabels[newStatus]}?`,
      message: `Are you sure you want to change the status of this application to ${statusLabels[newStatus]}?`,
      confirmAction: () => {
        dispatch(updateApplicationStatus({ 
          applicationId, 
          status: newStatus 
        })).unwrap().then(() => {
          dispatch(showToast({
            message: `Application status updated to ${statusLabels[newStatus]}`,
            type: 'success'
          }));
        });
      }
    }));
  };
  
  const handleDelete = () => {
    dispatch(showConfirmDialog({
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application? This action cannot be undone.',
      confirmAction: () => {
        dispatch(deleteApplication(applicationId)).unwrap().then(() => {
          dispatch(showToast({
            message: 'Application deleted successfully',
            type: 'success'
          }));
          navigate('/applications');
        });
      }
    }));
  };
  
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    dispatch(addApplicationComment({
      applicationId,
      comment: commentText
    })).unwrap().then(() => {
      setCommentText('');
      setCommentDialogOpen(false);
      dispatch(showToast({
        message: 'Comment added successfully',
        type: 'success'
      }));
    });
  };
  
  const handleViewAttachment = (attachment) => {
    setViewingAttachment(attachment);
  };
  
  if (isLoading && !applicationDetails) {
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
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate('/applications')} 
            sx={{ mb: 3 }}
          >
            Back to Applications
          </Button>
          <Typography color="error" variant="h6">
            Error loading application details: {error}
          </Typography>
        </Box>
      </Layout>
    );
  }
  
  if (!applicationDetails) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate('/applications')} 
            sx={{ mb: 3 }}
          >
            Back to Applications
          </Button>
          <Typography variant="h6">
            Application not found
          </Typography>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header with back button and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate('/applications')}
          >
            Back to Applications
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={() => navigate(`/applications/edit/${applicationId}`)}
            >
              Edit
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />}
              onClick={() => navigate(`/applications/print/${applicationId}`)}
            >
              Print
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>
        
        {/* Application header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h1">
                Application {applicationDetails.applicationId || applicationDetails._id.slice(-8).toUpperCase()}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Submitted on {new Date(applicationDetails.createdAt).toLocaleDateString()}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mr: 2 }}>
                  Status:
                </Typography>
                <Chip 
                  label={statusLabels[applicationDetails.status] || applicationDetails.status} 
                  color={statusColors[applicationDetails.status] || 'default'} 
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Actions:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<ApproveIcon />}
                    disabled={applicationDetails.status === 'APPROVED'}
                    onClick={() => handleUpdateStatus('APPROVED')}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<RejectIcon />}
                    disabled={applicationDetails.status === 'REJECTED'}
                    onClick={() => handleUpdateStatus('REJECTED')}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="contained" 
                    color="info" 
                    startIcon={<HistoryIcon />}
                    disabled={applicationDetails.status === 'UNDER_REVIEW'}
                    onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                  >
                    Review
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Application Progress */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <Stepper activeStep={getStepPosition(applicationDetails.status)} alternativeLabel>
              {applicationSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          {/* Fraud Detection Warnings */}
          {applicationDetails.fraudWarnings && applicationDetails.fraudWarnings.length > 0 && (
            <Alert 
              severity="warning" 
              icon={<FraudWarningIcon />}
              sx={{ mt: 2 }}
            >
              <Typography variant="subtitle2">
                Potential fraud detected! Please review carefully.
              </Typography>
              <List dense>
                {applicationDetails.fraudWarnings.map((warning, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <FlagIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={warning} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}
        </Paper>
        
        {/* Application Details Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Applicant Details" />
            <Tab label="Documents" />
            <Tab label="History & Comments" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {/* Applicant Details Tab */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Personal Information</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Avatar 
                          src={applicationDetails.applicantPhoto} 
                          alt={applicationDetails.applicantName}
                          sx={{ width: 120, height: 120 }}
                        >
                          {applicationDetails.applicantName?.[0]}
                        </Avatar>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.applicantName}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Date of Birth
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.dateOfBirth ? new Date(applicationDetails.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Contact Number
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.contactNumber || 'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.email || 'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Marital Status
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.maritalStatus || 'Not provided'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AddressIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Address & Location</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        Full Address
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.address || 'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        District
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.district || 'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Block
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.block || 'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Village/Town
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.village || 'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        PIN Code
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.pinCode || 'Not provided'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AadhaarIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Identification</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        Aadhaar Number
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.aadhaarNumber ? 
                          `XXXX-XXXX-${applicationDetails.aadhaarNumber.slice(-4)}` : 
                          'Not provided'}
                      </Typography>
                      
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Chip 
                          label={applicationDetails.aadhaarVerified ? "Aadhaar Verified" : "Aadhaar Not Verified"} 
                          color={applicationDetails.aadhaarVerified ? "success" : "warning"} 
                          size="small" 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BankIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Bank Details</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        Account Number
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.bankAccountNumber ? 
                          `XXXX-XXXX-${applicationDetails.bankAccountNumber.slice(-4)}` : 
                          'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Bank Name
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.bankName || 'Not provided'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        IFSC Code
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {applicationDetails.ifscCode || 'Not provided'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Documents Tab */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                {applicationDetails.documents && applicationDetails.documents.length > 0 ? (
                  applicationDetails.documents.map((doc, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DocumentIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6">{doc.type}</Typography>
                            </Box>
                            <Tooltip title="View Document">
                              <IconButton onClick={() => handleViewAttachment(doc)}>
                                <AttachmentIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          
                          <Box 
                            sx={{ 
                              height: 180, 
                              backgroundImage: `url(${doc.url})`,
                              backgroundSize: 'contain',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              backgroundColor: '#f5f5f5',
                              mb: 2
                            }} 
                          />
                          
                          <Typography variant="body2" color="text.secondary">
                            Uploaded on: {new Date(doc.uploadedAt || applicationDetails.createdAt).toLocaleDateString()}
                          </Typography>
                          
                          <Box sx={{ mt: 2 }}>
                            <Chip 
                              label={doc.verified ? "Verified" : "Not Verified"} 
                              color={doc.verified ? "success" : "default"} 
                              size="small" 
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      No documents uploaded for this application.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            )}
            
            {/* History & Comments Tab */}
            {tabValue === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Application History & Comments
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<CommentIcon />}
                    onClick={() => setCommentDialogOpen(true)}
                  >
                    Add Comment
                  </Button>
                </Box>
                
                {applicationDetails.history && applicationDetails.history.length > 0 ? (
                  <List>
                    {applicationDetails.history.map((item, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                          <ListItemIcon>
                            {item.type === 'status_change' ? (
                              <HistoryIcon color="primary" />
                            ) : item.type === 'comment' ? (
                              <CommentIcon color="secondary" />
                            ) : (
                              <FlagIcon color="info" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1">
                                  {item.type === 'status_change' 
                                    ? `Status changed to ${statusLabels[item.newStatus]}` 
                                    : item.type === 'comment'
                                      ? 'Comment added'
                                      : item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(item.timestamp).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {item.description || item.comment}
                                </Typography>
                                {item.by && (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{ display: 'block', mt: 1 }}
                                  >
                                    — By {item.by}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        {index < applicationDetails.history.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No history or comments available for this application.
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      
      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Comment"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddComment} 
            variant="contained" 
            startIcon={<SendIcon />}
            disabled={!commentText.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Document Viewer Dialog */}
      <Dialog 
        open={Boolean(viewingAttachment)} 
        onClose={() => setViewingAttachment(null)}
        maxWidth="md"
        fullWidth
      >
        {viewingAttachment && (
          <>
            <DialogTitle>{viewingAttachment.type}</DialogTitle>
            <DialogContent>
              <Box 
                component="img"
                src={viewingAttachment.url}
                alt={viewingAttachment.type}
                sx={{ 
                  width: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewingAttachment(null)}>Close</Button>
              <Button 
                component="a" 
                href={viewingAttachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                variant="contained"
              >
                Open in New Tab
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
};

export default ApplicationDetail;