import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import ProcessedProduct from "../../../models/ProcessedProduct";
import Crop from "../../../models/Crop";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    
    // Retailers can buy ProcessedProducts from Processors
    const processedQuery: any = { status: "AVAILABLE" };
    
    // And possibly Crops directly from Distributors (who bought from farmers)
    // For simplicity, we just look at Crops that are AVAILABLE. In a real scenario,
    // this might specifically filter for crops owned by distributors.
    const cropQuery: any = { status: "AVAILABLE" };

    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search), 'i');
      processedQuery.$or = [
        { name: searchRegex },
        { category: searchRegex }
      ];
      cropQuery.$or = [
        { name: searchRegex },
        { category: searchRegex }
      ];
    }
    
    const processedProducts = await ProcessedProduct.find(processedQuery).populate('processorId', 'name facilityLocation');
    const crops = await Crop.find(cropQuery).populate('farmerId', 'name farmLocation'); // If sold by farmer directly, otherwise would need distributorId
    
    // Map to the frontend format expected by the retailer marketplace
    const mappedProcessed = processedProducts.map(p => ({
      id: p._id,
      batchId: p._id,
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      unit: p.unit || "kg",
      pricePerUnit: p.pricePerUnit,
      date: new Date(p.createdAt).toLocaleDateString(),
      supplierName: p.processorId ? (p.processorId as any).name : "Unknown Processor",
      supplierLocation: p.processorId ? (p.processorId as any).facilityLocation : "Unknown Location",
      type: "Processed",
      certifications: ["FSSAI Certified"],
      traceUrl: `/trace/${p._id}`
    }));

    const mappedCrops = crops.map(c => ({
      id: c._id,
      batchId: c._id,
      name: c.name,
      category: c.category,
      quantity: c.quantity,
      unit: c.unit || "kg",
      pricePerUnit: c.pricePerUnit,
      date: new Date(c.harvestDate).toLocaleDateString(),
      supplierName: c.farmerId ? (c.farmerId as any).name : "Unknown Supplier",
      supplierLocation: c.farmerId ? (c.farmerId as any).farmLocation : "Unknown Location",
      type: "Raw",
      certifications: ["Organic"],
      traceUrl: `/trace/${c._id}`
    }));

    return res.status(200).json({ data: [...mappedProcessed, ...mappedCrops] });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching marketplace data", error: error.message });
  }
}

export default withAuth(withRole("retailer", handler));
