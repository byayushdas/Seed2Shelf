import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from frontend or root .env
dotenv.config({ path: path.resolve(__dirname, "../../frontend/.env") });
// fallback if .env is at root
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

import User from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const roles = ["admin", "farmer", "distributor", "processor", "retailer", "customer"];
    
    const usersToCreate = roles.map((role) => ({
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@example.com`,
      password: hashedPassword,
      role: role,
      phone: "1234567890",
      address: "123 Test St",
      kycStatus: "approved",
    }));

    await User.insertMany(usersToCreate);
    console.log(`Successfully seeded ${roles.length} users.`);

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
