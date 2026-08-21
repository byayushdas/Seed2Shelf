require('dotenv').config();

async function testFrontendPayload() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
  
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI);
  const ProcessorBatch = require('./models/Processor');
  
  const batch = await ProcessorBatch.findOne({ quantity: { $gt: 0 } });
  if (!batch) { console.log('No batch found'); process.exit(1); }
  
  const distributorId = '6a79b2f7fea1b0619f9f84a3';
  
  const payload = {
    buyerId: distributorId,
    buyerRole: 'DISTRIBUTOR',
    items: [
      {
        harvestItem: {
          id: batch._id,
          batchId: batch._id,
          quantity: batch.quantity
        },
        selectedQuantity: 1
      }
    ],
    paymentId: 'pay_test_frontend_' + Date.now(),
    totalAmount: batch.pricePerUnit
  };

  const res = await fetch(BACKEND_URL + '/api/v1/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log('Checkout Response:', data);
  
  process.exit(0);
}

testFrontendPayload().catch(console.error);
