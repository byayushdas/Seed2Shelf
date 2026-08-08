import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await dbConnect();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let farmerId: string | undefined = undefined;
    let processorId: string | undefined = undefined;
    let adminId: string | undefined = undefined;
    if (role === "FARMER") {
      const lastFarmer = await User.findOne({ role: "FARMER", farmerId: { $ne: null } })
        .sort({ farmerId: -1 });

      let nextNum = 1;
      if (lastFarmer && lastFarmer.farmerId) {
        const match = lastFarmer.farmerId.match(/S2S-FRM-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1]) + 1;
        }
      }
      farmerId = `S2S-FRM-${String(nextNum).padStart(6, '0')}`;
    } else if (role === "PROCESSOR") {
      const lastProcessor = await User.findOne({ role: "PROCESSOR", processorId: { $ne: null } })
        .sort({ processorId: -1 });

      let nextNum = 1;
      if (lastProcessor && lastProcessor.processorId) {
        const match = lastProcessor.processorId.match(/S2S-PRC-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1]) + 1;
        }
      }
      processorId = `S2S-PRC-${String(nextNum).padStart(6, '0')}`;
    } else if (role === "ADMIN") {
      const lastAdmin = await User.findOne({ role: "ADMIN", adminId: { $ne: null } })
        .sort({ adminId: -1 });

      let nextNum = 1;
      if (lastAdmin && lastAdmin.adminId) {
        const match = lastAdmin.adminId.match(/S2S-ADM-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1]) + 1;
        }
      }
      adminId = `S2S-ADM-${String(nextNum).padStart(6, '0')}`;
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      farmerId,
      processorId,
      adminId,
      regDate: new Date()
    });

    return res.status(201).json({ message: "User created successfully", userId: user._id });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
