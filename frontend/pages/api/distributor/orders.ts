import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import Crop from "../../../models/Crop";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const distributorId = req.user?.id;
  if (!distributorId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const orders = await Order.find({ buyerId: distributorId })
        .populate('sellerId', 'name')
        .sort({ createdAt: -1 });
        
      const mapped = orders.map(o => ({
        id: o._id,
        orderId: o.orderId,
        date: new Date(o.createdAt).toLocaleDateString(),
        totalAmount: o.totalAmount,
        status: o.status,
        sellerName: o.sellerId ? (o.sellerId as any).name : "Unknown",
        items: o.items
      }));

      return res.status(200).json({ data: mapped });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { items } = req.body;
      // items should be an array of { cropId, quantity, pricePerKg, sellerId }
      if (!items || !items.length) {
        return res.status(400).json({ message: "No items provided" });
      }

      // Group by seller to create multiple orders if from different sellers
      // For simplicity, we create one order per request in this mock, assuming single seller checkout
      const sellerId = items[0].sellerId;
      const orderId = `ORD-${Date.now()}`;
      
      let totalAmount = 0;
      
      for (const item of items) {
        totalAmount += item.quantity * item.pricePerKg;
        // Update crop status
        await Crop.findByIdAndUpdate(item.cropId, { status: 'SOLD' });
      }

      const order = await Order.create({
        orderId,
        buyerId: distributorId,
        sellerId: sellerId,
        items,
        totalAmount,
        status: 'PENDING'
      });

      return res.status(201).json({ message: "Order placed successfully", data: order });
    } catch (error: any) {
      return res.status(500).json({ message: "Error placing order", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("distributor", handler));
