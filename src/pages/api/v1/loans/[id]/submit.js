import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

async function submitHandler(req, res) {
  const { id } = req.query;
  
  // Update status
  await prisma.loanApplication.update({
    where: { id },
    data: { status: 'SUBMITTED' }
  });

  // Log it
  await prisma.auditLog.create({
    data: {
      userId: req.user.userId,
      action: 'LOAN_APPLICATION_SUBMIT',
      metadata: { loanId: id }
    }
  });

  res.status(200).json({ success: true });
}

export default createApiHandler(submitHandler, { allowedMethods: ['POST'], role: 'BORROWER' });