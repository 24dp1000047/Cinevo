import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/tmdb/search';

export const searchAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string, 10) || 1;

    if (!query.trim()) {
      res.json({
        success: true,
        data: { page: 1, results: [], total_pages: 0, total_results: 0 },
      });
      return;
    }

    const data = await searchService.searchMulti(query, page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
