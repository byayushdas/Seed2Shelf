import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Return crops with optional filtering
      const { role, ownerId, ownerRole, isListed } = req.query;
      
      let filter: any = {};
      if (ownerId && typeof ownerId === "string") {
        filter.currentOwnerId = ownerId;
      }
      if (ownerRole && typeof ownerRole === "string") {
        filter.currentOwner = { role: ownerRole };
      }
      if (isListed === "true") {
        filter.isListed = true;
      } else if (isListed === "false") {
        filter.isListed = false;
      }

      const crops = await prisma.crop.findMany({
        where: filter,
        include: {
          farmer: { select: { name: true, walletAddress: true } },
          currentOwner: { select: { id: true, name: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(crops);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const { batchId, name, quantity, harvestDate, farmerId } = req.body;

      if (!name || !quantity || !harvestDate || !farmerId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const crop = await prisma.crop.create({
        data: {
          batchId: batchId || `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name,
          quantity: parseFloat(quantity),
          harvestDate: new Date(harvestDate),
          farmerId,
          currentOwnerId: farmerId // Farmer owns it initially
        }
      });

      return res.status(201).json(crop);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
