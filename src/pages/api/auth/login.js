/**
 * @file src/pages/api/auth/login.js
 * @description Secure Authentication Endpoint
 * * SECURITY:
 * - Rate Limiting (implied via failedAttempts logic)
 * - HttpOnly Cookies (prevents JavaScript access to tokens)
 * - Detailed Audit Logging
 */

import { z } from 'zod';
import { serialize } from 'cookie';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';
import { createApiHandler } from '@/lib/api-handler';

// Validation Schema
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

async function loginHandler(req, res) {
  // 1. Validate Input
  const { email, password } = LoginSchema.parse(req.body);

  // 2. Fetch User (Include passwordHash and status)
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // GENERIC ERROR: Don't reveal if email exists or password is wrong
  const INVALID_CREDENTIALS_MSG = 'Invalid email or password.';

  if (!user) {
    return res.status(401).json({ success: false, error: { message: INVALID_CREDENTIALS_MSG } });
  }

  // 3. Security Check: Is account locked/suspended?
  if (user.status === 'LOCKED' || user.status === 'SUSPENDED') {
    return res.status(403).json({ 
      success: false, 
      error: { message: 'Account is locked. Please contact compliance.' } 
    });
  }

  // 4. Verify Password
  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    // SECURITY: Increment failed attempts
    const newFailCount = user.failedAttempts + 1;
    let newStatus = user.status;

    // Lock account after 5 failed attempts (Regulation Standard)
    if (newFailCount >= 5) {
      newStatus = 'LOCKED';
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        failedAttempts: newFailCount,
        status: newStatus 
      }
    });

    return res.status(401).json({ success: false, error: { message: INVALID_CREDENTIALS_MSG } });
  }

  // 5. Success Logic: Reset counter & Update Timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      lastLoginAt: new Date(), 
      failedAttempts: 0 
    }
  });

  // 6. Generate JWT
  const token = await signToken({ userId: user.id, role: user.role });

  // 7. Set HttpOnly Cookie
  // This makes the token invisible to client-side JS (XSS Protection)
  res.setHeader('Set-Cookie', serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 Hours
    path: '/',
  }));

  // 8. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_LOGIN',
      metadata: { method: 'EMAIL_PASSWORD' }
    }
  });

  // Return User Context (No Token in body, it's in the cookie)
  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
  });
}

export default createApiHandler(loginHandler, { allowedMethods: ['POST'] });