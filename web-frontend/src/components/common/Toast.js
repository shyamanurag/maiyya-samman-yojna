import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { selectToast, hideToast } from '../../store/slices/uiSlice';

const Toast = () => {
  const dispatch = useDispatch();
  const { open, message, type, duration } = useSelector(selectToast);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideToast());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;