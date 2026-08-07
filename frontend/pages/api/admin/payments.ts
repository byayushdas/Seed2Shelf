import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Transaction from "../../../models/Transaction";
import { withAuth } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { status, search } = req.query;
    await connectToDatabase();
    
    let query: any = {};
    
    if (status && status !== "ALL") {
      query.status = status;
    }
    
    if (search) {
      query.transactionId = { $regex: search, $options: "i" };
    }

    const transactions = await Transaction.find(query)
      .populate('payerId', 'name email')
      .populate('payeeId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
      
    const transformedTx = transactions.map(tx => ({
      _id: tx._id,
      id: tx._id,
      transactionId: tx.transactionId,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      type: tx.type,
      payer: tx.payerId ? (tx.payerId as any).name : "Unknown",
      payee: tx.payeeId ? (tx.payeeId as any).name : "Unknown",
      createdAt: tx.createdAt
    }));
      
    return res.status(200).json({ data: transformedTx });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
}

export default withAuth(withRole("admin", handler));
