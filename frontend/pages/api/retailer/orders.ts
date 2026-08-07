import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import ProcessedProduct from "../../../models/ProcessedProduct";
import Crop from "../../../models/Crop";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const retailerId = req.user?.id;
  if (!retailerId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      // List all orders placed by the retailer
      const orders = await Order.find({ buyerId: retailerId })
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
      if (!items || !items.length) {
        return res.status(400).json({ message: "No items provided" });
      }

      // We assume single seller for simplicity in this mock
      const sellerId = items[0].sellerId;
      const orderId = `ORD-${Date.now()}`;
      
      let totalAmount = 0;
      
      for (const item of items) {
        totalAmount += item.quantity * item.pricePerKg;
        // Update product status based on type
        if (item.type === "Processed") {
          await ProcessedProduct.findByIdAndUpdate(item.cropId, { status: 'SOLD' });
        } else {
          await Crop.findByIdAndUpdate(item.cropId, { status: 'SOLD' });
        }
      }

      const order = await Order.create({
        orderId,
        buyerId: retailerId,
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

export default withAuth(withRole("retailer", handler));
