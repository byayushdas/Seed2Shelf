const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');
require('dotenv').config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const orders = await PurchaseOrder.find({}).sort({ createdAt: -1 }).limit(10);
  console.log("Recent Orders in Atlas:");
  orders.forEach(o => console.log(o.orderNumber, "Created:", o.createdAt, "Status:", o.deliveryStatus, "SellerId:", o.sellerId, "SellerRole:", o.sellerRole));

  process.exit(0);
}

run();
