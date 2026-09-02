import { Request, Response, NextFunction } from 'express';
import { tvService } from '../services/tmdb/tv';

export const getPopularTV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const data = await tvService.getPopular(page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTopRatedTV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const data = await tvService.getTopRated(page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTVDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'TV ID must be a valid number.' } });
      return;
    }

    const tv = await tvService.getDetails(id);
    if (!tv) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'TV series not found.' } });
      return;
    }

    res.json({ success: true, data: tv });
  } catch (error) {
    next(error);
  }
};

export const getTVSeason = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const rawSeason = Array.isArray(req.params.season) ? req.params.season[0] : req.params.season;
    const id = parseInt(rawId as string, 10);
    const seasonNumber = parseInt(rawSeason as string, 10);

    if (isNaN(id) || isNaN(seasonNumber)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_PARAMETERS', message: 'ID and season number must be valid numbers.' } });
      return;
    }

    const season = await tvService.getSeason(id, seasonNumber);
    if (!season) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Season details not found.' } });
      return;
    }

    res.json({ success: true, data: season });
  } catch (error) {
    next(error);
  }
};

export const getTVCredits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'TV ID must be a valid number.' } });
      return;
    }

    const credits = await tvService.getCredits(id);
    res.json({ success: true, data: credits });
  } catch (error) {
    next(error);
  }
};
