const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ProcessorBatch = require('../models/Processor');
const DistributorBatch = require('../models/Distributor');
const PurchaseOrder = require('../models/PurchaseOrder');

// ============================================================
// MARKETPLACE — Browse listed processor products
// ============================================================

// GET /api/v1/distributor/marketplace?search=&category=
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

    const batches = await ProcessorBatch.find(query)
      .populate('processorId', 'name district state village')
      .sort({ createdAt: -1 });

    const mapped = batches.map((b) => {
      const processor = b.processorId;
      const processorName = processor?.name || 'Registered Processor';
      const processorLocation = [processor?.village, processor?.district, processor?.state]
        .filter(Boolean).join(', ') || 'India';

      const farmerDetails = b.originDetails?.farmer || {};

      return {
        id: b._id,
        batchId: b._id,
        productName: b.productName,
        cropName: farmerDetails.cropName || b.productName,
        category: b.category,
        processorName,
        processorLocation,
        farmerName: farmerDetails.name || processorName,
        farmerLocation: farmerDetails.location || processorLocation,
        quantity: b.quantity,
        unit: 'kg',
        pricePerUnit: b.pricePerUnit,
        totalPrice: b.quantity * b.pricePerUnit,
        processingDate: b.processingDate
          ? new Date(b.processingDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : 'Recently Processed',
        harvestDate: farmerDetails.harvestDate
          ? new Date(farmerDetails.harvestDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : (b.processingDate ? new Date(b.processingDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recently Processed'),
        hasQrCode: !!b.qrCodeUrl,
        imageUrl: b.productImage || '',
        parentRawBatchId: b.parentRawBatchId,
        parentRawBatchIds: b.parentRawBatchIds || [],
        originalCropImage: farmerDetails.cropImage || null,
        traceUrl: b.traceUrl || farmerDetails.traceUrl || null,
        originDetails: b.originDetails || {}
      };
    });

    return res.json({ success: true, data: mapped });
  } catch (err) {
    console.error('GET /distributor/marketplace error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/v1/distributor/marketplace/order — Distributor places buy request
router.post('/marketplace/order', async (req, res) => {
  try {
    const { buyerId, batchId, quantityKg } = req.body;
    if (!buyerId || !batchId || !quantityKg) {
      return res.status(400).json({ success: false, message: 'buyerId, batchId, quantityKg required' });
    }

    const batch = await ProcessorBatch.findById(batchId).populate('processorId', 'name');
    if (!batch) return res.status(404).json({ success: false, message: 'Processed batch not found' });
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
      buyerRole: 'DISTRIBUTOR',
      buyerId: buyerId,
      buyerName: buyer.name,
      buyerRoleId: buyer.roleId,
      sellerRole: 'PROCESSOR',
      sellerId: batch.processorId._id,
      sellerName: batch.processorId.name,
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
    console.error('POST /distributor/marketplace/order error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================================
// SUPPLY HUB — Distributor's inventory
// ============================================================

// GET /api/v1/distributor/inventory?userId=
router.get('/inventory', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const items = await DistributorBatch.find({ distributorId: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/v1/distributor/inventory
router.post('/inventory', async (req, res) => {
  try {
    const {
      userId, roleId,
      productName, category,
      quantity, pricePerUnit,
      parentProcessedBatchId, parentProcessedBatchIds,
      productImage, qrCodeUrl, traceUrl, date, batchId
    } = req.body;

    if (!userId || !productName || !quantity || !pricePerUnit) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const id = batchId || `DIST-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let originDetails = {};
    const primaryBatchId = parentProcessedBatchId || (parentProcessedBatchIds && parentProcessedBatchIds.length > 0 ? parentProcessedBatchIds[0] : null);
    
    if (primaryBatchId) {
      const pBatch = await ProcessorBatch.findById(primaryBatchId).populate('processorId', 'name district state village');
      if (pBatch) {
        const pUser = pBatch.processorId;
        const processorName = pUser?.name || 'Unknown Processor';
        const processorLocation = [pUser?.village, pUser?.district, pUser?.state].filter(Boolean).join(', ') || 'Unknown Location';
        
        originDetails = {
          ...(pBatch.originDetails || {}),
          processor: {
            batchId: pBatch._id,
            name: processorName,
            location: processorLocation,
            productName: pBatch.productName,
            category: pBatch.category,
            quantity: pBatch.quantity,
            pricePerUnit: pBatch.pricePerUnit,
            processingDate: pBatch.processingDate,
            productImage: pBatch.productImage,
            qrCodeUrl: pBatch.qrCodeUrl,
            traceUrl: pBatch.traceUrl,
            parentRawBatchIds: pBatch.parentRawBatchIds && pBatch.parentRawBatchIds.length > 0 ? pBatch.parentRawBatchIds : (pBatch.parentRawBatchId ? [pBatch.parentRawBatchId] : [])
          }
        };
      }
    }

    const item = await DistributorBatch.create({
      _id: id,
      distributorId: userId,
      roleId: roleId || '',
      productName,
      category: category || 'Processed Goods',
      quantity: parseFloat(quantity),
      originalQuantity: parseFloat(quantity),
      pricePerUnit: parseFloat(pricePerUnit),
      parentProcessedBatchId: parentProcessedBatchId || null,
      parentProcessedBatchIds: parentProcessedBatchIds || [],
      productImage: productImage || null,
      qrCodeUrl: qrCodeUrl || null,
      traceUrl: traceUrl || null,
      date: date ? new Date(date) : new Date(),
      status: 'In Stock',
      originDetails
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error('POST /distributor/inventory error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/distributor/inventory/:id/list
router.put('/inventory/:id/list', async (req, res) => {
  try {
    const item = await DistributorBatch.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.status = item.status === 'Listed' ? 'In Stock' : 'Listed';
    item.updatedAt = new Date();
    await item.save();

    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/v1/distributor/inventory/:id
router.delete('/inventory/:id', async (req, res) => {
  try {
    await DistributorBatch.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================================
// PURCHASE ORDERS — Orders from Retailers
// ============================================================

// GET /api/v1/distributor/purchase-orders?userId=
router.get('/purchase-orders', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const orders = await PurchaseOrder.find({ sellerId: userId, sellerRole: 'DISTRIBUTOR' })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/distributor/purchase-orders/pending?userId=
router.get('/purchase-orders/pending', async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await PurchaseOrder.find({
      sellerId: userId,
      sellerRole: 'DISTRIBUTOR',
      deliveryStatus: 'PENDING_SELLER_ACCEPTANCE'
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/distributor/purchase-orders/accepted?userId=
router.get('/purchase-orders/accepted', async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await PurchaseOrder.find({
      sellerId: userId,
      sellerRole: 'DISTRIBUTOR',
      deliveryStatus: { $in: ['ACCEPTED', 'DISPATCHED', 'DELIVERED'] }
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/distributor/purchase-orders/:id/accept
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

// PUT /api/v1/distributor/purchase-orders/:id/reject
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

// PUT /api/v1/distributor/purchase-orders/:id/dispatch
router.put('/purchase-orders/:id/dispatch', async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryStatus = 'DISPATCHED';
    order.dispatchedAt = new Date();
    order.updatedAt = new Date();
    await order.save();

    await DistributorBatch.findByIdAndUpdate(order.batchId, {
      status: 'Dispatched',
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

// GET /api/v1/distributor/shipments/incoming?userId= — From Processors
router.get('/shipments/incoming', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const shipments = await PurchaseOrder.find({
      buyerId: userId,
      buyerRole: 'DISTRIBUTOR',
      deliveryStatus: { $in: ['ACCEPTED', 'DISPATCHED', 'DELIVERED'] }
    }).sort({ updatedAt: -1 });

    return res.json({ success: true, data: shipments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/distributor/shipments/outgoing?userId= — To Retailers
router.get('/shipments/outgoing', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const shipments = await PurchaseOrder.find({
      sellerId: userId,
      sellerRole: 'DISTRIBUTOR',
      deliveryStatus: { $in: ['DISPATCHED', 'DELIVERED'] }
    }).sort({ updatedAt: -1 });

    return res.json({ success: true, data: shipments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/distributor/shipments/:orderId/receive
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

// PUT /api/v1/distributor/shipments/:orderId/reject
router.put('/shipments/:orderId/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await PurchaseOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryStatus = 'REJECTED';
    order.rejectionReason = reason || 'Delivery rejected by buyer';
    order.updatedAt = new Date();
    await order.save();

    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
