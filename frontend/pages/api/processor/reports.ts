import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import Shipment from "../../../models/Shipment";
import ProcessedProduct from "../../../models/ProcessedProduct";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const processorId = req.user?.id;
  if (!processorId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      // Basic analytics
      const totalOrders = await Order.countDocuments({ buyerId: processorId });
      
      const orders = await Order.find({ buyerId: processorId });
      const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const shipments = await Shipment.find({ senderId: processorId });
      const totalShipments = shipments.length;
      const shipmentsInTransit = shipments.filter(s => s.status === "PENDING" || s.status === "DISPATCHED").length;

      const processedProducts = await ProcessedProduct.find({ processorId });
      const produceTransformed = processedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);

      return res.status(200).json({ 
        data: {
          totalOrders,
          totalSpent,
          totalShipments,
          shipmentsInTransit,
          produceTransformed
        }
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching processor reports", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("processor", handler));
