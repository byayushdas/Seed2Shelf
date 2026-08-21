const mongoose = require('mongoose');
require('dotenv').config();

const Processor = require('./models/Processor');
const PurchaseOrder = require('./models/PurchaseOrder');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const orders = await PurchaseOrder.find({ buyerRole: 'PROCESSOR', deliveryStatus: 'DELIVERED' });
    let count = 0;
    for (const order of orders) {
      const exists = await Processor.findOne({ parentRawBatchId: order.batchId, processorId: order.buyerId });
      if (!exists) {
        console.log('Minting for order', order.orderNumber);
        const newBatch = new Processor({
          _id: `RAW-PROC-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          processorId: order.buyerId,
          roleId: order.buyerRoleId,
          itemType: 'RAW',
          productName: order.cropName,
          category: 'Raw Material',
          quantity: order.quantityKg,
          originalQuantity: order.quantityKg,
          pricePerUnit: order.pricePerUnit,
          parentRawBatchId: order.batchId,
          status: 'In Stock',
          supplierFarmerId: order.sellerId,
          supplierFarmer: order.sellerName,
          remainingStock: order.quantityKg,
          processingStatus: 'Available for Processing',
          processingQuantity: 0
        });
        await newBatch.save();
        count++;
      }
    }
    console.log(`Done backfilling. Minted ${count} batches.`);
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}).catch(e => console.error(e));
