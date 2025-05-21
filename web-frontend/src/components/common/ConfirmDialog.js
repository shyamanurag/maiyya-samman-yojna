import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { selectConfirmDialog, hideConfirmDialog } from '../../store/slices/uiSlice';

const ConfirmDialog = () => {
  const dispatch = useDispatch();
  const { open, title, message, confirmAction, cancelAction } = useSelector(selectConfirmDialog);

  const handleClose = () => {
    if (cancelAction) {
      cancelAction();
    }
    dispatch(hideConfirmDialog());
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    dispatch(hideConfirmDialog());
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;