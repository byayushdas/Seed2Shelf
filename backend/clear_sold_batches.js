// Script to delete all FarmerBatch documents with status "Sold"
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushdas20241_db_user:WBkwqMWEiyRp82Yy@cluster0.jjsco4e.mongodb.net/?appName=Cluster0';

const farmerSchema = new mongoose.Schema({
  _id: { type: String },
  farmerId: mongoose.Schema.Types.ObjectId,
  cropName: String,
  category: String,
  quantity: Number,
  pricePerKg: Number,
  status: String,
}, { strict: false });

const FarmerBatch = mongoose.model('Farmer', farmerSchema);

async function clearSoldBatches() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await FarmerBatch.deleteMany({ status: 'Sold' });
  console.log(`Deleted ${result.deletedCount} Sold farmer batch(es).`);

  await mongoose.disconnect();
  console.log('Done.');
}

clearSoldBatches().catch(err => {
  console.error(err);
  process.exit(1);
});
