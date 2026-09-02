import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import movieRoutes from './routes/movie.routes';
import tvRoutes from './routes/tv.routes';
import searchRoutes from './routes/search.routes';
import streamRoutes from './routes/stream.routes';
import authRoutes from './routes/auth.routes';
import watchlistRoutes from './routes/watchlist.routes';
import historyRoutes from './routes/history.routes';
import { errorHandler } from './middleware/error.middleware';
import { ENV } from './config/env';

export const createApp = () => {
  const app = express();

  // Security & Core Middlewares
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  app.use(cors({
    origin: true, // Allow frontend during development
    credentials: true,
  }));
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Cinevo API',
      timestamp: new Date().toISOString(),
      env: ENV.NODE_ENV,
    });
  });

  // Public Catalog & Streaming APIs
  app.use('/api/movies', movieRoutes);
  app.use('/api/tv', tvRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/play', streamRoutes);

  // Optional User & Authentication APIs
  app.use('/api/auth', authRoutes);
  app.use('/api/watchlist', watchlistRoutes);
  app.use('/api/history', historyRoutes);

  // Fallback 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
      },
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
