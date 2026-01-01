/**
 * @file src/pages/api/v1/loans/[id].js
 * @description Single Loan Operations (Get Details, Update)
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

// Schema for updating loan details (e.g. 1003 form data)
const UpdateLoanSchema = z.object({
  propertyAddress: z.string().optional(),
  propertyCity: z.string().optional(),
  propertyZip: z.string().optional(),
  loanAmount: z.number().optional(),
  // Flexible JSON bucket for the massive 1003 form
  formData: z.record(z.any()).optional(), 
});

async function loanDetailHandler(req, res) {
  const { id } = req.query;

  // 1. Fetch Loan with Relations
  // We include 'user' details so Lenders can see who the borrower is.
  const loan = await prisma.loanApplication.findUnique({
    where: { id },
    include: {
      documents: true, // Include uploaded docs
      user: {
        select: { firstName: true, lastName: true, email: true } 
      }
    }
  });

  if (!loan) {
    return res.status(404).json({ success: false, error: { message: 'Loan not found' } });
  }

  // 2. Authorization Check (FIXED)
  // Allow access if:
  // - User is the Borrower (Owner)
  // - User is a Super Admin
  // - User is a Lender (New)
  const isOwner = loan.userId === req.user.userId;
  const isStaff = ['SUPER_ADMIN', 'LENDER'].includes(req.user.role);

  if (!isOwner && !isStaff) {
    return res.status(403).json({ success: false, error: { message: 'Unauthorized access to this loan' } });
  }

  // ---------------------------------------------------------------------------
  // METHOD: GET (Fetch Full Details)
  // ---------------------------------------------------------------------------
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, data: loan });
  }

  // ---------------------------------------------------------------------------
  // METHOD: PUT (Update Application Data)
  // ---------------------------------------------------------------------------
  if (req.method === 'PUT') {
    // Only allow updates if not closed/withdrawn
    // (Unless it's an Admin/Lender fixing a mistake, but we'll enforce strict rules for now)
    if (['CLOSED', 'WITHDRAWN', 'REJECTED'].includes(loan.status) && !isStaff) {
       return res.status(400).json({ success: false, error: { message: 'Cannot edit a finalized application.' } });
    }

    const data = UpdateLoanSchema.parse(req.body);

    const updatedLoan = await prisma.loanApplication.update({
      where: { id },
      data: {
        propertyAddress: data.propertyAddress,
        propertyCity: data.propertyCity,
        propertyZip: data.propertyZip,
        loanAmount: data.loanAmount,
        formData: data.formData, // Merge or replace JSON
      }
    });

    return res.status(200).json({ success: true, data: updatedLoan });
  }
}

export default createApiHandler(loanDetailHandler, {
  allowedMethods: ['GET', 'PUT'],
  role: true, // Allow any authenticated user (Role logic handled inside)
});