const mongoose = require('mongoose');
const User = require('./models/User');
const RoleInfo = require('./models/RoleInfo');

async function run() {
  await mongoose.connect('mongodb+srv://ayushdas20241_db_user:WBkwqMWEiyRp82Yy@cluster0.jjsco4e.mongodb.net/?appName=Cluster0');
  
  // get a user
  const user = await User.findOne({});
  if (!user) {
    console.log("No user found");
    process.exit(1);
  }
  
  console.log("Found user:", user._id, user.email);
  
  let roleInfo = await RoleInfo.findOne({ email: user.email });
  if (!roleInfo) {
    console.log("Creating new RoleInfo");
    roleInfo = new RoleInfo({ _id: "PENDING_" + Date.now(), email: user.email, role: user.role, roleId: "PENDING" });
  } else {
    console.log("Found existing RoleInfo:", roleInfo._id);
  }
  
  const updateData = { name: "Test Name", farmName: "My Cool Farm", somethingElse: "Value" };
  
  for (const key in updateData) {
    roleInfo.set(key, updateData[key]);
  }
  
  roleInfo.updatedAt = Date.now();
  
  try {
    await roleInfo.save();
    console.log("Saved successfully!");
  } catch (err) {
    console.error("Save Error:", err);
  }
  
  process.exit(0);
}

run();
