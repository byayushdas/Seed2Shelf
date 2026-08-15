const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const PurchaseOrder = require('../models/PurchaseOrder');
const Razorpay = require('razorpay');

// GET /api/v1/wallet/transactions?userId=
router.get('/transactions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    let rzp = null;
    try {
      rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TAwi9UQj2Q7wP5',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'j41TrOzQZEd9WL9Mmu6oYahb'
      });
    } catch (e) {
      console.warn('Razorpay SDK init failed in wallet:', e.message);
    }

    const txs = await Transaction.find({ userId }).sort({ timestamp: -1 }).lean();
    
    // Enrich with Razorpay Data
    for (let i = 0; i < txs.length; i++) {
      let tx = txs[i];
      tx.razorpayData = null;
      if (tx.orderId) {
        const order = await PurchaseOrder.findOne({ orderNumber: tx.orderId });
        if (order && rzp) {
          if (tx.type === 'CREDIT' && tx.transactionId.startsWith('ref_')) {
             // It's a refund
             if (order.razorpayRefundId) {
               try {
                 const refundInfo = await rzp.refunds.fetch(order.razorpayRefundId);
                 tx.razorpayData = refundInfo;
               } catch (e) { console.error('Fetch refund info error:', e.message); }
             }
          } else if (order.razorpayPaymentId) {
             try {
               const paymentInfo = await rzp.payments.fetch(order.razorpayPaymentId);
               tx.razorpayData = paymentInfo;
             } catch (e) { console.error('Fetch payment info error:', e.message); }
          }
        }
      }
    }
    
    return res.json({ success: true, data: txs });
  } catch (err) {
    console.error('Fetch transactions error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
