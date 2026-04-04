import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // request ID

  if (req.method === "PATCH") {
    try {
      const { status, transactionHash } = req.body; // status: ACCEPTED, REJECTED, SHIPPED, DELIVERED

      if (!status) {
         return res.status(400).json({ message: "Status required" });
      }

      // Update request status
      const request = await prisma.request.update({
        where: { id: String(id) },
        data: { status },
        include: { crop: true, sender: true, receiver: true }
      });

      // If delivered, transfer ownership in DB & log history & transaction
      if (status === "DELIVERED") {
        await prisma.crop.update({
          where: { id: request.cropId },
          data: { currentOwnerId: request.receiverId }
        });

        await prisma.transaction.create({
          data: {
            cropId: request.cropId,
            senderRole: request.sender.role,
            receiverRole: request.receiver.role,
            blockchainHash: transactionHash || null,
          }
        });

        await prisma.batchHistory.create({
          data: {
            cropId: request.cropId,
            sender: request.sender.name,
            receiver: request.receiver.name,
            deliveryDate: request.deliveryDate,
            transactionHash: transactionHash || null,
          }
        });
      }

      return res.status(200).json(request);
    } catch (error) {
      console.error("Patch Request Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
