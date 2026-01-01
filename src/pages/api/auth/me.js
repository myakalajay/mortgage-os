/**
 * @file src/pages/api/auth/me.js
 * @description Session Persistence Endpoint
 * * INTENT:
 * Since we use HttpOnly cookies, the frontend cannot read the token directly.
 * This endpoint verifies the cookie and returns the user's profile.
 * It is called automatically by the 'useUser' hook on page load.
 */

import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // 1. Check for the cookie
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  // 2. Verify Token Integrity
  const payload = await verifyToken(token);

  if (!payload) {
    return res.status(401).json({ loggedIn: false });
  }

  // 3. (Optional) Fetch fresh data from DB to ensure role hasn't changed
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true }
  });

  if (!user) {
    return res.status(401).json({ loggedIn: false });
  }

  return res.status(200).json({
    loggedIn: true,
    user: user
  });
}