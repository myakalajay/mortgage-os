/**
 * @file src/pages/api/v1/users/[id].js
 * @description Single User Operations (Get, Update, Delete)
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

// Validation Schema for Updates
const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'LENDER', 'BORROWER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED']).optional(),
});

async function userDetailHandler(req, res) {
  const { id } = req.query;

  // 1. Validate ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: { message: 'Invalid or missing User ID' } });
  }

  // ---------------------------------------------------------------------------
  // METHOD: GET (Fetch Single User)
  // ---------------------------------------------------------------------------
  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, 
        role: true, status: true, createdAt: true, lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    return res.status(200).json({ success: true, data: user });
  }

  // ---------------------------------------------------------------------------
  // METHOD: PUT (Update User)
  // ---------------------------------------------------------------------------
  else if (req.method === 'PUT') {
    const data = UpdateUserSchema.parse(req.body);

    // Check if user exists before update (Standard Prisma practice)
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    
    // Perform Update
    const updatedUser = await prisma.user.update({
      where: { id },
      data: data,
      select: { id: true, email: true, role: true, status: true } // Don't return password
    });

    // Smart Audit Log: Determine specific action type
    const actionType = data.status && data.status !== existingUser.status 
      ? 'STATUS_CHANGE' 
      : 'USER_REGISTER'; // Fallback or add 'USER_UPDATE' to your Prisma Enum if possible

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: actionType, 
        metadata: { 
          targetId: id, 
          changes: data,
          previousStatus: existingUser.status
        }
      }
    });

    return res.status(200).json({ success: true, data: updatedUser });
  }

  // ---------------------------------------------------------------------------
  // METHOD: DELETE (Remove User)
  // ---------------------------------------------------------------------------
  else if (req.method === 'DELETE') {
    // Check existence
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Perform Delete
    await prisma.user.delete({ where: { id } });

    // Audit Log (Important for Deletions)
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'STATUS_CHANGE', // Ideally add 'USER_DELETED' to your Enum
        metadata: { 
          targetId: id, 
          deletedEmail: existingUser.email,
          reason: 'Admin deleted user' 
        }
      }
    });

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  }
}

export default createApiHandler(userDetailHandler, {
  allowedMethods: ['GET', 'PUT', 'DELETE'], // Added GET
  role: 'SUPER_ADMIN'
});