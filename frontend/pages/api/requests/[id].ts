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

      const existingRequest = await prisma.request.findUnique({
        where: { id: String(id) }
      });
      if (!existingRequest) return res.status(404).json({ message: "Not found" });

      let finalStatus = status;

      // Two-party delivery confirmation logic
      if (status === "CONFIRM_DELIVERY") {
        const isSeller = existingRequest.receiverId === req.body.userId;
        const isBuyer = existingRequest.senderId === req.body.userId;
        
        if (isSeller) {
          finalStatus = existingRequest.status === "BUYER_CONFIRMED" ? "DELIVERED" : "SELLER_CONFIRMED";
        } else if (isBuyer) {
          finalStatus = existingRequest.status === "SELLER_CONFIRMED" ? "DELIVERED" : "BUYER_CONFIRMED";
        } else {
          return res.status(403).json({ message: "Unauthorized to confirm delivery" });
        }
      }

      // Update request status
      const updatedRequest = await prisma.request.update({
        where: { id: String(id) },
        data: { status: finalStatus },
        include: { crop: true, sender: true, receiver: true }
      });

      // If delivered, split inventory in DB & log history & transaction
      if (finalStatus === "DELIVERED") {
        const originalCrop = updatedRequest.crop;
        const requestedQuantity = updatedRequest.quantity;

        // Deduct from seller
        const newSellerQuantity = Math.max(0, originalCrop.quantity - requestedQuantity);
        
        await prisma.crop.update({
          where: { id: updatedRequest.cropId },
          data: { 
            quantity: newSellerQuantity,
            isListed: newSellerQuantity > 0 ? originalCrop.isListed : false
          }
        });

        // Create new crop batch for buyer
        const newBatchId = originalCrop.batchId ? `${originalCrop.batchId}-${Math.random().toString(36).substring(2,6).toUpperCase()}` : `BATCH-${Math.random().toString(36).substring(2,8).toUpperCase()}`;

        const newCrop = await prisma.crop.create({
          data: {
            name: originalCrop.name,
            batchId: newBatchId,
            parentCropId: originalCrop.id,
            harvestDate: originalCrop.harvestDate,
            farmerId: originalCrop.farmerId,
            quantity: requestedQuantity,
            currentOwnerId: updatedRequest.senderId, // sender is the buyer
            isListed: false
          }
        });

        await prisma.transaction.create({
          data: {
            cropId: newCrop.id,
            senderRole: updatedRequest.receiver.role, // receiver of request is the seller
            receiverRole: updatedRequest.sender.role, // sender of request is the buyer
            blockchainHash: transactionHash || null,
          }
        });

        await prisma.batchHistory.create({
          data: {
            cropId: newCrop.id,
            sender: updatedRequest.receiver.name,
            receiver: updatedRequest.sender.name,
            deliveryDate: updatedRequest.deliveryDate,
            transactionHash: transactionHash || null,
          }
        });
      }

      return res.status(200).json(updatedRequest);
    } catch (error) {
      console.error("Patch Request Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
