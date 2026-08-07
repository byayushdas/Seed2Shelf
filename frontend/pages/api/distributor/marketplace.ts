import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Crop from "../../../models/Crop";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    
    // Only fetch available crops
    const query: any = { status: "AVAILABLE" };
    
    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search), 'i');
      query.$or = [
        { name: searchRegex },
        { category: searchRegex }
      ];
    }
    
    const crops = await Crop.find(query).populate('farmerId', 'name farmLocation');
    
    // Map to the frontend FarmerHarvestItem structure
    const mapped = crops.map(c => ({
      id: c._id,
      batchId: c._id, // Using crop ID as batch ID
      cropName: c.name,
      category: c.category,
      quantity: c.quantity,
      pricePerKg: c.pricePerUnit,
      harvestDate: new Date(c.harvestDate).toLocaleDateString(),
      farmerName: c.farmerId ? (c.farmerId as any).name : "Unknown Farmer",
      farmerLocation: c.farmerId ? (c.farmerId as any).farmLocation : "Unknown Location",
      certifications: ["Organic", "Fair Trade"], // Mocked certifications for now
      traceUrl: `/trace/${c._id}`
    }));

    return res.status(200).json({ data: mapped });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching marketplace data", error: error.message });
  }
}

export default withAuth(withRole("distributor", handler));
