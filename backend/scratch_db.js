const mongoose = require('mongoose');
const Distributor = require('./models/Distributor');
const Farmer = require('./models/Farmer');

async function check() {
  await mongoose.connect('mongodb+srv://ayushdas20241_db_user:WBkwqMWEiyRp82Yy@cluster0.jjsco4e.mongodb.net/?appName=Cluster0');
  
  const d = await Distributor.find();
  const dl = await Distributor.find({ status: 'Listed' });
  console.log("Distributor Batches:", d.length, "Listed:", dl.length);
  
  const f = await Farmer.find();
  const fl = await Farmer.find({ status: 'Listed' });
  console.log("Farmer Batches:", f.length, "Listed:", fl.length);

  process.exit(0);
}
check();
