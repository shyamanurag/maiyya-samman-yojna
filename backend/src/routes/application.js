const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Application = require('../models/Application');
const { detectFraud } = require('../utils/fraudDetection');
const router = express.Router();

// Submit New Application
router.post(
  '/submit',
  [
    authMiddleware,
    body('applicationData.fullName', 'Full name is required').not().isEmpty(),
    body('applicationData.age', 'Valid age is required').isInt({ min: 18, max: 65 }),
    body('applicationData.district', 'District is required').not().isEmpty(),
    body('applicationData.block', 'Block is required').not().isEmpty(),
    body('applicationData.panchayat', 'Panchayat is required').not().isEmpty(),
    body('applicationData.village', 'Village is required').not().isEmpty(),
    body('applicationData.monthlyIncome', 'Monthly income is required').isNumeric(),
    body('applicationData.bankAccount', 'Bank account number is required').not().isEmpty(),
    body('applicationData.ifscCode', 'IFSC code is required').not().isEmpty(),
    body('applicationData.bankName', 'Bank name is required').not().isEmpty(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { applicationData, documents, locationCoordinates } = req.body;

      // Check for existing applications
      const existingApplication = await Application.findOne({ 
        userId: req.user._id,
        status: { $in: ['pending', 'under_review', 'approved'] }
      });

      if (existingApplication) {
        return res.status(400).json({ 
          message: 'You already have an active application',
          applicationId: existingApplication._id 
        });
      }

      // Perform fraud detection
      if (documents) {
        const fraudDetectionResults = await detectFraud({
          aadhaar: req.user.aadhaarNumber,
          name: applicationData.fullName,
          address: {
            district: applicationData.district,
            block: applicationData.block,
            panchayat: applicationData.panchayat,
            village: applicationData.village
          },
          documents
        });

        // If fraud detected, mark application for review
        if (fraudDetectionResults.isFraud) {
          return res.status(400).json({ 
            message: 'Fraud detected in application',
            reasons: fraudDetectionResults.reasons 
          });
        }
      }

      // Create new application
      const application = new Application({
        userId: req.user._id,
        applicationData,
        documents: documents || [],
        locationCoordinates: locationCoordinates || {},
        status: 'pending',
        submissionDate: new Date()
      });

      // Save application
      await application.save();

      res.status(201).json({
        message: 'Application submitted successfully',
        application
      });
    } catch (error) {
      console.error('Application submission error:', error);
      res.status(500).json({ message: 'Server error submitting application' });
    }
  }
);

// Get User Applications
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .sort({ submissionDate: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Get Application Details
router.get('/my-applications/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Application details error:', error);
    res.status(500).json({ message: 'Server error fetching application details' });
  }
});

// Upload Document
router.post(
  '/my-applications/:id/documents',
  [
    authMiddleware,
    body('type', 'Document type is required').isIn([
      'aadhaar', 'bank_statement', 'income_certificate', 'resident_certificate'
    ]),
    body('fileUrl', 'File URL is required').not().isEmpty()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { type, fileUrl } = req.body;

      // Find application
      const application = await Application.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Check if application can be modified
      if (application.status !== 'pending' && application.status !== 'under_review') {
        return res.status(400).json({ message: 'Application cannot be modified' });
      }

      // Check if document already exists
      const existingDocIndex = application.documents.findIndex(doc => doc.type === type);

      if (existingDocIndex !== -1) {
        // Update existing document
        application.documents[existingDocIndex].fileUrl = fileUrl;
        application.documents[existingDocIndex].verified = false;
      } else {
        // Add new document
        application.documents.push({
          type,
          fileUrl,
          verified: false
        });
      }

      // Update last updated timestamp
      application.lastUpdated = new Date();

      // Save changes
      await application.save();

      res.json({
        message: 'Document uploaded successfully',
        application
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ message: 'Server error uploading document' });
    }
  }
);

// Check Application Status
router.get('/status/:aadhaarNumber', async (req, res) => {
  try {
    const { aadhaarNumber } = req.params;

    // Find user by Aadhaar
    const user = await User.findOne({ aadhaarNumber });

    if (!user) {
      return res.status(404).json({ message: 'No applications found for this Aadhaar number' });
    }

    // Find applications
    const applications = await Application.find({ userId: user._id })
      .sort({ submissionDate: -1 })
      .limit(1);

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this Aadhaar number' });
    }

    // Return status of most recent application
    const latestApplication = applications[0];

    res.json({
      status: latestApplication.status,
      submissionDate: latestApplication.submissionDate,
      lastUpdated: latestApplication.lastUpdated
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ message: 'Server error checking application status' });
  }
});

module.exports = router;