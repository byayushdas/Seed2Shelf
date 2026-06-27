const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting repair...");
  
  // Find all DELIVERED requests
  const reqs = await prisma.request.findMany({
    where: { status: 'DELIVERED' },
    include: { crop: true, sender: true, receiver: true }
  });

  for (const req of reqs) {
    // Check if the buyer already has this child crop
    const existingChild = await prisma.crop.findFirst({
      where: {
        parentCropId: req.crop.id,
        currentOwnerId: req.sender.id,
        quantity: req.quantity
      }
    });

    if (!existingChild) {
      console.log(`Repairing request ${req.id} for ${req.quantity}kg ${req.crop.name}`);
      
      const newBatchId = req.crop.batchId ? `${req.crop.batchId}-${Math.random().toString(36).substring(2,6).toUpperCase()}` : `BATCH-${Math.random().toString(36).substring(2,8).toUpperCase()}`;

      const newCrop = await prisma.crop.create({
        data: {
          name: req.crop.name,
          batchId: newBatchId,
          parentCropId: req.crop.id,
          harvestDate: req.crop.harvestDate,
          farmerId: req.crop.farmerId,
          quantity: req.quantity,
          currentOwnerId: req.sender.id, // buyer
          isListed: false
        }
      });

      console.log(`Created new crop ${newCrop.id} for buyer ${req.sender.name}`);

      // We also missed the batch history and transactions!
      await prisma.transaction.create({
        data: {
          cropId: newCrop.id,
          senderRole: req.receiver.role, // seller
          receiverRole: req.sender.role, // buyer
          blockchainHash: null,
        }
      });

      await prisma.batchHistory.create({
        data: {
          cropId: newCrop.id,
          sender: req.receiver.name,
          receiver: req.sender.name,
          deliveryDate: req.deliveryDate,
          transactionHash: null,
        }
      });

      console.log("Created missing history/transaction.");
    }
  }

  console.log("Repair complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
