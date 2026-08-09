const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'ADMIN']
  },
  roleId: { type: String },

  // General Profile Details
  mobileNumber: { type: String },
  dob: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  permanentAddress: { type: String },
  state: { type: String },
  district: { type: String },
  village: { type: String },
  pinCode: { type: String },
  profilePhoto: { type: String },
  
  // KYC Details
  aadhaarNumber: { type: String },
  aadhaarFront: { type: String },
  aadhaarBack: { type: String },
  submitKyc: { type: Boolean, default: false },
  kycStatus: { type: String, default: "Pending Verification" },
  rejectionReason: { type: String },
  verificationDate: { type: Date },

  regDate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('User', userSchema);
