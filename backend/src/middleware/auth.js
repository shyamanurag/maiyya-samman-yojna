const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findOne({ 
      _id: decoded._id, 
      'authTokens.token': token 
    });
    
    if (!user) {
      // Check if admin exists
      const admin = await Admin.findOne({ 
        _id: decoded._id, 
        'authTokens.token': token 
      });
      
      if (!admin) {
        throw new Error('Authentication failed');
      }
      
      // Add admin to request
      req.admin = admin;
      req.token = token;
      req.isAdmin = true;
      next();
      return;
    }
    
    // Add user to request
    req.user = user;
    req.token = token;
    req.isAdmin = false;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin-only middleware
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists
    const admin = await Admin.findOne({ 
      _id: decoded._id, 
      'authTokens.token': token 
    });
    
    if (!admin) {
      throw new Error('Not authorized as admin');
    }
    
    // Add admin to request
    req.admin = admin;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    res.status(401).json({ message: 'Admin authentication failed' });
  }
};

// Permission check middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }
    
    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    
    next();
  };
};

module.exports = authMiddleware;
module.exports.adminAuth = adminAuth;
module.exports.checkPermission = checkPermission;