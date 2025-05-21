import React from 'react';
import { Box, Grid, Typography, Card, CardContent, CardHeader, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// This component renders the main analytics dashboard metrics
const AnalyticsDashboard = ({ data }) => {
  const theme = useTheme();
  
  if (!data) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Key Performance Indicators
      </Typography>
      
      <Grid container spacing={3}>
        {/* Application Success Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Application Success Rate
              </Typography>
              <Typography variant="h3" component="div" color="primary">
                {data.approvalRate || '0'}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.approvalRateTrend > 0 ? '+' : ''}{data.approvalRateTrend || '0'}% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Average Processing Time */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Avg Processing Time
              </Typography>
              <Typography variant="h3" component="div" color="primary">
                {data.avgProcessingTime || '0'} days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.avgProcessingTimeTrend < 0 ? '+' : ''}{data.avgProcessingTimeTrend || '0'}% efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Beneficiaries */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Total Beneficiaries
              </Typography>
              <Typography variant="h3" component="div" color="primary">
                {data.totalBeneficiaries || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.newBeneficiaries || '0'} new this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Disbursement */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Total Disbursement
              </Typography>
              <Typography variant="h3" component="div" color="primary">
                ₹{data.totalDisbursement || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ₹{data.monthlyDisbursement || '0'} this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;