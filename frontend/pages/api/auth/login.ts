import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_innovat3_seed2shelf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required credentials' });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verify user exists and role matches intended dashboard
    if (!user || user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials or role mismatch' });
    }

    // Compare hashed passwords securely
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Session Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name, walletAddress: user.walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.setHeader('Set-Cookie', serialize('s2s_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    }));

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, role: user.role, email: user.email }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
