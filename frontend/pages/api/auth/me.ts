import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_innovat3_seed2shelf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.cookies.s2s_token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Fetch fresh user data from PostgreSQL Database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        walletAddress: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found in Database' });
    }

    return res.status(200).json({ user });

  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }
}
