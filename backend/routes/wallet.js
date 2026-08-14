const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/v1/wallet/transactions?userId=
router.get('/transactions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const txs = await Transaction.find({ userId }).sort({ timestamp: -1 });
    return res.json({ success: true, data: txs });
  } catch (err) {
    console.error('Fetch transactions error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
