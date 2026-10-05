const mongoose = require('mongoose');
const Processor = require('./models/Processor');

async function check() {
  await mongoose.connect('mongodb+srv://ayushdas20241_db_user:WBkwqMWEiyRp82Yy@cluster0.jjsco4e.mongodb.net/?appName=Cluster0');
  
  const d = await Processor.find();
  const dl = await Processor.find({ status: 'Listed' });
  console.log("Processor Batches:", d.length, "Listed:", dl.length);

  process.exit(0);
}
check();
