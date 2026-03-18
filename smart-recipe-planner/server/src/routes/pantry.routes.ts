import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/pantry.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

const categoryEnum = z.enum(['PRODUCE','PROTEIN','DAIRY','GRAINS','PANTRY','SPICES','FROZEN','BEVERAGES','OTHER']);

const itemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(30),
  category: categoryEnum.optional(),
  expiryDate: z.string().optional(),
});

router.get('/', ctrl.getPantry);
router.post('/', validate(itemSchema), ctrl.addItem);
router.post('/bulk', validate(z.object({ items: z.array(itemSchema).min(1).max(50) })), ctrl.addBulk);
router.patch('/:id', validate(itemSchema.partial()), ctrl.updateItem);
router.delete('/:id', ctrl.deleteItem);

export default router;
