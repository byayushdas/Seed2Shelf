import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const history = await prisma.batchHistory.findMany({
      where: { cropId: id as string },
      orderBy: { deliveryDate: 'asc' }
    });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching batch history" });
  }
}
