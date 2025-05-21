import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Typography
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const GeographicalDistribution = ({ data }) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState('district');
  
  if (!data || !data.geographical) {
    return null;
  }
  
  const handleViewTypeChange = (event) => {
    setViewType(event.target.value);
  };
  
  // Prepare chart data based on selected view type
  const chartData = {
    labels: data.geographical[viewType]?.map(item => item.name) || [],
    datasets: [
      {
        data: data.geographical[viewType]?.map(item => item.count) || [],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          '#673ab7',
          '#2196f3',
          '#ff9800',
          '#795548',
          '#9e9e9e',
          '#607d8b'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        display: true
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  // Generate district ranking
  const sortedData = [...(data.geographical[viewType] || [])].sort((a, b) => b.count - a.count);
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Geographical Distribution"
        action={
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="view-type-label">View</InputLabel>
            <Select
              labelId="view-type-label"
              id="view-type-select"
              value={viewType}
              onChange={handleViewTypeChange}
              label="View"
            >
              <MenuItem value="district">District</MenuItem>
              <MenuItem value="block">Block</MenuItem>
              <MenuItem value="village">Village/Town</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ height: 300, width: { xs: '100%', md: '50%' } }}>
          <Pie data={chartData} options={chartOptions} />
        </Box>
        <Box sx={{ width: { xs: '100%', md: '50%' }, mt: { xs: 2, md: 0 }, pl: { xs: 0, md: 2 } }}>
          <Typography variant="subtitle1" gutterBottom>
            Top {viewType === 'district' ? 'Districts' : viewType === 'block' ? 'Blocks' : 'Villages/Towns'}
          </Typography>
          <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
            {sortedData.map((item, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 1,
                  borderBottom: index < sortedData.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mr: 1, width: 24, textAlign: 'center' }}
                  >
                    {index + 1}.
                  </Typography>
                  <Typography variant="body1">{item.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight="medium">
                    {item.count}
                  </Typography>
                  {item.trend > 0 ? (
                    <ArrowUpIcon fontSize="small" color="success" sx={{ ml: 0.5 }} />
                  ) : item.trend < 0 ? (
                    <ArrowDownIcon fontSize="small" color="error" sx={{ ml: 0.5 }} />
                  ) : null}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GeographicalDistribution;