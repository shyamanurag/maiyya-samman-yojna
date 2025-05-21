const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { adminAuth, checkPermission } = require('../middleware/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const router = express.Router();

// Get Dashboard Statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get statistics based on admin role and district/block
    const filter = {};
    
    // Add district/block filter for non-super admins
    if (req.admin.role !== 'super_admin') {
      if (req.admin.district) {
        filter['applicationData.district'] = req.admin.district;
      }
      
      if (req.admin.block) {
        filter['applicationData.block'] = req.admin.block;
      }
    }
    
    // Get total count
    const totalApplications = await Application.countDocuments(filter);
    
    // Get counts by status
    const pending = await Application.countDocuments({
      ...filter,
      status: 'pending'
    });
    
    const underReview = await Application.countDocuments({
      ...filter,
      status: 'under_review'
    });
    
    const approved = await Application.countDocuments({
      ...filter,
      status: 'approved'
    });
    
    const rejected = await Application.countDocuments({
      ...filter,
      status: 'rejected'
    });
    
    // Get counts by district if super_admin
    let districtData = [];
    
    if (req.admin.role === 'super_admin') {
      districtData = await Application.aggregate([
        {
          $group: {
            _id: '$applicationData.district',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
    }
    
    // Get recent applications
    const recentApplications = await Application.find(filter)
      .sort({ submissionDate: -1 })
      .limit(5)
      .populate('userId', 'name aadhaarNumber');
    
    res.json({
      totalApplications,
      statusCounts: {
        pending,
        underReview,
        approved,
        rejected
      },
      districtData: districtData.map(item => ({
        district: item._id,
        count: item.count
      })),
      recentApplications
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Get Applications
router.get('/applications', adminAuth, async (req, res) => {
  try {
    const { status, district, block, page = 1, limit = 10, search } = req.query;
    
    // Build filter
    const filter = {};
    
    // Add status filter
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Add district/block filter for non-super admins
    if (req.admin.role !== 'super_admin') {
      if (req.admin.district) {
        filter['applicationData.district'] = req.admin.district;
      }
      
      if (req.admin.block) {
        filter['applicationData.block'] = req.admin.block;
      }
    } else {
      // Optional district/block filter for super admins
      if (district) {
        filter['applicationData.district'] = district;
      }
      
      if (block) {
        filter['applicationData.block'] = block;
      }
    }
    
    // Add search filter if provided
    if (search) {
      // Use population to search by user details
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { aadhaarNumber: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      if (userIds.length > 0) {
        filter.userId = { $in: userIds };
      } else {
        // If no users match, search in application data
        filter.$or = [
          { 'applicationData.fullName': { $regex: search, $options: 'i' } },
          { 'applicationData.district': { $regex: search, $options: 'i' } },
          { 'applicationData.block': { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get applications
    const applications = await Application.find(filter)
      .sort({ submissionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name aadhaarNumber phoneNumber');
    
    // Get total count for pagination
    const total = await Application.countDocuments(filter);
    
    res.json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Get Application Details
router.get('/applications/:id', adminAuth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'name aadhaarNumber phoneNumber address bankDetails');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if admin has access to this application
    if (req.admin.role !== 'super_admin') {
      if (req.admin.district && application.applicationData.district !== req.admin.district) {
        return res.status(403).json({ message: 'You do not have access to this application' });
      }
      
      if (req.admin.block && application.applicationData.block !== req.admin.block) {
        return res.status(403).json({ message: 'You do not have access to this application' });
      }
    }
    
    res.json(application);
  } catch (error) {
    console.error('Application details error:', error);
    res.status(500).json({ message: 'Server error fetching application details' });
  }
});

// Update Application Status
router.patch(
  '/applications/:id/status',
  [
    adminAuth,
    checkPermission('verify_applications'),
    body('status', 'Status is required').isIn(['pending', 'under_review', 'approved', 'rejected']),
    body('notes', 'Notes are required').not().isEmpty()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { status, notes } = req.body;
      
      // Get application
      const application = await Application.findById(req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Check if admin has access to this application
      if (req.admin.role !== 'super_admin') {
        if (req.admin.district && application.applicationData.district !== req.admin.district) {
          return res.status(403).json({ message: 'You do not have access to this application' });
        }
        
        if (req.admin.block && application.applicationData.block !== req.admin.block) {
          return res.status(403).json({ message: 'You do not have access to this application' });
        }
      }
      
      // Special permission check for approving/rejecting
      if ((status === 'approved' && !req.admin.permissions.includes('approve_applications')) ||
          (status === 'rejected' && !req.admin.permissions.includes('reject_applications'))) {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
      }
      
      // Update status
      application.status = status;
      
      // Add verification record
      application.verificationHistory.push({
        status,
        notes,
        verifiedBy: req.admin._id,
        timestamp: new Date()
      });
      
      // Update last updated timestamp
      application.lastUpdated = new Date();
      
      // Save changes
      await application.save();
      
      res.json({ 
        message: 'Application status updated successfully',
        application
      });
    } catch (error) {
      console.error('Status update error:', error);
      res.status(500).json({ message: 'Server error updating application status' });
    }
  }
);

// Get Verification Queue
router.get('/verification-queue', [adminAuth, checkPermission('verify_applications')], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Build filter for pending applications
    const filter = {
      status: 'pending'
    };
    
    // Add district/block filter for non-super admins
    if (req.admin.role !== 'super_admin') {
      if (req.admin.district) {
        filter['applicationData.district'] = req.admin.district;
      }
      
      if (req.admin.block) {
        filter['applicationData.block'] = req.admin.block;
      }
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get applications ordered by risk score (highest first)
    const applications = await Application.find(filter)
      .sort({ riskScore: -1, submissionDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name aadhaarNumber phoneNumber');
    
    // Get total count for pagination
    const total = await Application.countDocuments(filter);
    
    res.json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Verification queue error:', error);
    res.status(500).json({ message: 'Server error fetching verification queue' });
  }
});

// Generate Reports
router.get('/reports', [adminAuth, checkPermission('view_reports')], async (req, res) => {
  try {
    const { type, startDate, endDate, district, block } = req.query;
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Base filter
    const filter = {
      submissionDate: {
        $gte: start,
        $lte: end
      }
    };
    
    // Add district/block filter for non-super admins
    if (req.admin.role !== 'super_admin') {
      if (req.admin.district) {
        filter['applicationData.district'] = req.admin.district;
      }
      
      if (req.admin.block) {
        filter['applicationData.block'] = req.admin.block;
      }
    } else {
      // Optional district/block filter for super admins
      if (district) {
        filter['applicationData.district'] = district;
      }
      
      if (block) {
        filter['applicationData.block'] = block;
      }
    }
    
    let report = {};
    
    // Generate report based on type
    switch (type) {
      case 'status':
        // Applications by status
        const statusCounts = await Application.aggregate([
          { $match: filter },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        report = {
          type: 'Status Report',
          period: { start, end },
          data: statusCounts.map(item => ({
            status: item._id,
            count: item.count
          }))
        };
        break;
        
      case 'district':
        // Applications by district
        const districtCounts = await Application.aggregate([
          { $match: filter },
          { $group: { _id: '$applicationData.district', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);
        
        report = {
          type: 'District Report',
          period: { start, end },
          data: districtCounts.map(item => ({
            district: item._id,
            count: item.count
          }))
        };
        break;
        
      case 'time':
        // Applications over time
        const timeData = await Application.aggregate([
          { $match: filter },
          {
            $group: {
              _id: {
                year: { $year: '$submissionDate' },
                month: { $month: '$submissionDate' },
                day: { $dayOfMonth: '$submissionDate' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        
        report = {
          type: 'Time Report',
          period: { start, end },
          data: timeData.map(item => ({
            date: new Date(item._id.year, item._id.month - 1, item._id.day),
            count: item.count
          }))
        };
        break;
        
      default:
        // Summary report
        const total = await Application.countDocuments(filter);
        const approvedCount = await Application.countDocuments({
          ...filter,
          status: 'approved'
        });
        const rejectedCount = await Application.countDocuments({
          ...filter,
          status: 'rejected'
        });
        const pendingCount = await Application.countDocuments({
          ...filter,
          status: 'pending'
        });
        
        report = {
          type: 'Summary Report',
          period: { start, end },
          data: {
            total,
            approved: approvedCount,
            rejected: rejectedCount,
            pending: pendingCount,
            approvalRate: total > 0 ? Math.round((approvedCount / total) * 100) : 0,
            rejectionRate: total > 0 ? Math.round((rejectedCount / total) * 100) : 0
          }
        };
    }
    
    res.json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

module.exports = router;