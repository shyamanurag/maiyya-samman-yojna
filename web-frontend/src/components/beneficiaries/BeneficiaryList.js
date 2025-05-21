import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Print as PrintIcon,
  History as HistoryIcon,
  AccountBalance as AccountBalanceIcon,
  Info as InfoIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showConfirmDialog } from '../../store/slices/uiSlice';
import { updateBeneficiaryStatus, deleteBeneficiary } from '../../store/slices/beneficiariesSlice';

// Status chip colors
const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'error',
  PENDING_VERIFICATION: 'warning',
  SUSPENDED: 'default'
};

// Status labels
const statusLabels = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING_VERIFICATION: 'Pending Verification',
  SUSPENDED: 'Suspended'
};

const BeneficiaryList = ({ beneficiaries = [], isLoading = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(null);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleActionMenuOpen = (event, beneficiaryId) => {
    event.stopPropagation();
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedBeneficiaryId(beneficiaryId);
  };
  
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setSelectedBeneficiaryId(null);
  };
  
  const handleViewBeneficiary = (beneficiaryId) => {
    navigate(`/beneficiaries/${beneficiaryId}`);
    handleActionMenuClose();
  };
  
  const handleEditBeneficiary = (beneficiaryId) => {
    navigate(`/beneficiaries/edit/${beneficiaryId}`);
    handleActionMenuClose();
  };
  
  const handleUpdateStatus = (beneficiaryId, newStatus) => {
    dispatch(showConfirmDialog({
      title: `Change status to ${statusLabels[newStatus]}?`,
      message: `Are you sure you want to change the status of this beneficiary to ${statusLabels[newStatus]}?`,
      confirmAction: () => {
        dispatch(updateBeneficiaryStatus({ 
          beneficiaryId, 
          status: newStatus 
        }));
      }
    }));
    handleActionMenuClose();
  };
  
  const handleDeleteBeneficiary = (beneficiaryId) => {
    dispatch(showConfirmDialog({
      title: 'Delete Beneficiary',
      message: 'Are you sure you want to delete this beneficiary? This action cannot be undone.',
      confirmAction: () => {
        dispatch(deleteBeneficiary(beneficiaryId));
      }
    }));
    handleActionMenuClose();
  };
  
  const handleRowClick = (beneficiaryId) => {
    navigate(`/beneficiaries/${beneficiaryId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 5 
      }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No beneficiaries found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID/Name</TableCell>
              <TableCell>Aadhaar Number</TableCell>
              <TableCell>Contact Details</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Disbursement</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {beneficiaries
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((beneficiary) => (
                <TableRow
                  key={beneficiary._id}
                  hover
                  onClick={() => handleRowClick(beneficiary._id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={beneficiary.photo} 
                        alt={beneficiary.name}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      >
                        {beneficiary.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" component="div" fontWeight="medium">
                          {beneficiary.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {beneficiary.beneficiaryId || beneficiary._id.slice(-8).toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {beneficiary.aadhaarNumber ? 
                      `XXXX-XXXX-${beneficiary.aadhaarNumber.slice(-4)}` : 
                      'Not verified'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {beneficiary.phoneNumber || 'No phone number'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {beneficiary.email || 'No email'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(beneficiary.registrationDate || beneficiary.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={statusLabels[beneficiary.status] || beneficiary.status} 
                      color={statusColors[beneficiary.status] || 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceIcon 
                        fontSize="small" 
                        color={beneficiary.lastDisbursement ? 'success' : 'disabled'} 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2">
                        {beneficiary.lastDisbursement 
                          ? `₹${beneficiary.lastDisbursement.amount} (${new Date(beneficiary.lastDisbursement.date).toLocaleDateString()})` 
                          : 'No disbursements'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuOpen(e, beneficiary._id)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={beneficiaries.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => handleViewBeneficiary(selectedBeneficiaryId)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditBeneficiary(selectedBeneficiaryId)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(selectedBeneficiaryId, 'ACTIVE')}>
          <ListItemIcon>
            <InfoIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Mark as Active</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(selectedBeneficiaryId, 'INACTIVE')}>
          <ListItemIcon>
            <BlockIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Mark as Inactive</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Payment History</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteBeneficiary(selectedBeneficiaryId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BeneficiaryList;