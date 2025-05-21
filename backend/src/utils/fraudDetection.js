const axios = require('axios');
const User = require('../models/User');
const Application = require('../models/Application');

const fraudPatterns = {
  duplicateAadhaar: /^\d{11}0$/, // Common pattern for fake Aadhaar numbers
  invalidBank: /^\d{1,8}$/, // Too short bank account numbers
  ghostApplicant: {
    commonNames: ['JAN', 'RAM', 'RAJ', 'KUMAR', 'DEVI'],
    commonAddresses: ['NA', 'NOT AVAILABLE', 'TEMPORARY']
  },
  invalidDocument: {
    sizeThreshold: 100 * 1024, // 100KB
    qualityThreshold: 0.7,
    allowedFormats: ['jpeg', 'jpg', 'png']
  }
};

/**
 * Detect fraud in application data
 * @param {Object} data - Application data
 * @returns {Promise<Object>} - Fraud detection results
 */
const detectFraud = async (data) => {
  try {
    const results = {
      isFraud: false,
      reasons: [],
      riskScore: 0
    };

    // Check for duplicate Aadhaar
    if (isDuplicateAadhaar(data.aadhaar)) {
      results.isFraud = true;
      results.reasons.push('Suspicious Aadhaar number pattern detected');
    }

    // Check for duplicate applications
    const duplicateCheck = await checkDuplicateApplications(data.aadhaar);
    if (duplicateCheck.isDuplicate) {
      results.isFraud = true;
      results.reasons.push('Multiple applications detected for the same Aadhaar');
    }

    // Check for ghost applicant patterns
    if (isGhostApplicant(data)) {
      results.isFraud = true;
      results.reasons.push('Ghost applicant pattern detected');
    }

    // Validate document quality if documents are provided
    if (data.documents) {
      for (const doc of data.documents) {
        const documentQuality = validateDocumentQuality(doc);
        if (!documentQuality.valid) {
          results.isFraud = true;
          results.reasons.push(documentQuality.reason);
          break;
        }
      }
    }

    // Calculate risk score
    results.riskScore = await calculateRiskScore(data);

    // High risk score is suspicious
    if (results.riskScore > 80 && !results.isFraud) {
      results.isFraud = true;
      results.reasons.push('High risk score');
    }

    return {
      ...results,
      message: results.isFraud 
        ? `Fraud detected: ${results.reasons.join(', ')}`
        : 'No fraud detected'
    };
  } catch (error) {
    console.error('Fraud detection error:', error);
    return {
      isFraud: false,
      message: 'Error during fraud detection',
      reasons: ['Internal verification error'],
      riskScore: 50
    };
  }
};

/**
 * Check if Aadhaar number matches known fraud patterns
 * @param {string} aadhaar - Aadhaar number
 * @returns {boolean} - Is duplicate
 */
const isDuplicateAadhaar = (aadhaar) => {
  // Check against known patterns
  return fraudPatterns.duplicateAadhaar.test(aadhaar);
};

/**
 * Check for multiple applications with the same Aadhaar
 * @param {string} aadhaar - Aadhaar number
 * @returns {Promise<Object>} - Duplicate check results
 */
const checkDuplicateApplications = async (aadhaar) => {
  try {
    // Find user with this Aadhaar
    const user = await User.findOne({ aadhaarNumber: aadhaar });
    
    if (!user) {
      return { isDuplicate: false };
    }
    
    // Check for multiple active applications
    const applications = await Application.find({
      userId: user._id,
      status: { $in: ['pending', 'under_review', 'approved'] }
    });
    
    return {
      isDuplicate: applications.length > 1,
      applications: applications.length
    };
  } catch (error) {
    console.error('Duplicate check error:', error);
    return { isDuplicate: false };
  }
};

/**
 * Check for ghost applicant patterns
 * @param {Object} data - Application data
 * @returns {boolean} - Is ghost applicant
 */
const isGhostApplicant = (data) => {
  const { name, address } = data;
  
  // Check for common ghost applicant patterns
  if (name && fraudPatterns.ghostApplicant.commonNames.some(namePattern => 
    name.toUpperCase().includes(namePattern))) {
    return true;
  }

  if (address) {
    const addressStr = typeof address === 'string' 
      ? address 
      : Object.values(address).join(' ');
      
    if (fraudPatterns.ghostApplicant.commonAddresses.some(addrPattern => 
      addressStr.toUpperCase().includes(addrPattern))) {
      return true;
    }
  }

  return false;
};

/**
 * Validate document quality
 * @param {Object} document - Document data
 * @returns {Object} - Validation results
 */
const validateDocumentQuality = (document) => {
  // For demonstration; in a real app this would analyze the actual document
  // Here we'll assume the document is valid
  return {
    valid: true,
    reason: 'Document quality verified'
  };
};

/**
 * Calculate risk score
 * @param {Object} data - Application data
 * @returns {Promise<number>} - Risk score
 */
const calculateRiskScore = async (data) => {
  try {
    let score = 0;
    
    // Geographic risk
    const highRiskDistricts = ['Bokaro', 'Palamu', 'Pakur', 'Godda'];
    if (data.address && data.address.district && 
        highRiskDistricts.includes(data.address.district)) {
      score += 20;
    }
    
    // Name similarity check
    const similarNames = await checkSimilarNames(data.name);
    if (similarNames > 3) {
      score += 15;
    }
    
    // Multiple applications from same location
    const locationApps = await checkLocationApplications(
      data.address?.district,
      data.address?.block,
      data.address?.panchayat
    );
    if (locationApps > 100) {
      score += 10;
    }
    
    // Basic checks
    if (isDuplicateAadhaar(data.aadhaar)) {
      score += 40;
    }
    
    if (isGhostApplicant(data)) {
      score += 40;
    }
    
    return Math.min(score, 100); // Cap at 100
  } catch (error) {
    console.error('Risk scoring error:', error);
    return 50; // Default medium risk
  }
};

/**
 * Check for similar names in the database
 * @param {string} name - Applicant name
 * @returns {Promise<number>} - Number of similar names
 */
const checkSimilarNames = async (name) => {
  try {
    if (!name) return 0;
    
    // This would use more sophisticated fuzzy matching in production
    const similarNameUsers = await User.countDocuments({
      name: { $regex: name.split(' ')[0], $options: 'i' }
    });
    
    return similarNameUsers;
  } catch (error) {
    console.error('Name similarity check error:', error);
    return 0;
  }
};

/**
 * Check for applications from the same location
 * @param {string} district - District name
 * @param {string} block - Block name
 * @param {string} panchayat - Panchayat name
 * @returns {Promise<number>} - Number of applications
 */
const checkLocationApplications = async (district, block, panchayat) => {
  try {
    if (!district || !block) return 0;
    
    const filter = {
      'applicationData.district': district,
      'applicationData.block': block
    };
    
    if (panchayat) {
      filter['applicationData.panchayat'] = panchayat;
    }
    
    const locationAppCount = await Application.countDocuments(filter);
    
    return locationAppCount;
  } catch (error) {
    console.error('Location check error:', error);
    return 0;
  }
};

module.exports = {
  detectFraud,
  calculateRiskScore
};