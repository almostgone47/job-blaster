import {PrismaClient} from '@prisma/client';

// Create a single, shared Prisma client instance with improved connection handling
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  // Enhanced connection pool configuration
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings for better stability
  __internal: {
    engine: {
      // Increase connection pool size
      connectionLimit: 20,
      // Better timeout handling
      pool: {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 300000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
    },
  },
});

// Enhanced error handling and connection recovery
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error: any) {
    // Log connection errors for debugging
    if (error.code === 'P1001' || error.code === 'P1008') {
      console.error('Database connection error:', error.message);
      console.error(
        'Consider checking your DATABASE_URL and connection pool settings',
      );
    }

    // Re-throw the error for proper handling
    throw error;
  }
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle process termination signals
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
