import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  // 1. Create Users
  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@demo.com' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'farmer@demo.com',
      password,
      role: 'FARMER',
      walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    },
  })

  const processor = await prisma.user.upsert({
    where: { email: 'processor@demo.com' },
    update: {},
    create: {
      name: 'FarmFresh Processing Co.',
      email: 'processor@demo.com',
      password,
      role: 'PROCESSOR',
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    },
  })

  const distributor = await prisma.user.upsert({
    where: { email: 'distributor@demo.com' },
    update: {},
    create: {
      name: 'AgriLogistics India',
      email: 'distributor@demo.com',
      password,
      role: 'DISTRIBUTOR',
      walletAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    },
  })

  const retailer = await prisma.user.upsert({
    where: { email: 'retailer@demo.com' },
    update: {},
    create: {
      name: 'Organic Mart Bangalore',
      email: 'retailer@demo.com',
      password,
      role: 'RETAILER',
      walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    },
  })

  // 2. Create a demo product: Premium Alphonso Mangoes
  const mangoes = await prisma.crop.create({
    data: {
      name: 'Premium Alphonso Mangoes',
      quantity: 500,
      harvestDate: new Date('2024-03-15'),
      farmerId: farmer.id,
      currentOwnerId: retailer.id, // Currently at the retailer
      batchId: 'BATCH-AUG-MNGO-001',
    },
  })

  // 3. Create Traceability History
  await prisma.batchHistory.createMany({
    data: [
      {
        cropId: mangoes.id,
        sender: 'Rajesh Kumar (Farmer)',
        receiver: 'FarmFresh Processing Co. (Processor)',
        deliveryDate: new Date('2024-03-20'),
        transactionHash: '0x8a92f8c12a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p',
      },
      {
        cropId: mangoes.id,
        sender: 'FarmFresh Processing Co. (Processor)',
        receiver: 'AgriLogistics India (Distributor)',
        deliveryDate: new Date('2024-03-22'),
        transactionHash: '0xcd19a3b2b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q',
      },
      {
        cropId: mangoes.id,
        sender: 'AgriLogistics India (Distributor)',
        receiver: 'Organic Mart Bangalore (Retailer)',
        deliveryDate: new Date('2024-03-24'),
        transactionHash: '0x112fa7b3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q',
      },
    ],
  })

  // 4. Create another product: Organic Basmati Rice (Currently with Distributor)
  const rice = await prisma.crop.create({
    data: {
      name: 'Organic Basmati Rice',
      quantity: 1000,
      harvestDate: new Date('2024-02-10'),
      farmerId: farmer.id,
      currentOwnerId: distributor.id,
      batchId: 'BATCH-FEB-RICE-099',
    },
  })

  await prisma.batchHistory.create({
    data: {
      cropId: rice.id,
      sender: 'Rajesh Kumar (Farmer)',
      receiver: 'FarmFresh Processing Co. (Processor)',
      deliveryDate: new Date('2024-02-15'),
      transactionHash: '0x9f5da0a1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7',
    }
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
