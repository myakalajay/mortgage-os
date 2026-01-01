/**
 * @file src/pages/api/v1/settings/index.js
 * @description CRUD for Global System Config
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

// Schema for updating a setting
const UpdateSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

async function settingsHandler(req, res) {
  // GET: List all settings
  if (req.method === 'GET') {
    const settings = await prisma.systemConfig.findMany({
      orderBy: { key: 'asc' }
    });
    return res.status(200).json({ success: true, data: settings });
  }

  // PUT: Update a specific setting
  else if (req.method === 'PUT') {
    const { key, value } = UpdateSettingSchema.parse(req.body);

    const updated = await prisma.systemConfig.upsert({
      where: { key },
      update: { 
        value, 
        updatedBy: req.user.userId 
      },
      create: { 
        key, 
        value, 
        description: 'Created via Admin Dashboard',
        updatedBy: req.user.userId
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'SYSTEM_CONFIG_CHANGE', // Add to Enum if possible, or use string
        metadata: { key, newValue: value }
      }
    });

    return res.status(200).json({ success: true, data: updated });
  }
}

export default createApiHandler(settingsHandler, {
  allowedMethods: ['GET', 'PUT'],
  role: 'SUPER_ADMIN',
});