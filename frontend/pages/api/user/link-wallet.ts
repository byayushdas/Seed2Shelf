import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId, walletAddress } = req.body;

    if (!userId || !walletAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
      select: { id: true, name: true, walletAddress: true, role: true }
    });

    return res.status(200).json({ message: "Wallet linked successfully", user: updatedUser });
  } catch (error) {
    console.error("Link wallet error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
