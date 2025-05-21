import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications, updateApplicationStatus } from '../store/applicationSlice';

const ApplicationList = () => {
  const dispatch = useDispatch();
  const { applications, loading, error } = useSelector(state => state.applications || { applications: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.aadhaarNumber?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (application) => {
    setSelectedApplication(application);
    setOpen(true);
  };

  const handleStatusChange = async (applicationId, status) => {
    try {
      await dispatch(updateApplicationStatus({
        applicationId,
        status,
        notes: 'Status updated by Anganwadi worker',
      }));
      dispatch(fetchApplications());
      if (open) setOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Application List
      </Typography>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search by name or Aadhaar number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Applications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Aadhaar</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Block</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application._id}>
                <TableCell>{application.name}</TableCell>
                <TableCell>{application.aadhaarNumber}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color={application.status === 'approved' ? 'success' : 
                          application.status === 'rejected' ? 'error' : 'warning'}
                  >
                    {application.status}
                  </Button>
                </TableCell>
                <TableCell>{application.district}</TableCell>
                <TableCell>{application.block}</TableCell>
                <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(application)}>
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleStatusChange(application._id, 'approved')}>
                    <EditIcon color="success" />
                  </IconButton>
                  <IconButton onClick={() => handleStatusChange(application._id, 'rejected')}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Application Details Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Basic Information</Typography>
              <Typography>Name: {selectedApplication?.name}</Typography>
              <Typography>Aadhaar: {selectedApplication?.aadhaarNumber}</Typography>
              <Typography>Phone: {selectedApplication?.phoneNumber}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Location Details</Typography>
              <Typography>District: {selectedApplication?.district}</Typography>
              <Typography>Block: {selectedApplication?.block}</Typography>
              <Typography>Panchayat: {selectedApplication?.panchayat}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Bank Details</Typography>
              <Typography>Bank Account: {selectedApplication?.bankAccount}</Typography>
              <Typography>IFSC Code: {selectedApplication?.ifscCode}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Documents</Typography>
              {selectedApplication?.documents?.map((doc, index) => (
                <Typography key={index}>
                  {doc.type}: {doc.verified ? 'Verified' : 'Pending'}
                </Typography>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button
            onClick={() => handleStatusChange(selectedApplication?._id, 'approved')}
            color="success"
            variant="contained"
          >
            Approve
          </Button>
          <Button
            onClick={() => handleStatusChange(selectedApplication?._id, 'rejected')}
            color="error"
            variant="contained"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationList;