import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import ProcessedProduct from "../../../models/ProcessedProduct";
import Crop from "../../../models/Crop";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const retailerId = req.user?.id;
  if (!retailerId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      // Fetch products purchased by retailer (from orders)
      const orders = await Order.find({ buyerId: retailerId });
      
      const cropIds = orders.flatMap(o => o.items.filter(i => i.type !== 'Processed').map(i => i.cropId));
      const processedIds = orders.flatMap(o => o.items.filter(i => i.type === 'Processed').map(i => i.cropId));

      const rawCrops = await Crop.find({ _id: { $in: cropIds } });
      const processedProducts = await ProcessedProduct.find({ _id: { $in: processedIds } });

      const mappedRaw = rawCrops.map(c => ({
        id: c._id,
        itemType: "RAW",
        name: c.name,
        category: c.category,
        quantity: c.quantity + " " + (c.unit || 'kg'),
        pricePerUnit: c.pricePerUnit,
        date: new Date(c.harvestDate).toLocaleDateString(),
        status: "In Stock",
        traceUrl: `/trace/${c._id}`
      }));

      const mappedProcessed = processedProducts.map(p => ({
        id: p._id,
        itemType: "PROCESSED",
        name: p.name,
        category: p.category,
        quantity: p.quantity + " " + (p.unit || 'kg'),
        pricePerUnit: p.pricePerUnit,
        date: new Date(p.createdAt).toLocaleDateString(),
        status: "In Stock",
        traceUrl: `/trace/${p._id}`
      }));

      return res.status(200).json({ data: [...mappedRaw, ...mappedProcessed] });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching retail inventory", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("retailer", handler));
