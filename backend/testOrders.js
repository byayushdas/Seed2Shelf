const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const PurchaseOrder = require('./models/PurchaseOrder');
  const orders = await PurchaseOrder.find({});
  console.log(JSON.stringify(orders.map(o => ({
    id: o.orderNumber, 
    buyerId: o.buyerId.toString(), 
    buyerRole: o.buyerRole, 
    sellerRole: o.sellerRole, 
    deliveryStatus: o.deliveryStatus, 
    batchId: o.batchId
  })), null, 2));
  mongoose.connection.close();
});
