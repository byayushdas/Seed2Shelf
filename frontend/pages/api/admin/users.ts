import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../models/User";
import { withAuth } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const { role, status, search } = req.query;
      
      let query: any = {};
      
      if (role && role !== "ALL") {
        query.role = (role as string).toLowerCase();
      }
      
      if (status && status !== "ALL") {
        if (status === "ACTIVE") query.kycStatus = "approved";
        else if (status === "SUSPENDED" || status === "DISABLED") query.kycStatus = "rejected";
        else if (status === "PENDING") query.kycStatus = "pending";
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }

      const users = await User.find(query).sort({ createdAt: -1 });
      
      // Transform for frontend expectations
      const transformedUsers = users.map((u: any) => ({
        _id: u._id,
        id: u._id, // Some frontends use id
        name: u.name,
        email: u.email,
        role: u.role.toUpperCase(),
        status: u.kycStatus === "approved" ? "ACTIVE" : (u.kycStatus === "rejected" ? "SUSPENDED" : "PENDING"),
        createdAt: u.createdAt,
        phone: u.phone,
        address: u.address
      }));

      return res.status(200).json({ data: transformedUsers });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching users", error: error.message });
    }
  }

  // Handle PUT for status update (e.g. KYC approval/rejection)
  if (req.method === "PUT") {
    try {
      // The frontend uses /api/v1/admin/users/status but we're consolidating in users.ts
      // or we can expect { userId, status, reason } in body
      const { userId, status } = req.body;
      
      if (!userId || !status) {
        return res.status(400).json({ message: "Missing userId or status" });
      }

      let kycStatus = "pending";
      if (status === "ACTIVE") kycStatus = "approved";
      if (status === "SUSPENDED" || status === "DISABLED" || status === "REJECTED") kycStatus = "rejected";

      const updatedUser = await User.findByIdAndUpdate(userId, { kycStatus }, { new: true });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({ message: "User status updated", data: updatedUser });
    } catch (error: any) {
      return res.status(500).json({ message: "Error updating user", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("admin", handler));
