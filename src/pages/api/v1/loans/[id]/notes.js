/**
 * @file src/pages/api/v1/loans/[id]/notes.js
 * @description Internal Notes for Lenders/Admins
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

const CreateNoteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty"),
});

async function notesHandler(req, res) {
  const { id } = req.query;

  // ---------------------------------------------------------------------------
  // 1. Explicit Authorization Check
  // ---------------------------------------------------------------------------
  // We manually check roles here to ensure both LENDER and SUPER_ADMIN have access.
  // This prevents middleware 403s if the string comparison is too strict.
  const isAuthorized = ['LENDER', 'SUPER_ADMIN'].includes(req.user.role);

  if (!isAuthorized) {
    return res.status(403).json({ 
      success: false, 
      error: { message: 'Access denied: Lenders only.' } 
    });
  }

  // ---------------------------------------------------------------------------
  // 2. GET: Fetch notes for this loan
  // ---------------------------------------------------------------------------
  if (req.method === 'GET') {
    const notes = await prisma.loanNote.findMany({
      where: { loanId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { firstName: true, lastName: true, role: true } }
      }
    });
    return res.status(200).json({ success: true, data: notes });
  }

  // ---------------------------------------------------------------------------
  // 3. POST: Add a new note
  // ---------------------------------------------------------------------------
  if (req.method === 'POST') {
    const { content } = CreateNoteSchema.parse(req.body);

    const note = await prisma.loanNote.create({
      data: {
        loanId: id,
        userId: req.user.userId,
        content: content
      },
      include: {
        author: { select: { firstName: true, lastName: true, role: true } }
      }
    });

    return res.status(201).json({ success: true, data: note });
  }
}

export default createApiHandler(notesHandler, {
  allowedMethods: ['GET', 'POST'],
  // FIX: Change to 'true' to allow the handler to manage the specific role check above.
  // This resolves the 403 error if the middleware string check was failing.
  role: true, 
});