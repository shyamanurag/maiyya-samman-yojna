const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// User Registration
router.post(
  '/register',
  [
    body('aadhaarNumber', 'Valid Aadhaar number is required').isLength({ min: 12, max: 12 }),
    body('name', 'Name is required').not().isEmpty(),
    body('phoneNumber', 'Valid phone number is required').isLength({ min: 10, max: 10 }),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('address', 'Address is required').not().isEmpty(),
    body('bankDetails', 'Bank details are required').not().isEmpty(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        aadhaarNumber,
        name,
        phoneNumber,
        password,
        address,
        bankDetails,
        biometricData
      } = req.body;

      // Check if user already exists
      let user = await User.findOne({ aadhaarNumber });
      if (user) {
        return res.status(400).json({ message: 'User already exists with this Aadhaar number' });
      }

      // Create new user
      user = new User({
        aadhaarNumber,
        name,
        phoneNumber,
        password,
        address,
        bankDetails,
        biometricData: biometricData || {}
      });

      // Save user to DB
      await user.save();

      // Generate token
      const token = await user.generateAuthToken();

      res.status(201).json({
        user,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// User Login
router.post(
  '/login',
  [
    body('aadhaarNumber', 'Valid Aadhaar number is required').isLength({ min: 12, max: 12 }),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { aadhaarNumber, password } = req.body;

      // Find user
      const user = await User.findOne({ aadhaarNumber });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Validate password
      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = await user.generateAuthToken();

      res.json({
        user,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// Admin Login
router.post(
  '/admin/login',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      // Find admin
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Validate password
      const isMatch = await admin.validatePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Generate token
      const token = await admin.generateAuthToken();

      res.json({
        admin,
        token
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error during admin login' });
    }
  }
);

// User Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    req.user.authTokens = req.user.authTokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Get User Profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Verify Aadhaar
router.post('/verify-aadhaar', async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    
    // In a real application, this would connect to the UIDAI API
    // For demo purposes, we'll simulate the verification

    // Simple verification logic (just for demonstration)
    const isValid = /^\d{12}$/.test(aadhaarNumber);
    
    res.json({
      verified: isValid,
      message: isValid ? 'Aadhaar verified successfully' : 'Invalid Aadhaar number'
    });
  } catch (error) {
    console.error('Aadhaar verification error:', error);
    res.status(500).json({ message: 'Server error during Aadhaar verification' });
  }
});

module.exports = router;