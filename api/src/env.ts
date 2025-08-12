import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 8080),
  DATABASE_URL: process.env.DATABASE_URL || '',
  ALLOW_ORIGIN: process.env.ALLOW_ORIGIN || 'http://localhost:5173',
};
