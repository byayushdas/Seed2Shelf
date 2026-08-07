import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const farmerId = req.user?.id;
  if (!farmerId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const orders = await Order.find({ sellerId: farmerId })
        .populate('buyerId', 'name email address')
        .sort({ createdAt: -1 });
        
      const formatted = orders.map(o => ({
        id: o._id,
        orderId: o.orderId,
        buyerName: o.buyerId ? (o.buyerId as any).name : "Unknown",
        status: o.status,
        totalAmount: o.totalAmount,
        items: o.items,
        createdAt: o.createdAt
      }));
        
      return res.status(200).json({ data: formatted });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
  }

  // Allow farmer to accept/reject order?
  if (req.method === "PUT") {
    try {
      const { id, status } = req.body;
      const updated = await Order.findOneAndUpdate(
        { _id: id, sellerId: farmerId },
        { $set: { status } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Order not found" });
      return res.status(200).json({ message: "Order updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ message: "Error updating order", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("farmer", handler));
