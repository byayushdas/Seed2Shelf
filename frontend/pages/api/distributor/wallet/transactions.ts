import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../../lib/mongoose";
import { withAuth, ExtendedNextApiRequest } from "../../../../middleware/withAuth";
import { withRole } from "../../../../middleware/withRole";
import { getTransactionsForUser } from "../../../../services/walletService";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const formatted = await getTransactionsForUser(userId);
    return res.status(200).json({ data: formatted });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
}

export default withAuth(withRole("distributor", handler));
