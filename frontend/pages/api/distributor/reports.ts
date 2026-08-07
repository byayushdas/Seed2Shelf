import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import Shipment from "../../../models/Shipment";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    
    const distributorId = req.user?.id;
    if (!distributorId) return res.status(401).json({ message: "Unauthorized" });

    // Aggregate reports
    const orders = await Order.find({ buyerId: distributorId });
    const shipments = await Shipment.find({ senderId: distributorId });
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalShipments = shipments.length;
    const shipmentsInTransit = shipments.filter(s => s.status === "IN_TRANSIT").length;

    return res.status(200).json({ 
      data: {
        totalOrders,
        totalSpent,
        totalShipments,
        shipmentsInTransit
      } 
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
}

export default withAuth(withRole("distributor", handler));
