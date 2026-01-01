/**
 * @file src/pages/api/auth/logout.js
 * @description Destroys the session cookie
 */

import { serialize } from 'cookie';

export default function logoutHandler(req, res) {
  // Overwrite the cookie with an expired date
  res.setHeader('Set-Cookie', serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Expire immediately (Epoch time)
    sameSite: 'strict',
    path: '/',
  }));

  res.status(200).json({ success: true, message: 'Logged out successfully' });
}