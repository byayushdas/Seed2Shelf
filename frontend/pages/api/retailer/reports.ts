import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import Shipment from "../../../models/Shipment";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const retailerId = req.user?.id;
  if (!retailerId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      // Basic analytics
      const totalOrders = await Order.countDocuments({ buyerId: retailerId });
      
      const orders = await Order.find({ buyerId: retailerId });
      const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const shipments = await Shipment.find({ receiverId: retailerId });
      const totalShipments = shipments.length;
      const shipmentsInTransit = shipments.filter(s => s.status === "PENDING" || s.status === "DISPATCHED").length;

      return res.status(200).json({ 
        data: {
          totalOrders,
          totalSpent,
          totalShipments,
          shipmentsInTransit
        }
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching retailer reports", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("retailer", handler));
