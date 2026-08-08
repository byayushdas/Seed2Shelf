const mongoose = require('mongoose');

const roleInfoSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  roleId: { type: String, required: true },
  
  // FARMER details
  farmName: { type: String },
  farmLocation: { type: String },
  totalLandArea: { type: String },
  mainCultivatedCrops: [{ type: String }],
  farmingPractice: { type: String },

  // PROCESSOR details
  facilityName: { type: String },
  facilityLocation: { type: String },
  processingCapacity: { type: String },
  mainProcessedProducts: { type: String },
  complianceStandards: { type: String },

  // DISTRIBUTOR details
  companyName: { type: String },
  headOfficeLocation: { type: String },
  storageCapacity: { type: String },
  operatingFacilities: { type: String },
  transportFleetSize: { type: String },

  // RETAILER details
  storeName: { type: String },
  storeLocation: { type: String },
  shelfCapacity: { type: String },
  storeTypeFocus: { type: String },
  employeeCount: { type: String },

  // Extra generic field for loose data just in case
  extraDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('RoleInfo', roleInfoSchema);
