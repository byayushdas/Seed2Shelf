import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Crop from "../../../models/Crop";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";
import { recordCropLineage } from "../../../services/blockchain";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const farmerId = req.user?.id;
  if (!farmerId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const crops = await Crop.find({ farmerId }).sort({ createdAt: -1 });
      
      const formattedCrops = crops.map(crop => ({
        id: crop._id,
        cropName: crop.name,
        category: crop.category,
        quantity: crop.quantity,
        unit: crop.unit,
        pricePerKg: crop.pricePerUnit,
        harvestDate: crop.harvestDate,
        status: crop.status,
        blockchainTxHash: crop.blockchainTxHash,
        createdAt: crop.createdAt
      }));
      
      return res.status(200).json({ data: formattedCrops });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching crops", error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { cropName, category, quantity, pricePerKg, harvestDate, unit } = req.body;
      
      // Simulate blockchain tx
      const txHash = await recordCropLineage(req.body);
      
      const newCrop = await Crop.create({
        farmerId,
        name: cropName,
        category: category || "General",
        quantity: Number(quantity),
        unit: unit || "kg",
        pricePerUnit: Number(pricePerKg),
        harvestDate: new Date(harvestDate),
        status: "AVAILABLE",
        blockchainTxHash: txHash
      });
      
      return res.status(201).json({ message: "Crop registered", data: newCrop });
    } catch (error: any) {
      return res.status(500).json({ message: "Error creating crop", error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, quantity, status } = req.body;
      
      const updatedCrop = await Crop.findOneAndUpdate(
        { _id: id, farmerId },
        { $set: { ...(quantity && { quantity }), ...(status && { status }) } },
        { new: true }
      );
      
      if (!updatedCrop) return res.status(404).json({ message: "Crop not found" });
      
      return res.status(200).json({ message: "Crop updated", data: updatedCrop });
    } catch (error: any) {
      return res.status(500).json({ message: "Error updating crop", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("farmer", handler));
