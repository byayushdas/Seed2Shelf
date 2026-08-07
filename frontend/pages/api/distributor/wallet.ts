import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Wallet from "../../../models/Wallet";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    const distributorId = req.user?.id;
    if (!distributorId) return res.status(401).json({ message: "Unauthorized" });

    let wallet = await Wallet.findOne({ userId: distributorId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: distributorId, balance: 50000, currency: 'USD' }); // Dist starts with money to buy
    }

    return res.status(200).json({ 
      data: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
        address: wallet.address || "0xSimulatedAddress456"
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching wallet", error: error.message });
  }
}

export default withAuth(withRole("distributor", handler));
