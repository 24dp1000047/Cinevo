import { Router } from 'express';
import { register, login, getProfile, registerSchema, loginSchema } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', rateLimiter(20, 60), validateBody(registerSchema), register);
router.post('/login', rateLimiter(20, 60), validateBody(loginSchema), login);
router.get('/profile', requireAuth, getProfile);

export default router;
