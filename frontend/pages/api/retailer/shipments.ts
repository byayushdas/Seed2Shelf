import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Shipment from "../../../models/Shipment";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const retailerId = req.user?.id;
  if (!retailerId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const shipments = await Shipment.find({ receiverId: retailerId })
        .populate('senderId', 'name')
        .sort({ createdAt: -1 });
        
      const formatted = shipments.map(s => ({
        id: s._id,
        shipmentId: s.shipmentId,
        orderId: s.orderId,
        status: s.status,
        origin: s.origin,
        destination: s.destination,
        senderName: s.senderId ? (s.senderId as any).name : "Unknown",
        dispatchDate: s.dispatchDate,
        deliveryDate: s.deliveryDate,
        trackingNumber: s.trackingNumber
      }));
        
      return res.status(200).json({ data: formatted });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching shipments", error: error.message });
    }
  }

  // Retailer might accept incoming deliveries
  if (req.method === "PUT") {
    try {
      const { id, status } = req.body;
      const updated = await Shipment.findByIdAndUpdate(id, { status }, { new: true });
      return res.status(200).json({ data: updated });
    } catch (error: any) {
      return res.status(500).json({ message: "Error updating shipment", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("retailer", handler));
