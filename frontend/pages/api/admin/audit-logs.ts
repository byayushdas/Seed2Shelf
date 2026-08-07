import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../../lib/mongoose";
import AuditLog from "../../../models/AuditLog";
import { withAuth } from "../../../middleware/withAuth";
import { withRole } from "../../../middleware/withRole";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    
    const logs = await AuditLog.find()
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100);
      
    // Transform for frontend if needed
    const transformedLogs = logs.map(log => ({
      _id: log._id,
      id: log._id,
      actor: log.actorId ? (log.actorId as any).name : "Unknown",
      actorRole: log.actorId ? (log.actorId as any).role.toUpperCase() : "SYSTEM",
      action: log.action,
      targetId: log.targetId,
      timestamp: log.timestamp
    }));
      
    return res.status(200).json({ data: transformedLogs });
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching audit logs", error: error.message });
  }
}

export default withAuth(withRole("admin", handler));
