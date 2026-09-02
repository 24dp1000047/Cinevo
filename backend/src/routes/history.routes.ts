import { Router } from 'express';
import {
  getHistory,
  updateHistory,
  deleteHistoryItem,
  syncHistory,
  updateHistorySchema,
  syncHistorySchema,
} from '../controllers/history.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

router.get('/', getHistory);
router.post('/', validateBody(updateHistorySchema), updateHistory);
router.delete('/:id', deleteHistoryItem);
router.post('/sync', validateBody(syncHistorySchema), syncHistory);

export default router;
