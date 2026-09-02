import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const addWatchlistSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
  voteAverage: z.number().optional(),
});

export const syncWatchlistSchema = z.object({
  items: z.array(addWatchlistSchema),
});

export const getWatchlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const items = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { tmdbId, mediaType, title, posterPath, voteAverage } = req.body;

    const item = await prisma.watchlist.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId,
          tmdbId,
          mediaType,
        },
      },
      update: {
        title,
        posterPath,
        voteAverage,
      },
      create: {
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        voteAverage,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await prisma.watchlist.deleteMany({
      where: {
        id,
        userId,
      },
    });

    res.json({ success: true, message: 'Item removed from watchlist.' });
  } catch (error) {
    next(error);
  }
};

export const syncWatchlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { items } = req.body;

    for (const item of items) {
      await prisma.watchlist.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: item.tmdbId,
            mediaType: item.mediaType,
          },
        },
        update: {
          title: item.title,
          posterPath: item.posterPath,
          voteAverage: item.voteAverage,
        },
        create: {
          userId,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          voteAverage: item.voteAverage,
        },
      });
    }

    const allItems = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: allItems });
  } catch (error) {
    next(error);
  }
};
