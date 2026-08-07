import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Crop from "../../../models/Crop";
import ProcessedProduct from "../../../models/ProcessedProduct";
import User from "../../../models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    await connectToDatabase();

    const traceData: any[] = [];
    
    // First see if it's a ProcessedProduct
    let product = await ProcessedProduct.findById(id).populate('processorId');
    if (product) {
      traceData.push({
        stage: "Processing",
        title: "Processed & Packaged",
        date: new Date(product.createdAt).toLocaleDateString(),
        actor: (product.processorId as any)?.name || "Unknown Processor",
        location: (product.processorId as any)?.facilityLocation || "Unknown Location",
        txHash: product.blockchainTxHash || "0x...",
        details: `Processed ${product.quantity} ${product.unit} of ${product.name}`
      });

      // If it has source crops, fetch them
      if (product.sourceCropIds && product.sourceCropIds.length > 0) {
        for (const cropId of product.sourceCropIds) {
          const crop = await Crop.findById(cropId).populate('farmerId');
          if (crop) {
             traceData.push({
                stage: "Farming",
                title: "Harvested",
                date: new Date(crop.harvestDate).toLocaleDateString(),
                actor: (crop.farmerId as any)?.name || "Unknown Farmer",
                location: (crop.farmerId as any)?.farmLocation || "Unknown Location",
                txHash: crop.blockchainTxHash || "0x...",
                details: `Harvested ${crop.quantity} ${crop.unit} of ${crop.name}`
             });
          }
        }
      }
    } else {
      // Maybe it's a direct Crop
      const crop = await Crop.findById(id).populate('farmerId');
      if (crop) {
         traceData.push({
            stage: "Farming",
            title: "Harvested",
            date: new Date(crop.harvestDate).toLocaleDateString(),
            actor: (crop.farmerId as any)?.name || "Unknown Farmer",
            location: (crop.farmerId as any)?.farmLocation || "Unknown Location",
            txHash: crop.blockchainTxHash || "0x...",
            details: `Harvested ${crop.quantity} ${crop.unit} of ${crop.name}`
         });
      } else {
        return res.status(404).json({ message: "Product/Crop not found for traceability" });
      }
    }
    
    // Sort chronological (oldest first)
    // Farming -> Processing -> Retail
    const orderedTrace = traceData.reverse(); 

    return res.status(200).json({ data: orderedTrace });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching trace data", error: error.message });
  }
}
