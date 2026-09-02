import { createApp } from './app';
import { ENV } from './config/env';
import { prisma } from './config/db';

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`🎬 Cinevo API Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
  console.log(`   - Public endpoints: http://localhost:${ENV.PORT}/api/movies/trending`);
  console.log(`   - Public playback:  http://localhost:${ENV.PORT}/api/play/movie/550`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Prisma disconnected.');
    } catch (e) {
      console.error('Error disconnecting Prisma:', e);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
