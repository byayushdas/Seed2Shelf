const mongoose = require('mongoose');

const processorSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. PROC-2026-XXXX
  processorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleId: { type: String }, // S2S-PRC-XXXXXX

  productName: { type: String, required: true },
  category: { type: String, required: true },

  quantity: { type: Number, required: true },  // in kg/units remaining
  originalQuantity: { type: Number },
  pricePerUnit: { type: Number, required: true },

  // Link back to the raw harvest(s) used
  parentRawBatchId: { type: String },          // single raw batch ref
  parentRawBatchIds: [{ type: String }],        // multi-batch processing

  productImage: { type: String },
  qrCodeUrl: { type: String },
  traceUrl: { type: String },

  status: {
    type: String,
    enum: ['In Stock', 'Listed', 'Dispatched', 'Archived'],
    default: 'In Stock'
  },

  processingDate: { type: Date },
  originDetails: { type: mongoose.Schema.Types.Mixed },

  soldTo: { type: String },
  soldDate: { type: Date },
  totalSaleValue: { type: Number },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Processor', processorSchema);
