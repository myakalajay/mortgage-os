const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Generate Secure Hashes
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('Pass@123', 12); // Standard password for others

  // ---------------------------------------------------------------------------
  // 1. SUPER ADMIN
  // ---------------------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: 'admin@platform.com' },
    update: {}, // If exists, do nothing
    create: {
      email: 'admin@platform.com',
      firstName: 'System',
      lastName: 'Admin',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    },
  });

  // ---------------------------------------------------------------------------
  // 2. LENDER
  // ---------------------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: 'lender@platform.com' },
    update: {},
    create: {
      email: 'lender@platform.com',
      firstName: 'Liam',
      lastName: 'Lender',
      passwordHash: userPassword,
      role: 'LENDER',
      status: 'ACTIVE'
    },
  });

  // ---------------------------------------------------------------------------
  // 3. BORROWER
  // ---------------------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: 'borrower@platform.com' },
    update: {},
    create: {
      email: 'borrower@platform.com',
      firstName: 'Bob',
      lastName: 'Borrower',
      passwordHash: userPassword,
      role: 'BORROWER',
      status: 'ACTIVE'
    },
  });

  console.log('--------------------------------------------------');
  console.log('✅ Database seeded successfully');
  console.log('--------------------------------------------------');
  console.log('👤 Super Admin: admin@platform.com / Admin@123');
  console.log('💼 Lender:      lender@platform.com / Pass@123');
  console.log('🏠 Borrower:    borrower@platform.com / Pass@123');
  console.log('--------------------------------------------------');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });