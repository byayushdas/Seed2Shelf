import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Shipment from "../../../models/Shipment";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const farmerId = req.user?.id;
  if (!farmerId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const shipments = await Shipment.find({ senderId: farmerId })
        .populate('receiverId', 'name address')
        .sort({ createdAt: -1 });
        
      const formatted = shipments.map(s => ({
        id: s._id,
        shipmentId: s.shipmentId,
        orderId: s.orderId,
        status: s.status,
        origin: s.origin,
        destination: s.destination,
        receiverName: s.receiverId ? (s.receiverId as any).name : "Unknown",
        dispatchDate: s.dispatchDate,
        deliveryDate: s.deliveryDate,
        trackingNumber: s.trackingNumber
      }));
        
      return res.status(200).json({ data: formatted });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching shipments", error: error.message });
    }
  }
  
  if (req.method === "POST") {
    try {
      const { orderId, receiverId, origin, destination, trackingNumber } = req.body;
      const shipmentId = "SHP-" + Date.now();
      
      const newShipment = await Shipment.create({
        shipmentId,
        orderId,
        senderId: farmerId,
        receiverId,
        origin,
        destination,
        trackingNumber,
        status: "PENDING"
      });
      
      return res.status(201).json({ message: "Shipment created", data: newShipment });
    } catch (error: any) {
      return res.status(500).json({ message: "Error creating shipment", error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, status, trackingNumber } = req.body;
      
      const updateData: any = {};
      if (status) updateData.status = status;
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (status === "DISPATCHED") updateData.dispatchDate = new Date();
      if (status === "DELIVERED") updateData.deliveryDate = new Date();
      
      const updated = await Shipment.findOneAndUpdate(
        { _id: id, senderId: farmerId },
        { $set: updateData },
        { new: true }
      );
      
      if (!updated) return res.status(404).json({ message: "Shipment not found" });
      return res.status(200).json({ message: "Shipment updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ message: "Error updating shipment", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("farmer", handler));
