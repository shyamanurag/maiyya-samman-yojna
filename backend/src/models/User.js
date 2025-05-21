const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  aadhaarNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid Aadhaar number!`
    }
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  password: { 
    type: String, 
    required: true 
  },
  address: {
    street: { type: String, required: true },
    district: { type: String, required: true },
    block: { type: String, required: true },
    panchayat: { type: String, required: true },
    state: { type: String, default: 'Jharkhand', required: true },
    pincode: { type: String, required: true }
  },
  biometricData: {
    fingerprints: { type: Object },
    faceId: { type: String },
    verified: { type: Boolean, default: false }
  },
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  role: { 
    type: String, 
    default: 'beneficiary' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date 
  },
  authTokens: [{
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

// Add index for faster queries
userSchema.index({ aadhaarNumber: 1 });
userSchema.index({ phoneNumber: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  
  user.updatedAt = new Date();
  next();
});

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  
  const token = jwt.sign(
    { _id: user._id.toString(), role: user.role }, 
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  user.authTokens = user.authTokens.concat({ token });
  await user.save();
  
  return token;
};

// Validate password
userSchema.methods.validatePassword = async function(password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

// Convert to JSON representation (hide sensitive data)
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  
  delete userObject.password;
  delete userObject.authTokens;
  delete userObject.biometricData;
  
  return userObject;
};

// Find user by credentials
userSchema.statics.findByCredentials = async (aadhaarNumber, password) => {
  const user = await User.findOne({ aadhaarNumber });
  
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }
  
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;