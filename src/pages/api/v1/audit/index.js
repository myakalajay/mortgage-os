/**
 * @file src/pages/api/v1/audit/index.js
 * @description Fetch Audit Logs with Pagination & User Details
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

const QuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
});

async function auditHandler(req, res) {
  if (req.method !== 'GET') return; // createApiHandler handles 405, but safety first

  const { page, limit } = QuerySchema.parse(req.query);
  const skip = (page - 1) * limit;

  const [total, logs] = await prisma.$transaction([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, role: true } // Fetch who performed the action
        }
      }
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export default createApiHandler(auditHandler, {
  allowedMethods: ['GET'],
  role: 'SUPER_ADMIN',
});