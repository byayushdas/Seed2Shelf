const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FarmerBatch = require('../models/Farmer');
const PurchaseOrder = require('../models/PurchaseOrder');

// ============================================================
// HARVEST BATCHES
// ============================================================

// POST /api/v1/farmer/harvests — Log a new harvest batch
router.post('/harvests', async (req, res) => {
  try {
    const {
      userId, roleId,
      cropName, category, variety,
      quantity, pricePerKg,
      harvestDate, cropImage, qrCode, traceUrl,
      batchId
    } = req.body;

    if (!userId || !cropName || !quantity || !pricePerKg) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const id = batchId || `BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const batch = await FarmerBatch.create({
      _id: id,
      farmerId: userId,
      roleId: roleId || '',
      cropName,
      category: category || 'General',
      variety: variety || 'Standard',
      quantity: parseFloat(quantity),
      originalQuantity: parseFloat(quantity),
      pricePerKg: parseFloat(pricePerKg),
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      cropImage: cropImage || null,
      qrCode: qrCode || null,
      traceUrl: traceUrl || null,
      status: 'Unlisted'
    });

    return res.status(201).json({ success: true, data: batch });
  } catch (err) {
    console.error('POST /farmer/harvests error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/farmer/harvests?userId= — Get farmer's own harvests
router.get('/harvests', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: true, data: [] });
    }

    const batches = await FarmerBatch.find({ farmerId: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: batches });
  } catch (err) {
    console.error('GET /farmer/harvests error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/farmer/harvests/:id/list — Toggle Listed/Unlisted
router.put('/harvests/:id/list', async (req, res) => {
  try {
    const batch = await FarmerBatch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Harvest not found' });

    batch.status = batch.status === 'Listed' ? 'Unlisted' : 'Listed';
    batch.updatedAt = new Date();
    await batch.save();

    return res.json({ success: true, data: batch });
  } catch (err) {
    console.error('PUT /farmer/harvests/:id/list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/v1/farmer/harvests/:id — Delete a harvest
router.delete('/harvests/:id', async (req, res) => {
  try {
    await FarmerBatch.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Harvest deleted' });
  } catch (err) {
    console.error('DELETE /farmer/harvests/:id error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================================
// PURCHASE ORDERS (received from Processors)
// ============================================================

// GET /api/v1/farmer/purchase-orders?userId= — All orders for a farmer
router.get('/purchase-orders', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const orders = await PurchaseOrder.find({ sellerId: userId, sellerRole: 'FARMER' })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('GET /farmer/purchase-orders error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/farmer/purchase-orders/pending?userId=
router.get('/purchase-orders/pending', async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await PurchaseOrder.find({
      sellerId: userId,
      sellerRole: 'FARMER',
      deliveryStatus: 'PENDING_SELLER_ACCEPTANCE'
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/farmer/purchase-orders/accepted?userId=
router.get('/purchase-orders/accepted', async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await PurchaseOrder.find({
      sellerId: userId,
      sellerRole: 'FARMER',
      deliveryStatus: { $in: ['ACCEPTED', 'DISPATCHED', 'DELIVERED'] }
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/farmer/purchase-orders/:id/accept
router.put('/purchase-orders/:id/accept', async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryStatus = 'ACCEPTED';
    order.escrowStatus = 'LOCKED';
    order.updatedAt = new Date();
    await order.save();

    return res.json({ success: true, data: order });
  } catch (err) {
    console.error('PUT /farmer/purchase-orders/:id/accept error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/farmer/purchase-orders/:id/reject
router.put('/purchase-orders/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryStatus = 'REJECTED';
    order.rejectionReason = reason || 'No reason provided';
    order.updatedAt = new Date();
    await order.save();

    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/farmer/purchase-orders/:id/dispatch
router.put('/purchase-orders/:id/dispatch', async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryStatus = 'DISPATCHED';
    order.dispatchedAt = new Date();
    order.updatedAt = new Date();
    await order.save();

    // Mark the batch as Sold if fully dispatched
    await FarmerBatch.findByIdAndUpdate(order.batchId, {
      status: 'Sold',
      soldTo: order.buyerName,
      soldDate: new Date(),
      updatedAt: new Date()
    });

    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
