const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. S2S-FRM-000001
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, required: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false }); // strict: false allows dynamic role-specific fields like farmName, totalLandArea

module.exports = mongoose.model('Role', roleSchema);
