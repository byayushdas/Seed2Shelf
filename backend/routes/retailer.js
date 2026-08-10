const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DistributorBatch = require('../models/Distributor');
const RetailerBatch = require('../models/Retailer');
const PurchaseOrder = require('../models/PurchaseOrder');

// ============================================================
// MARKETPLACE — Browse listed distributor goods
// ============================================================

// GET /api/v1/retailer/marketplace?search=&category=
router.get('/marketplace', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { status: 'Listed' };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { _id: { $regex: search, $options: 'i' } }
      ];
    }

    const batches = await DistributorBatch.find(query)
      .populate('distributorId', 'name district state village')
      .sort({ createdAt: -1 });

    const mapped = batches.map((b) => {
      const distributor = b.distributorId;
      const distributorName = distributor?.name || 'Registered Distributor';
      const distributorLocation = [distributor?.village, distributor?.district, distributor?.state]
        .filter(Boolean).join(', ') || 'India';

      return {
        id: b._id,
        batchId: b._id,
        productName: b.productName,
        cropName: b.productName,
        category: b.category,
        distributorName,
        distributorLocation,
        farmerName: distributorName,
        farmerLocation: distributorLocation,
        quantity: b.quantity,
        unit: 'kg',
        pricePerUnit: b.pricePerUnit,
        totalPrice: b.quantity * b.pricePerUnit,
        date: b.date
          ? new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : 'Recently Added',
        harvestDate: b.date
          ? new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : 'Recently Added',
        hasQrCode: !!b.qrCodeUrl,
        imageUrl: b.productImage || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600',
        parentProcessedBatchId: b.parentProcessedBatchId
      };
    });

    return res.json({ success: true, data: mapped });
  } catch (err) {
    console.error('GET /retailer/marketplace error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/v1/retailer/marketplace/order — Retailer places buy request
router.post('/marketplace/order', async (req, res) => {
  try {
    const { buyerId, batchId, quantityKg } = req.body;
    if (!buyerId || !batchId || !quantityKg) {
      return res.status(400).json({ success: false, message: 'buyerId, batchId, quantityKg required' });
    }

    const batch = await DistributorBatch.findById(batchId).populate('distributorId', 'name');
    if (!batch) return res.status(404).json({ success: false, message: 'Distributed batch not found' });
    if (batch.status !== 'Listed') {
      return res.status(400).json({ success: false, message: 'Batch is not available for purchase' });
    }

    const buyer = await User.findById(buyerId);
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });

    const qty = parseFloat(quantityKg);
    if (qty > batch.quantity) {
      return res.status(400).json({ success: false, message: `Only ${batch.quantity} units available` });
    }

    const order = new PurchaseOrder({
      buyerRole: 'RETAILER',
      buyerId: buyerId,
      buyerName: buyer.name,
      buyerRoleId: buyer.roleId,
      sellerRole: 'DISTRIBUTOR',
      sellerId: batch.distributorId._id,
      sellerName: batch.distributorId.name,
      batchId: batchId,
      cropName: batch.productName,
      quantityKg: qty,
      pricePerUnit: batch.pricePerUnit,
      totalAmount: qty * batch.pricePerUnit,
      deliveryStatus: 'PENDING_SELLER_ACCEPTANCE',
      escrowStatus: 'PENDING'
    });

    await order.save();

    return res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error('POST /retailer/marketplace/order error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================================
// RETAIL HUB — Retailer's inventory
// ============================================================

// GET /api/v1/retailer/inventory?userId=
router.get('/inventory', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const items = await RetailerBatch.find({ retailerId: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/v1/retailer/inventory
router.post('/inventory', async (req, res) => {
  try {
    const {
      userId, roleId,
      productName, category,
      quantity, pricePerUnit,
      parentDistBatchId, parentDistBatchIds,
      productImage, qrCodeUrl, traceUrl, date, batchId
    } = req.body;

    if (!userId || !productName || !quantity || !pricePerUnit) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const id = batchId || `RET-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const item = await RetailerBatch.create({
      _id: id,
      retailerId: userId,
      roleId: roleId || '',
      productName,
      category: category || 'Retail Goods',
      quantity: parseFloat(quantity),
      originalQuantity: parseFloat(quantity),
      pricePerUnit: parseFloat(pricePerUnit),
      parentDistBatchId: parentDistBatchId || null,
      parentDistBatchIds: parentDistBatchIds || [],
      productImage: productImage || null,
      qrCodeUrl: qrCodeUrl || null,
      traceUrl: traceUrl || null,
      date: date ? new Date(date) : new Date(),
      status: 'In Stock'
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error('POST /retailer/inventory error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/retailer/inventory/:id/list
router.put('/inventory/:id/list', async (req, res) => {
  try {
    const item = await RetailerBatch.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.status = item.status === 'Listed' ? 'In Stock' : 'Listed';
    item.updatedAt = new Date();
    await item.save();

    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/v1/retailer/inventory/:id
router.delete('/inventory/:id', async (req, res) => {
  try {
    await RetailerBatch.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================================
// PURCHASE ORDERS — Orders from Customers
// ============================================================

// GET /api/v1/retailer/purchase-orders?userId=
router.get('/purchase-orders', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const orders = await PurchaseOrder.find({ sellerId: userId, sellerRole: 'RETAILER' })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/retailer/purchase-orders/pending?userId=
router.get('/purchase-orders/pending', async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await PurchaseOrder.find({
      sellerId: userId,
      sellerRole: 'RETAILER',
      deliveryStatus: 'PENDING_SELLER_ACCEPTANCE'
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/retailer/purchase-orders/accepted?userId=
router.get('/purchase-orders/accepted', async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await PurchaseOrder.find({
      sellerId: userId,
      sellerRole: 'RETAILER',
      deliveryStatus: { $in: ['ACCEPTED', 'DISPATCHED', 'DELIVERED'] }
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/retailer/purchase-orders/:id/accept
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
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/retailer/purchase-orders/:id/dispatch
router.put('/purchase-orders/:id/dispatch', async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryStatus = 'DISPATCHED';
    order.dispatchedAt = new Date();
    order.updatedAt = new Date();
    await order.save();

    await RetailerBatch.findByIdAndUpdate(order.batchId, {
      status: 'Sold',
      updatedAt: new Date()
    });

    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================================
// SHIPMENTS
// ============================================================

// GET /api/v1/retailer/shipments/incoming?userId= — From Distributors
router.get('/shipments/incoming', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const shipments = await PurchaseOrder.find({
      buyerId: userId,
      buyerRole: 'RETAILER',
      deliveryStatus: { $in: ['ACCEPTED', 'DISPATCHED', 'DELIVERED'] }
    }).sort({ updatedAt: -1 });

    return res.json({ success: true, data: shipments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/retailer/shipments/outgoing?userId= — To Customers
router.get('/shipments/outgoing', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const shipments = await PurchaseOrder.find({
      sellerId: userId,
      sellerRole: 'RETAILER',
      deliveryStatus: { $in: ['DISPATCHED', 'DELIVERED'] }
    }).sort({ updatedAt: -1 });

    return res.json({ success: true, data: shipments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/retailer/shipments/:orderId/receive
router.put('/shipments/:orderId/receive', async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryStatus = 'DELIVERED';
    order.escrowStatus = 'RELEASED';
    order.deliveredAt = new Date();
    order.updatedAt = new Date();
    await order.save();

    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
