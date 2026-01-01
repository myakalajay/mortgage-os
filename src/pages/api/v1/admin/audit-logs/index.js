/**
 * @file src/pages/api/v1/admin/audit-logs/index.js
 * @description Fetch system-wide audit trail
 */

import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

async function auditLogsHandler(req, res) {
  if (req.method === 'GET') {
    // In a real app, we'd add ?page=1&limit=50 pagination here
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 events for MVP
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true, role: true }
        }
      }
    });

    return res.status(200).json({ success: true, data: logs });
  }
}

export default createApiHandler(auditLogsHandler, {
  allowedMethods: ['GET'],
  role: 'SUPER_ADMIN', // Strictly restricted
});