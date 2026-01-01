/**
 * @file src/lib/prisma.js
 * @description Global Prisma Client Singleton
 * * INTENT:
 * Next.js hot-reloading in development creates a new module instance on every file save.
 * Without this singleton pattern, we would exhaust the database connection pool immediately,
 * causing "Fatals: too many connections" errors. This file ensures exactly one 
 * active Prisma Client instance exists per process.
 */

import { PrismaClient } from '@prisma/client';

// Attach prisma to the global scope in development to persist across hot-reloads
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'], // Reduce noise in production
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;