import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        walletAddress: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ratingAgg = await prisma.rating.aggregate({
      _avg: { value: true },
      where: { revieweeId: id as string }
    });

    res.status(200).json({
      ...user,
      averageRating: ratingAgg._avg.value || null
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
}
