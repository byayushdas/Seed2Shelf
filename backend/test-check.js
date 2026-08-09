const mongoose = require('mongoose');
const RoleInfo = require('./models/RoleInfo');

async function run() {
  await mongoose.connect('mongodb+srv://ayushdas20241_db_user:WBkwqMWEiyRp82Yy@cluster0.jjsco4e.mongodb.net/?appName=Cluster0');
  
  const roleInfo = await RoleInfo.findOne({ email: 'ad@gmail.com' });
  console.log(roleInfo.toObject());
  process.exit(0);
}
run();
