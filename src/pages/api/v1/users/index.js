/**
 * @file src/pages/api/v1/users/index.js
 * @description User List API
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { createApiHandler } from '@/lib/api-handler';

// Validation Schemas
const QuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  search: z.string().optional(),
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'LENDER', 'BORROWER']),
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION']).optional().default('ACTIVE'),
});

async function usersHandler(req, res) {
  if (req.method === 'GET') {
    return await listUsers(req, res);
  } else if (req.method === 'POST') {
    return await createUser(req, res);
  }
}

async function listUsers(req, res) {
  // 1. Validate Query
  const { page, limit, search } = QuerySchema.parse(req.query);
  const skip = (page - 1) * limit;

  // 2. Build Search Filter
  const where = search ? {
    OR: [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ]
  } : {};

  // 3. Fetch Data
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
  ]);

  // 4. Return
  return res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function createUser(req, res) {
  const data = CreateUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return res.status(409).json({ success: false, error: { message: 'Email already exists' } });
  }

  const hashedPassword = await hashPassword(data.password);

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      status: data.status,
    },
    select: { id: true, email: true, role: true, createdAt: true }
  });

  return res.status(201).json({ success: true, data: newUser });
}

// Allow GET and POST, require SUPER_ADMIN role
export default createApiHandler(usersHandler, {
  allowedMethods: ['GET', 'POST'],
  role: 'SUPER_ADMIN', 
});