import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { batchId } = req.query;

      if (!batchId || typeof batchId !== "string") {
        return res.status(400).json({ message: "batchId is required" });
      }

      // Find the specific crop by batchId
      const targetCrop = await prisma.crop.findUnique({
        where: { batchId },
        include: {
          farmer: { select: { id: true, name: true, role: true } },
          currentOwner: { select: { id: true, name: true, role: true } }
        }
      });

      if (!targetCrop) {
        return res.status(404).json({ message: "Batch not found" });
      }

      // Trace lineage backwards
      const cropsChain = [];
      let currentCrop = targetCrop;
      cropsChain.push(currentCrop);

      while (currentCrop.parentCropId) {
        const parent = await prisma.crop.findUnique({
          where: { id: currentCrop.parentCropId },
          include: {
            farmer: { select: { id: true, name: true, role: true } },
            currentOwner: { select: { id: true, name: true, role: true } }
          }
        });
        if (parent) {
          cropsChain.unshift(parent);
          currentCrop = parent;
        } else {
          break;
        }
      }

      const originalCrop = cropsChain[0];
      const cropIds = cropsChain.map(c => c.id);

      const history = await prisma.batchHistory.findMany({
        where: { cropId: { in: cropIds } },
        orderBy: { createdAt: 'asc' }
      });

      const transactions = await prisma.transaction.findMany({
        where: { cropId: { in: cropIds } },
        orderBy: { timestamp: 'asc' }
      });

      return res.status(200).json({
        batchId,
        cropName: originalCrop.name,
        harvestDate: originalCrop.harvestDate,
        farmer: originalCrop.farmer,
        currentOwner: targetCrop.currentOwner,
        history,
        transactions,
        cropsChain
      });
    } catch (error) {
      console.error("History fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
