import { Router } from 'express';
import { searchAll } from '../controllers/search.controller';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', rateLimiter(120, 60), searchAll);

export default router;
