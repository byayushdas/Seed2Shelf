import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === "PATCH") {
    try {
      const { isListed } = req.body;
      
      const crop = await prisma.crop.update({
        where: { id: id as string },
        data: {
          isListed: isListed !== undefined ? isListed : undefined
        }
      });
      
      return res.status(200).json(crop);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
