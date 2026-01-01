/**
 * @file src/pages/api/v1/profile/index.js
 * @description Self-service profile update
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { createApiHandler } from '@/lib/api-handler';

const ProfileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(), // Optional password change
});

async function profileHandler(req, res) {
  // GET: Fetch current user's profile
  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true }
    });
    return res.status(200).json({ success: true, data: user });
  }

  // PUT: Update current user's profile
  if (req.method === 'PUT') {
    const data = ProfileUpdateSchema.parse(req.body);
    const updateData = { ...data };

    // If password provided, hash it securely
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
      delete updateData.password;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
    });

    // Audit self-update
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'PROFILE_UPDATE',
        metadata: { fields: Object.keys(data) }
      }
    });

    return res.status(200).json({ success: true, message: 'Profile updated' });
  }
}

export default createApiHandler(profileHandler, {
  allowedMethods: ['GET', 'PUT'],
  role: true, // <--- FIXED: 'true' enables auth check for ALL logged-in roles
});