import {PrismaClient} from '@prisma/client';

// Create a single, shared Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  // Fix connection pool timeout issues
  // Use connection_limit in DATABASE_URL or set via environment
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
