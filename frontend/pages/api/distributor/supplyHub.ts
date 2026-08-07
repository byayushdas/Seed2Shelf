import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import Crop from "../../../models/Crop";
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
    
    // Find crops that this distributor has purchased (buyerId == distributorId in Orders)
    const orders = await Order.find({ buyerId: distributorId });
    
    // Extract crop IDs from the order items
    const cropIds = orders.flatMap(o => o.items.map(i => i.cropId));
    
    // Fetch those crops
    const crops = await Crop.find({ _id: { $in: cropIds } });
    
    const mapped = crops.map(c => ({
      id: c._id,
      batchId: c._id,
      cropName: c.name,
      category: c.category,
      quantity: c.quantity,
      status: "IN STOCK", // Since the distributor purchased it
      harvestDate: new Date(c.harvestDate).toLocaleDateString(),
      value: c.pricePerUnit * c.quantity
    }));

    return res.status(200).json({ data: mapped });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching supply hub data", error: error.message });
  }
}

export default withAuth(withRole("distributor", handler));
