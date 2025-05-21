const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  applicationData: {
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    district: { type: String, required: true },
    block: { type: String, required: true },
    panchayat: { type: String, required: true },
    village: { type: String, required: true },
    monthlyIncome: { type: Number, required: true },
    dependents: { type: Number, default: 0 },
    bankAccount: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true }
  },
  documents: [{
    type: { 
      type: String, 
      enum: ['aadhaar', 'bank_statement', 'income_certificate', 'resident_certificate'],
      required: true 
    },
    fileUrl: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationNotes: { type: String }
  }],
  riskScore: {
    type: Number,
    default: 0
  },
  verificationHistory: [{
    status: { 
      type: String, 
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      required: true 
    },
    notes: { type: String },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
  paymentHistory: [{
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'processed', 'failed'],
      required: true 
    },
    transactionId: { type: String },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
  submissionDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  locationCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
});

// Add indexes for faster querying
applicationSchema.index({ userId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ 'applicationData.district': 1 });
applicationSchema.index({ 'applicationData.block': 1 });
applicationSchema.index({ submissionDate: 1 });

// Calculate risk score before saving
applicationSchema.pre('save', async function(next) {
  const application = this;
  
  // Calculate risk score based on various factors
  let riskScore = 0;
  
  // Check for income threshold
  if (application.applicationData.monthlyIncome > 10000) {
    riskScore += 20;
  }
  
  // Check for previous rejections
  const rejectionCount = application.verificationHistory.filter(
    history => history.status === 'rejected'
  ).length;
  
  riskScore += rejectionCount * 10;
  
  // Check for document verification
  const unverifiedDocs = application.documents.filter(doc => !doc.verified).length;
  riskScore += unverifiedDocs * 15;
  
  // Final risk score calculation
  application.riskScore = Math.min(Math.max(riskScore, 0), 100);
  application.lastUpdated = new Date();
  
  next();
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;