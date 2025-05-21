import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  MoreVert as MoreIcon,
  Print as PrintIcon,
  History as HistoryIcon,
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import { showConfirmDialog } from '../../store/slices/uiSlice';
import { updateApplicationStatus, deleteApplication } from '../../store/slices/applicationSlice';

// Status chip colors
const statusColors = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  INCOMPLETE: 'default'
};

// Status labels
const statusLabels = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  INCOMPLETE: 'Incomplete'
};

const ApplicationsList = ({ applications = [], isLoading = false, isCompact = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isCompact ? 5 : 10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleActionMenuOpen = (event, applicationId) => {
    event.stopPropagation();
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedApplicationId(applicationId);
  };
  
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setSelectedApplicationId(null);
  };
  
  const handleViewApplication = (applicationId) => {
    navigate(`/applications/${applicationId}`);
  };
  
  const handleUpdateStatus = (applicationId, newStatus) => {
    dispatch(showConfirmDialog({
      title: `Change status to ${statusLabels[newStatus]}?`,
      message: `Are you sure you want to change the status of this application to ${statusLabels[newStatus]}?`,
      confirmAction: () => {
        dispatch(updateApplicationStatus({ 
          applicationId, 
          status: newStatus 
        }));
      }
    }));
    handleActionMenuClose();
  };
  
  const handleDeleteApplication = (applicationId) => {
    dispatch(showConfirmDialog({
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application? This action cannot be undone.',
      confirmAction: () => {
        dispatch(deleteApplication(applicationId));
      }
    }));
    handleActionMenuClose();
  };
  
  const handleRowClick = (applicationId) => {
    if (!isCompact) {
      navigate(`/applications/${applicationId}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (applications.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 5 
      }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No applications found
        </Typography>
        {!isCompact && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/new-application')}
            sx={{ mt: 2 }}
          >
            Create New Application
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} elevation={isCompact ? 0 : 1}>
        <Table sx={{ minWidth: 650 }} size={isCompact ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>Application ID</TableCell>
              <TableCell>Applicant</TableCell>
              {!isCompact && <TableCell>Aadhaar Number</TableCell>}
              <TableCell>Submitted On</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((application) => (
                <TableRow
                  key={application._id}
                  hover
                  onClick={() => handleRowClick(application._id)}
                  sx={{ 
                    cursor: !isCompact ? 'pointer' : 'default',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell component="th" scope="row">
                    {application.applicationId || application._id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={application.applicantPhoto} 
                        alt={application.applicantName}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {application.applicantName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" component="div">
                          {application.applicantName}
                        </Typography>
                        {!isCompact && (
                          <Typography variant="caption" color="text.secondary">
                            {application.contactNumber}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  {!isCompact && (
                    <TableCell>
                      {application.aadhaarNumber ? 
                        `XXXX-XXXX-${application.aadhaarNumber.slice(-4)}` : 
                        'N/A'}
                    </TableCell>
                  )}
                  <TableCell>
                    {new Date(application.submittedDate || application.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={statusLabels[application.status] || application.status} 
                      color={statusColors[application.status] || 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      {isCompact ? (
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewApplication(application._id);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionMenuOpen(e, application._id)}
                          >
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {!isCompact && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={applications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
      
      {/* Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => {
          handleViewApplication(selectedApplicationId);
          handleActionMenuClose();
        }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/applications/edit/${selectedApplicationId}`);
          handleActionMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(selectedApplicationId, 'APPROVED')}>
          <ListItemIcon>
            <ApproveIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(selectedApplicationId, 'REJECTED')}>
          <ListItemIcon>
            <RejectIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(selectedApplicationId, 'UNDER_REVIEW')}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>Mark Under Review</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/applications/print/${selectedApplicationId}`);
          handleActionMenuClose();
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteApplication(selectedApplicationId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ApplicationsList;