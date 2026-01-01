/**
 * @file src/pages/api/v1/lender/loans/index.js
 * @description Lender View: List all active applications
 */

import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

async function lenderLoansHandler(req, res) {
  if (req.method === 'GET') {
    // Fetch all loans that are SUBMITTED or active (Ignore Drafts)
    const loans = await prisma.loanApplication.findMany({
      where: {
        status: { not: 'DRAFT' } 
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true } // Include Borrower Info
        },
        _count: { select: { documents: true } }
      }
    });

    return res.status(200).json({ success: true, data: loans });
  }
}

export default createApiHandler(lenderLoansHandler, {
  allowedMethods: ['GET'],
  role: 'LENDER', // Restrict to Lenders
});