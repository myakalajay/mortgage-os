/**
 * @file src/pages/api/v1/loans/index.js
 * @description Borrower Loan Management (List & Create)
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

// Schema for starting a new application
const CreateLoanSchema = z.object({
  loanType: z.enum(['PURCHASE', 'REFINANCE']),
  propertyState: z.string().length(2, "Use 2-letter state code (e.g., TX)"), // e.g., "TX", "CA"
  estimatedValue: z.number().min(10000).optional(),
});

async function loansHandler(req, res) {
  // GET: List all loans for the current user
  if (req.method === 'GET') {
    const loans = await prisma.loanApplication.findMany({
      where: { userId: req.user.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { documents: true } } // Return count of uploaded docs
      }
    });
    
    return res.status(200).json({ success: true, data: loans });
  }

  // POST: Start a new DRAFT application
  if (req.method === 'POST') {
    const data = CreateLoanSchema.parse(req.body);

    // Check if user already has an active loan to prevent spam (Optional Rule)
    const activeLoan = await prisma.loanApplication.findFirst({
      where: { 
        userId: req.user.userId,
        status: { notIn: ['CLOSED', 'REJECTED', 'WITHDRAWN'] }
      }
    });

    if (activeLoan) {
      return res.status(409).json({ 
        success: false, 
        error: { message: 'You already have an active application.' } 
      });
    }

    const newLoan = await prisma.loanApplication.create({
      data: {
        userId: req.user.userId,
        loanType: data.loanType,
        propertyState: data.propertyState,
        estimatedValue: data.estimatedValue,
        status: 'DRAFT',
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'LOAN_APPLICATION_SUBMIT', // Technically "STARTED"
        metadata: { loanId: newLoan.id, type: data.loanType }
      }
    });

    return res.status(201).json({ success: true, data: newLoan });
  }
}

export default createApiHandler(loansHandler, {
  allowedMethods: ['GET', 'POST'],
  role: 'BORROWER', // Only Borrowers (or Super Admin via override) should use this
});