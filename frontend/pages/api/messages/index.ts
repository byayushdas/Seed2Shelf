import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { userId, otherUserId } = req.query;
      
      if (!userId || !otherUserId) {
        return res.status(400).json({ message: "userId and otherUserId required" });
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: String(userId), receiverId: String(otherUserId) },
            { senderId: String(otherUserId), receiverId: String(userId) }
          ]
        },
        orderBy: { timestamp: 'asc' }
      });
      
      return res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const { senderId, receiverId, content } = req.body;

      if (!senderId || !receiverId || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content
        }
      });

      return res.status(201).json(message);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
