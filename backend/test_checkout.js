require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const FarmerBatch = require('./models/Farmer');
const ProcessorBatch = require('./models/Processor');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const buyer = await User.findOne({ role: 'PROCESSOR' });
  const seller = await User.findOne({ role: 'FARMER' });
  const batch = await FarmerBatch.findOne({ status: 'Listed' });

  if (!buyer || !batch) {
    console.log("No buyer or batch found");
    process.exit(0);
  }

  console.log("Buyer:", buyer._id);
  console.log("Batch:", batch._id, "Quantity:", batch.quantity);

  const payload = {
    buyerId: buyer._id,
    buyerRole: 'PROCESSOR',
    paymentId: `pay_test_${Date.now()}`,
    totalAmount: batch.pricePerKg * 10,
    items: [{
      batchId: batch._id,
      quantity: 10
    }]
  };

  const res = await fetch('http://localhost:5001/api/v1/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log("Checkout response:", data);
  
  process.exit(0);
}
test();
