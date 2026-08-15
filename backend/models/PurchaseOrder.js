const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true }, // ORD-2026-XXXXX

  // Buyer info
  buyerRole: {
    type: String,
    required: true,
    enum: ['PROCESSOR', 'DISTRIBUTOR', 'RETAILER']
  },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String },
  buyerRoleId: { type: String },

  // Seller info
  sellerRole: {
    type: String,
    required: true,
    enum: ['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER']
  },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: { type: String },
  sellerRoleId: { type: String },

  // What's being bought
  batchId: { type: String, required: true },     // ID from Farmer/Processor/Distributor/Retailer collection
  cropName: { type: String, required: true },     // product name
  quantityKg: { type: Number, required: true },
  pricePerUnit: { type: Number },
  totalAmount: { type: Number },

  // Order lifecycle status
  deliveryStatus: {
    type: String,
    enum: [
      'PENDING_SELLER_ACCEPTANCE',
      'ACCEPTED',
      'DISPATCHED',
      'DELIVERED',
      'REJECTED'
    ],
    default: 'PENDING_SELLER_ACCEPTANCE'
  },

  // Razorpay Integration
  razorpayPaymentId: { type: String },
  razorpayRefundId: { type: String },

  // Escrow simulated as a status flag (no real payment)
  escrowStatus: {
    type: String,
    enum: ['PENDING', 'LOCKED', 'RELEASED'],
    default: 'PENDING'
  },

  rejectionReason: { type: String },
  dispatchedAt: { type: Date },
  deliveredAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate orderNumber before save
purchaseOrderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.orderNumber = `ORD-2026-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
