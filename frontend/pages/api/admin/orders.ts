import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import { withAuth } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { status, search } = req.query;
    await connectToDatabase();
    
    let query: any = {};
    
    if (status && status !== "ALL") {
      query.status = status;
    }
    
    if (search) {
      query.orderId = { $regex: search, $options: "i" };
    }

    const orders = await Order.find(query)
      .populate('buyerId', 'name email role')
      .populate('sellerId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
      
    // Transform data
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      id: order._id,
      orderId: order.orderId,
      buyer: order.buyerId ? (order.buyerId as any).name : "Unknown",
      seller: order.sellerId ? (order.sellerId as any).name : "Unknown",
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    }));
      
    return res.status(200).json({ data: transformedOrders });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
}

export default withAuth(withRole("admin", handler));
