const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  role: {
    type: String,
    enum: ['super_admin', 'district_admin', 'block_admin', 'verification_officer'],
    required: true
  },
  district: {
    type: String,
    required: function() {
      return this.role === 'district_admin' || this.role === 'block_admin';
    }
  },
  block: {
    type: String,
    required: function() {
      return this.role === 'block_admin';
    }
  },
  permissions: [{
    type: String,
    enum: [
      'view_applications',
      'verify_applications',
      'approve_applications',
      'reject_applications',
      'view_analytics',
      'view_users',
      'manage_users',
      'manage_admins',
      'view_reports',
      'generate_reports'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  authTokens: [{
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

// Add indexes for faster querying
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ district: 1, block: 1 });

// Hash password before saving
adminSchema.pre('save', async function(next) {
  const admin = this;
  
  if (admin.isModified('password')) {
    admin.password = await bcrypt.hash(admin.password, 10);
  }
  
  admin.updatedAt = new Date();
  next();
});

// Generate auth token
adminSchema.methods.generateAuthToken = async function() {
  const admin = this;
  
  const token = jwt.sign(
    { _id: admin._id.toString(), role: admin.role }, 
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  admin.authTokens = admin.authTokens.concat({ token });
  await admin.save();
  
  return token;
};

// Validate password
adminSchema.methods.validatePassword = async function(password) {
  const admin = this;
  return await bcrypt.compare(password, admin.password);
};

// Convert to JSON representation (hide sensitive data)
adminSchema.methods.toJSON = function() {
  const admin = this;
  const adminObject = admin.toObject();
  
  delete adminObject.password;
  delete adminObject.authTokens;
  
  return adminObject;
};

// Find admin by credentials
adminSchema.statics.findByCredentials = async (username, password) => {
  const admin = await Admin.findOne({ username });
  
  if (!admin) {
    throw new Error('Invalid login credentials');
  }
  
  const isMatch = await bcrypt.compare(password, admin.password);
  
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }
  
  return admin;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;