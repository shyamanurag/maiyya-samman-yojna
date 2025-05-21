require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimiter = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const applicationRoutes = require('./routes/application');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);

// API documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'Welcome to Maiyya Samman Yojna API',
    version: '1.0.0',
    endpoints: {
      auth: [
        { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
        { method: 'POST', path: '/api/auth/login', description: 'Login user' },
        { method: 'POST', path: '/api/auth/admin/login', description: 'Login admin' },
        { method: 'POST', path: '/api/auth/logout', description: 'Logout user' },
        { method: 'GET', path: '/api/auth/me', description: 'Get user profile' },
        { method: 'POST', path: '/api/auth/verify-aadhaar', description: 'Verify Aadhaar number' }
      ],
      admin: [
        { method: 'GET', path: '/api/admin/dashboard', description: 'Get admin dashboard data' },
        { method: 'GET', path: '/api/admin/applications', description: 'Get all applications' },
        { method: 'GET', path: '/api/admin/applications/:id', description: 'Get application details' },
        { method: 'PATCH', path: '/api/admin/applications/:id/status', description: 'Update application status' },
        { method: 'GET', path: '/api/admin/verification-queue', description: 'Get verification queue' },
        { method: 'GET', path: '/api/admin/reports', description: 'Generate reports' }
      ],
      applications: [
        { method: 'POST', path: '/api/applications/submit', description: 'Submit new application' },
        { method: 'GET', path: '/api/applications/my-applications', description: 'Get user applications' },
        { method: 'GET', path: '/api/applications/my-applications/:id', description: 'Get application details' },
        { method: 'POST', path: '/api/applications/my-applications/:id/documents', description: 'Upload document' },
        { method: 'GET', path: '/api/applications/status/:aadhaarNumber', description: 'Check application status' }
      ]
    }
  });
});

// App preview page
app.get('/app-preview', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app-preview.html'));
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});