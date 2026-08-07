import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import { ExtendedNextApiRequest } from "./withAuth";

export function withRole(
  allowedRoles: string | string[],
  handler: (req: ExtendedNextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = (session.user as any).role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    // Attach user to request for downstream usage
    (req as ExtendedNextApiRequest).user = session.user;

    return handler(req as ExtendedNextApiRequest, res);
  };
}
