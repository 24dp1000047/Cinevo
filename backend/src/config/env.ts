import dotenv from 'dotenv';
dotenv.config();

// Re-evaluated on env changes
export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'cinevo-jwt-default-secret-key-2026',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  REDIS_URL: process.env.REDIS_URL || '',
  TMDB_API_KEY: process.env.TMDB_API_KEY || '',
  TEST_STREAM_API_URL: process.env.TEST_STREAM_API_URL || '',
  TEST_STREAM_API_KEY: process.env.TEST_STREAM_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
