const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. S2S-FRM-000001
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, required: true },

  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false }); // strict: false allows dynamic role-specific fields like farmName, totalLandArea

module.exports = mongoose.model('Role', roleSchema);
