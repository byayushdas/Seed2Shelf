import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import ProcessedProduct from "../../../models/ProcessedProduct";
import Order from "../../../models/Order";
import Crop from "../../../models/Crop";
import { extendCropLineage } from "../../../services/blockchain";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const processorId = req.user?.id;
  if (!processorId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      // Fetch Processed Products
      const products = await ProcessedProduct.find({ processorId }).sort({ createdAt: -1 });
      
      // Fetch Raw Crops purchased by processor (from orders)
      const orders = await Order.find({ buyerId: processorId });
      const cropIds = orders.flatMap(o => o.items.map(i => i.cropId));
      const rawCrops = await Crop.find({ _id: { $in: cropIds } });

      const mappedProcessed = products.map(p => ({
        id: p._id,
        itemType: "PROCESSED",
        productName: p.name,
        category: p.category,
        quantity: p.quantity + " " + p.unit,
        pricePerUnit: p.pricePerUnit,
        date: new Date(p.createdAt).toLocaleDateString(),
        status: p.status === "AVAILABLE" ? "Listed" : "Dispatched",
        qrCodeUrl: "https://chart.googleapis.com/chart?cht=qr&chl=...",
        processingStatus: "Fully Processed",
        blockchainTxHash: p.blockchainTxHash
      }));

      const mappedRaw = rawCrops.map(c => ({
        id: c._id,
        itemType: "RAW",
        productName: c.name,
        category: c.category,
        quantity: c.quantity + " " + (c.unit || 'kg'),
        pricePerUnit: "N/A", // Already paid
        date: new Date(c.harvestDate).toLocaleDateString(),
        status: "In Stock",
        qrCodeUrl: "https://chart.googleapis.com/chart?cht=qr&chl=...",
        remainingStock: c.quantity + " " + (c.unit || 'kg')
      }));

      return res.status(200).json({ data: [...mappedProcessed, ...mappedRaw] });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching inventory", error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, category, quantity, pricePerUnit, sourceCropIds } = req.body;
      
      // In a real scenario, we'd fetch the source crops to get their existing hashes
      const sourceCrops = await Crop.find({ _id: { $in: sourceCropIds } });
      const hashes = sourceCrops.map(c => c.blockchainTxHash || "0x0");
      
      // Extend lineage
      const newTxHash = await extendCropLineage({ name, quantity }, hashes);
      
      const product = await ProcessedProduct.create({
        processorId,
        sourceCropIds,
        name,
        category,
        quantity,
        pricePerUnit,
        status: 'AVAILABLE',
        blockchainTxHash: newTxHash
      });

      return res.status(201).json({ message: "Processed product logged successfully", data: product });
    } catch (error: any) {
      return res.status(500).json({ message: "Error creating product", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("processor", handler));
