import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Return mock wallet data for now
    return res.status(200).json({
      balance: 15400.50,
      currency: "USD"
    });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("retailer", handler));
