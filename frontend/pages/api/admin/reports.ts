import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../models/User";
import Order from "../../../models/Order";
import Transaction from "../../../models/Transaction";
import { withAuth } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ kycStatus: "approved" });
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: "DELIVERED" });
    const totalTransactions = await Transaction.countDocuments();
    
    // Calculate total volume
    const volumeData = await Transaction.aggregate([
      { $match: { status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalVolume = volumeData.length > 0 ? volumeData[0].total : 0;
    
    // We can simulate an array of report objects for the frontend
    const reports = [
      {
        _id: "report_users_summary",
        id: "report_users_summary",
        title: "User Summary Report",
        type: "USERS",
        status: "COMPLETED",
        createdAt: new Date(),
        data: { total: totalUsers, active: activeUsers }
      },
      {
        _id: "report_orders_summary",
        id: "report_orders_summary",
        title: "Orders Fulfillment Report",
        type: "ORDERS",
        status: "COMPLETED",
        createdAt: new Date(),
        data: { total: totalOrders, delivered: deliveredOrders }
      },
      {
        _id: "report_financial_summary",
        id: "report_financial_summary",
        title: "Financial Volume Report",
        type: "FINANCIAL",
        status: "COMPLETED",
        createdAt: new Date(),
        data: { transactions: totalTransactions, volume: totalVolume }
      }
    ];

    return res.status(200).json({ data: reports });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
}

export default withAuth(withRole("admin", handler));
