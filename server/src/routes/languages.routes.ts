import { Router } from 'express';
import { listLanguages } from '../controllers/languages.controller';

const router = Router();
router.get('/', listLanguages);
export default router;
