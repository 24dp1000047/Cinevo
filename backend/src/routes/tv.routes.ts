import { Router } from 'express';
import {
  getPopularTV,
  getTopRatedTV,
  getTVDetails,
  getTVSeason,
  getTVCredits,
} from '../controllers/tv.controller';

const router = Router();

router.get('/popular', getPopularTV);
router.get('/top-rated', getTopRatedTV);
router.get('/:id', getTVDetails);
router.get('/:id/season/:season', getTVSeason);
router.get('/:id/credits', getTVCredits);

export default router;
