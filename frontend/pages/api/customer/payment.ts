import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import Order from "../../../models/Order";
import { withAuth, ExtendedNextApiRequest } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";
import crypto from 'crypto';

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const customerId = req.user?.id;
  if (!customerId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "POST") {
    try {
      const { action, orderId, paymentId, signature } = req.body;

      if (action === "create") {
        // Mock creating a Razorpay order
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const rzpOrderId = `rzp_order_${Date.now()}`;
        
        return res.status(200).json({ 
          message: "Razorpay order created mock", 
          data: {
            id: rzpOrderId,
            amount: order.totalAmount * 100, // in paise
            currency: "INR"
          }
        });
      }

      if (action === "verify") {
        // Mock verifying payment
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Update payment status
        order.status = "PROCESSING";
        await order.save();

        return res.status(200).json({ message: "Payment verified successfully", data: order });
      }

      return res.status(400).json({ message: "Invalid action" });

    } catch (error: any) {
      return res.status(500).json({ message: "Error processing payment", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(withRole("customer", handler));
