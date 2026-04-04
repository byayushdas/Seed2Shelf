import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { userId, role } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "userId required" });
      }

      // Fetch requests where the user is either sender or receiver
      const requests = await prisma.request.findMany({
        where: {
          OR: [
            { senderId: String(userId) },
            { receiverId: String(userId) }
          ]
        },
        include: {
          crop: true,
          sender: { select: { name: true, role: true, walletAddress: true } },
          receiver: { select: { name: true, role: true, walletAddress: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const { senderId, receiverId, cropId, deliveryDate } = req.body;

      if (!senderId || !receiverId || !cropId || !deliveryDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const request = await prisma.request.create({
        data: {
          senderId,
          receiverId,
          cropId,
          deliveryDate: new Date(deliveryDate),
          status: "PENDING"
        }
      });

      return res.status(201).json(request);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
