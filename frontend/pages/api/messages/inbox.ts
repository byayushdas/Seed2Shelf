import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "userId required" });
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: String(userId) }, { receiverId: String(userId) }]
        },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } }
        },
        orderBy: { timestamp: "desc" }
      });

      const userMap = new Map();
      messages.forEach(m => {
        const otherUser = m.senderId === userId ? m.receiver : m.sender;
        if (!userMap.has(otherUser.id)) {
          userMap.set(otherUser.id, {
            id: otherUser.id,
            name: otherUser.name,
            lastMessage: m.content,
            timestamp: m.timestamp
          });
        }
      });

      const conversations = Array.from(userMap.values());
      return res.status(200).json(conversations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
