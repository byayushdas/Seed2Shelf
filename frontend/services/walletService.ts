import Transaction from "../models/Transaction";
import Order from "../models/Order";
import Shipment from "../models/Shipment";

export const getTransactionsForUser = async (userId: string) => {
  const transactions = await Transaction.find({ 
    $or: [{ payeeId: userId }, { payerId: userId }]
  })
  .populate('payerId', 'name')
  .populate('payeeId', 'name')
  .sort({ createdAt: -1 });

  return transactions.map(tx => ({
    id: tx._id,
    transactionId: tx.transactionId,
    amount: tx.amount,
    currency: tx.currency,
    status: tx.status,
    type: tx.type,
    direction: String(tx.payeeId?._id) === String(userId) ? "INBOUND" : "OUTBOUND",
    date: tx.createdAt
  }));
};

export const getInvoicesForUser = async (userId: string) => {
  const transactions = await Transaction.find({ 
    $or: [{ payeeId: userId }, { payerId: userId }],
    status: "COMPLETED"
  })
  .populate('payerId', 'name')
  .populate('payeeId', 'name')
  .sort({ createdAt: -1 });

  return transactions.map(tx => {
    const isPayee = String(tx.payeeId?._id) === String(userId);
    return {
      id: tx._id,
      invoiceId: "INV-" + tx.transactionId,
      amount: tx.amount,
      currency: tx.currency,
      status: "PAID",
      category: isPayee ? "SALES" : "PURCHASE",
      partyName: isPayee ? (tx.payerId as any)?.name : (tx.payeeId as any)?.name,
      date: tx.createdAt
    };
  });
};
