import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/transactions.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

const createSchema = z.object({
  accountId: z.string().cuid(),
  categoryId: z.string().cuid().optional(),
  amount: z.number().positive(),
  description: z.string().min(1).max(255),
  notes: z.string().max(500).optional(),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']),
  isRecurring: z.boolean().optional(),
});

const updateSchema = createSchema.partial().omit({ accountId: true });

const csvImportSchema = z.object({
  accountId: z.string().cuid(),
  rows: z.array(z.object({
    date: z.string(),
    description: z.string(),
    amount: z.number(),
    type: z.enum(['EXPENSE', 'INCOME']),
    categoryId: z.string().optional(),
  })).max(500),
});

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, validate(createSchema), ctrl.create);
router.patch('/:id', authenticate, validate(updateSchema), ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);
router.post('/import/csv', authenticate, validate(csvImportSchema), ctrl.importCsv);
router.post('/categorize', authenticate, validate(z.object({
  descriptions: z.array(z.object({ id: z.string(), description: z.string() })).max(50),
  categories: z.array(z.object({ id: z.string(), name: z.string() })),
})), ctrl.categorize);

export default router;
