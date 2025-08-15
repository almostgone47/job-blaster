import prisma from './prisma';

export interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  timestamp: Date;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as health_check`;

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      message: `Database connection healthy (${responseTime}ms)`,
      timestamp: new Date(),
      connectionPool: {
        active: 0, // Prisma doesn't expose these directly
        idle: 0,
        total: 0,
      },
    };
  } catch (error: any) {
    console.error('Database health check failed:', error);

    let status: 'unhealthy' | 'degraded' = 'unhealthy';
    let message = 'Database connection failed';

    // Categorize different types of connection errors
    if (error.code === 'P1001') {
      message =
        'Cannot reach database server - check your DATABASE_URL and network';
    } else if (error.code === 'P1008') {
      message =
        'Database connection timeout - connection pool may be exhausted';
    } else if (error.code === 'P1017') {
      message = 'Database server closed connection - check connection limits';
    } else if (error.code === 'P2024') {
      message = 'Connection pool timeout - increase connection_limit parameter';
      status = 'degraded';
    }

    return {
      status,
      message: `${message}: ${error.message}`,
      timestamp: new Date(),
      connectionPool: {
        active: 0,
        idle: 0,
        total: 0,
      },
    };
  }
}

/**
 * Get database connection info for debugging
 */
export function getDatabaseInfo() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return {
      error: 'DATABASE_URL not configured',
      hasConnectionPool: false,
    };
  }

  try {
    const url = new URL(dbUrl);
    const hasConnectionPool =
      dbUrl.includes('connection_limit') || dbUrl.includes('pgbouncer');

    return {
      host: url.hostname,
      port: url.port,
      database: url.pathname.slice(1),
      hasConnectionPool,
      connectionParams: url.searchParams.toString(),
      // Don't log the full URL for security
      maskedUrl: `${url.protocol}//${url.hostname}:${url.port}${url.pathname}?[connection_params]`,
    };
  } catch (error) {
    return {
      error: 'Invalid DATABASE_URL format',
      hasConnectionPool: false,
    };
  }
}

/**
 * Log database connection information for debugging
 */
export function logDatabaseInfo() {
  const dbInfo = getDatabaseInfo();
  console.log('Database Connection Info:', JSON.stringify(dbInfo, null, 2));
}
