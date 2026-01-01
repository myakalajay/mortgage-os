import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';

async function statsHandler(req, res) {
  if (req.method === 'GET') {
    // Parallel DB queries for speed
    const [userCount, loanCount, volumeResult] = await Promise.all([
      prisma.user.count(),
      prisma.loanApplication.count(),
      prisma.loanApplication.aggregate({
        _sum: { estimatedValue: true } // Sum of all loan values
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: userCount,
        totalLoans: loanCount,
        totalVolume: volumeResult._sum.estimatedValue || 0
      }
    });
  }
}

export default createApiHandler(statsHandler, {
  allowedMethods: ['GET'],
  role: 'SUPER_ADMIN'
});