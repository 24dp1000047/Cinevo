import { Router } from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  syncWatchlist,
  addWatchlistSchema,
  syncWatchlistSchema,
} from '../controllers/watchlist.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

router.get('/', getWatchlist);
router.post('/', validateBody(addWatchlistSchema), addToWatchlist);
router.delete('/:id', removeFromWatchlist);
router.post('/sync', validateBody(syncWatchlistSchema), syncWatchlist);

export default router;
