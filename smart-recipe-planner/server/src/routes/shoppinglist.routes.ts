import { Router } from 'express';
import * as ctrl from '../controllers/shoppinglist.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getShoppingList);
router.post('/generate', ctrl.generateShoppingList);
router.patch('/items/:id', ctrl.toggleItem);
router.delete('/items/:id', ctrl.deleteItem);

export default router;
