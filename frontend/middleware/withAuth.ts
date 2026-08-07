import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";

export interface ExtendedNextApiRequest extends NextApiRequest {
  user?: any;
}

export function withAuth(handler: (req: ExtendedNextApiRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request for downstream usage
    (req as ExtendedNextApiRequest).user = session.user;

    return handler(req as ExtendedNextApiRequest, res);
  };
}
