# Database Connection Pool Fix

## Problem

Your Prisma client is experiencing connection pool timeouts with the error:

```
Timed out fetching a new connection from the connection pool. More info: http://pris.ly/d/connection-pool (Current connection pool timeout: 10, connection limit: 1)
```

## Solution

Add connection pool parameters to your DATABASE_URL in the `.env` file.

## Current DATABASE_URL (example)

```
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

## Updated DATABASE_URL with Connection Pool Parameters

```
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?connection_limit=10&pool_timeout=30&connect_timeout=30"
```

## Parameters Explained

- `connection_limit=10` - Increases max connections from 1 to 10
- `pool_timeout=30` - Increases pool timeout from 10s to 30s
- `connect_timeout=30` - Sets connection timeout to 30s

## Steps to Fix

1. Find your `.env` file in the `api/` directory
2. Update the DATABASE_URL line with the connection pool parameters
3. Restart your API server
4. Test the salary analytics endpoint

## Alternative: Environment Variables

If you prefer, you can also set these as separate environment variables:

```
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DATABASE_CONNECTION_LIMIT=10
DATABASE_POOL_TIMEOUT=30
DATABASE_CONNECT_TIMEOUT=30
```

## Why This Happens

- Supabase has a default connection limit of 1 for free tiers
- Concurrent queries (Promise.all) try to use multiple connections
- The connection pool times out waiting for available connections
- Our fallback logic will use sequential queries if concurrent fails
