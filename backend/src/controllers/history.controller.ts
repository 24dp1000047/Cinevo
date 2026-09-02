import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const updateHistorySchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
  season: z.number().int().nullable().optional(),
  episode: z.number().int().nullable().optional(),
  progress: z.number().nonnegative(),
  duration: z.number().positive(),
});

export const syncHistorySchema = z.object({
  items: z.array(updateHistorySchema),
});

export const getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const history = await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const updateHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { tmdbId, mediaType, title, posterPath, season, episode, progress, duration } = req.body;

    const s = season ?? null;
    const e = episode ?? null;

    // Search for existing record
    const existing = await prisma.watchHistory.findFirst({
      where: {
        userId,
        tmdbId,
        mediaType,
        season: s,
        episode: e,
      },
    });

    let record;
    if (existing) {
      record = await prisma.watchHistory.update({
        where: { id: existing.id },
        data: {
          title,
          posterPath,
          progress,
          duration,
        },
      });
    } else {
      record = await prisma.watchHistory.create({
        data: {
          userId,
          tmdbId,
          mediaType,
          title,
          posterPath,
          season: s,
          episode: e,
          progress,
          duration,
        },
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await prisma.watchHistory.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'History item removed.' });
  } catch (error) {
    next(error);
  }
};

export const syncHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { items } = req.body;

    for (const item of items) {
      const s = item.season ?? null;
      const e = item.episode ?? null;

      const existing = await prisma.watchHistory.findFirst({
        where: {
          userId,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          season: s,
          episode: e,
        },
      });

      if (existing) {
        if (item.progress > existing.progress) {
          await prisma.watchHistory.update({
            where: { id: existing.id },
            data: {
              progress: item.progress,
              duration: item.duration,
              title: item.title,
              posterPath: item.posterPath,
            },
          });
        }
      } else {
        await prisma.watchHistory.create({
          data: {
            userId,
            tmdbId: item.tmdbId,
            mediaType: item.mediaType,
            title: item.title,
            posterPath: item.posterPath,
            season: s,
            episode: e,
            progress: item.progress,
            duration: item.duration,
          },
        });
      }
    }

    const allHistory = await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: allHistory });
  } catch (error) {
    next(error);
  }
};
