const mongoose = require('mongoose');
const ProcessorBatch = require('./models/Processor');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const batches = await ProcessorBatch.find({}).lean();
  console.log("Found batches:", batches.length);
  for (const b of batches) {
    console.log(`Batch: ${b._id}, status: ${b.status}, processorId: ${b.processorId}, type: ${typeof b.processorId}`);
  }
  process.exit(0);
}
check().catch(console.error);
