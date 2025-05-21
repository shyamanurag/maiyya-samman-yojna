import React, { useState } from 'react';
import { Box, Card, CardContent, CardHeader, IconButton, Menu, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ApplicationTrendsChart = ({ data }) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  const handleExport = (format) => {
    // Logic to export chart data in different formats
    handleMenuClose();
  };
  
  if (!data || !data.trends) {
    return null;
  }
  
  // Prepare chart data based on selected time range
  const chartData = {
    labels: data.trends[timeRange]?.labels || [],
    datasets: [
      {
        label: 'Applications',
        data: data.trends[timeRange]?.applications || [],
        fill: false,
        borderColor: theme.palette.primary.main,
        tension: 0.1
      },
      {
        label: 'Approvals',
        data: data.trends[timeRange]?.approvals || [],
        fill: false,
        borderColor: theme.palette.success.main,
        tension: 0.1
      },
      {
        label: 'Rejections',
        data: data.trends[timeRange]?.rejections || [],
        fill: false,
        borderColor: theme.palette.error.main,
        tension: 0.1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Applications'
        }
      },
      x: {
        title: {
          display: true,
          text: timeRange === 'year' ? 'Months' : timeRange === 'week' ? 'Days' : 'Dates'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Application Trends"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range-select"
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Range"
              >
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleExport('png')}>Export as PNG</MenuItem>
              <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
              <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
            </Menu>
          </Box>
        }
      />
      <CardContent sx={{ height: 350 }}>
        <Line data={chartData} options={chartOptions} height={300} />
      </CardContent>
    </Card>
  );
};

export default ApplicationTrendsChart;