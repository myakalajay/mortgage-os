/**
 * @file src/pages/api/v1/admin/users.js
 * @description Admin User Management (List & Delete)
 */

import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

async function usersHandler(req, res) {
  // GET: List all users
  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        // Optional: Count their applications if you want that stat
        _count: {
          select: { loanApplications: true }
        }
      }
    });

    return res.status(200).json({ success: true, data: users });
  }

  // DELETE: Remove a user (and cascade delete their data)
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, error: { message: 'User ID required' } });
    }

    // Prevent deleting yourself (Safety check)
    if (id === req.user.userId) {
      return res.status(400).json({ success: false, error: { message: 'Cannot delete your own account.' } });
    }

    // Perform Delete
    await prisma.user.delete({
      where: { id }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'USER_DELETE',
        metadata: { deletedUserId: id }
      }
    });

    return res.status(200).json({ success: true, message: 'User deleted' });
  }
}

export default createApiHandler(usersHandler, {
  allowedMethods: ['GET', 'DELETE'],
  role: 'SUPER_ADMIN', // Strictly restricted
});