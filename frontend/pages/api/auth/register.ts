import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    // Exclude password from the response
    const userObject = newUser.toObject();
    delete userObject.password;

    return res.status(201).json({ message: "User registered successfully", user: userObject });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
