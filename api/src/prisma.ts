import {PrismaClient} from '@prisma/client';

// Create a single, shared Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  // Fix connection pool timeout issues
  // The connection pool settings are controlled by the DATABASE_URL
  // Add ?connection_limit=5&pool_timeout=30 to your DATABASE_URL if needed
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
