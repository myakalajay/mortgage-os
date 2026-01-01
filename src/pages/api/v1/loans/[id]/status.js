/**
 * @file src/pages/api/v1/loans/[id]/status.js
 * @description Update Loan Status & Trigger Notification
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';
import { sendEmail, getStatusEmailTemplate } from '@/lib/email'; // <--- IMPORT

const StatusSchema = z.object({
  status: z.enum([
    'PROCESSING', 'UNDERWRITING', 'APPROVED_CONDITIONAL', 
    'CLEAR_TO_CLOSE', 'CLOSED', 'REJECTED'
  ])
});

async function statusHandler(req, res) {
  const { id } = req.query;
  const { status } = StatusSchema.parse(req.body);

  // 1. Update Database (And fetch User info for email)
  const updatedLoan = await prisma.loanApplication.update({
    where: { id },
    data: { status },
    include: { 
      user: { select: { email: true, firstName: true } } // <--- Fetch Email
    }
  });

  // 2. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: req.user.userId,
      action: 'STATUS_CHANGE',
      metadata: { 
        loanId: id, 
        newStatus: status,
        updatedBy: req.user.email 
      }
    }
  });

  // 3. TRIGGER NOTIFICATION (Fire & Forget)
  // We don't await this because we don't want to slow down the UI response
  const emailHtml = getStatusEmailTemplate(updatedLoan.user.firstName, status);
  
  sendEmail({
    to: updatedLoan.user.email,
    subject: `Loan Update: ${status.replace('_', ' ')}`,
    html: emailHtml
  }).catch(err => console.error("Failed to send email:", err));

  return res.status(200).json({ success: true, data: updatedLoan });
}

export default createApiHandler(statusHandler, {
  allowedMethods: ['PUT'],
  role: 'LENDER' 
});