import { Router } from 'express';
import { getSessionFeedback } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });
router.get('/', authenticate, getSessionFeedback);
export default router;
