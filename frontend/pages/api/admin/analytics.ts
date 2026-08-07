import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../models/User";
import Order from "../../../models/Order";
import { withAuth } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    
    // User Registration Trend (Aggregated by day, simplified to role for now)
    // The frontend expects { _id: string, count: number } for userTrends
    const userTrends = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Order Dispatch Volume Trend
    const orderTrends = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Revenue Trends (Mock/Simplified: total amount by status)
    const revenueTrends = await Order.aggregate([
      {
        $match: { status: 'DELIVERED' }
      },
      {
        $group: {
          _id: "Total Revenue",
          count: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Summary stats
    const totalUsers = await User.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $ne: 'DELIVERED' } });

    return res.status(200).json({ 
      data: {
        userTrends,
        orderTrends,
        revenueTrends,
        totalUsers,
        activeOrders
      } 
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching analytics", error: error.message });
  }
}

export default withAuth(withRole("admin", handler));
