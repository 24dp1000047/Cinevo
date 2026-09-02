import { Request, Response, NextFunction } from 'express';
import { movieService } from '../services/tmdb/movies';

export const getTrendingMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const data = await movieService.getTrending(page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPopularMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const data = await movieService.getPopular(page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTopRatedMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const data = await movieService.getTopRated(page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMovieDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Movie ID must be a valid number.' } });
      return;
    }

    const movie = await movieService.getDetails(id);
    if (!movie) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Movie not found.' } });
      return;
    }

    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

export const getMovieCredits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Movie ID must be a valid number.' } });
      return;
    }

    const credits = await movieService.getCredits(id);
    res.json({ success: true, data: credits });
  } catch (error) {
    next(error);
  }
};

export const getSimilarMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Movie ID must be a valid number.' } });
      return;
    }

    const data = await movieService.getSimilar(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMoviesByGenre = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawGenreId = Array.isArray(req.params.genreId) ? req.params.genreId[0] : req.params.genreId;
    const genreId = parseInt(rawGenreId as string, 10);
    const page = parseInt(req.query.page as string, 10) || 1;
    const data = await movieService.getByGenre(genreId, page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
