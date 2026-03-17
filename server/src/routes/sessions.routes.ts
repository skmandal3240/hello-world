import { Router } from 'express';
import * as sessionsController from '../controllers/sessions.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/', authenticate, sessionsController.listSessions);
router.get('/:id', authenticate, sessionsController.getSession);

export default router;
