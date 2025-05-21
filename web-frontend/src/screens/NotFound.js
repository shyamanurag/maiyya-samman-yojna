import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 8
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            borderRadius: 2,
            backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)'
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '6rem', md: '8rem' }, 
              fontWeight: 700, 
              color: 'primary.main',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ mb: 3, fontWeight: 500 }}
          >
            Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ mb: 4, fontSize: '1.1rem', color: 'text.secondary' }}
          >
            The page you are looking for does not exist or has been moved.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ mt: 4, color: 'text.secondary' }}
          >
            Maiyya Samman Yojna - Government of Jharkhand
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;