import { Router } from 'express';
import { getMovieStream, getEpisodeStream } from '../controllers/stream.controller';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Playback is completely public - rate limited for stability
router.get('/movie/:id', rateLimiter(90, 60), getMovieStream);
router.get('/tv/:id/:season/:episode', rateLimiter(90, 60), getEpisodeStream);

export default router;
