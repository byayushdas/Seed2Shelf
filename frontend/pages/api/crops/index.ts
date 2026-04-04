import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Return crops with optional filtering
      const { role, ownerId } = req.query;
      
      let filter = {};
      if (ownerId && typeof ownerId === "string") {
        filter = { currentOwnerId: ownerId };
      }

      const crops = await prisma.crop.findMany({
        where: filter,
        include: {
          farmer: { select: { name: true, walletAddress: true } },
          currentOwner: { select: { name: true, role: true } }
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
          batchId: batchId || null,
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
