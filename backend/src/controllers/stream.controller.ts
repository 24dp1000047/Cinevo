import { Request, Response, NextFunction } from 'express';
import { streamManager } from '../services/streaming/streamManager';

export const getMovieStream = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId as string, 10);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Movie ID must be a valid number.' },
      });
      return;
    }

    const stream = await streamManager.getMovieStream(id);
    if (!stream) {
      res.status(503).json({
        success: false,
        error: {
          code: 'STREAM_UNAVAILABLE',
          message: 'Playback is temporarily unavailable. Please try again later.',
        },
      });
      return;
    }

    res.json({ success: true, data: stream });
  } catch (error) {
    next(error);
  }
};

export const getEpisodeStream = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const rawSeason = Array.isArray(req.params.season) ? req.params.season[0] : req.params.season;
    const rawEpisode = Array.isArray(req.params.episode) ? req.params.episode[0] : req.params.episode;

    const id = parseInt(rawId as string, 10);
    const season = parseInt(rawSeason as string, 10);
    const episode = parseInt(rawEpisode as string, 10);

    if (isNaN(id) || isNaN(season) || isNaN(episode)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'TV ID, season, and episode must be valid numbers.',
        },
      });
      return;
    }

    const stream = await streamManager.getEpisodeStream(id, season, episode);
    if (!stream) {
      res.status(503).json({
        success: false,
        error: {
          code: 'STREAM_UNAVAILABLE',
          message: 'Playback is temporarily unavailable. Please try again later.',
        },
      });
      return;
    }

    res.json({ success: true, data: stream });
  } catch (error) {
    next(error);
  }
};
