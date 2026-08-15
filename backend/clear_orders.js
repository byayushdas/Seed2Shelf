// Script to delete ALL PurchaseOrder documents from MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushdas20241_db_user:WBkwqMWEiyRp82Yy@cluster0.jjsco4e.mongodb.net/?appName=Cluster0';

const purchaseOrderSchema = new mongoose.Schema({}, { strict: false });
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

async function clearAllOrders() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await PurchaseOrder.deleteMany({});
  console.log(`Deleted ${result.deletedCount} purchase order(s).`);

  await mongoose.disconnect();
  console.log('Done.');
}

clearAllOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
