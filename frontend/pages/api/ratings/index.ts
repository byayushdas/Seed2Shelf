import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { value, comment, reviewerId, revieweeId, requestId } = req.body;

      if (!value || !reviewerId || !revieweeId || !requestId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if request exists and is DELIVERED
      const request = await prisma.request.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "DELIVERED") {
        return res.status(400).json({ message: "You can only rate after delivery is completed." });
      }

      // Create rating
      const rating = await prisma.rating.create({
        data: {
          value: parseInt(value, 10),
          comment: comment || null,
          reviewerId,
          revieweeId,
          requestId
        }
      });

      return res.status(201).json(rating);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') {
        return res.status(400).json({ message: "You have already rated this transaction." });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
