import { Router } from 'express';
import authRoutes from './auth.routes';
import accountsRoutes from './accounts.routes';
import categoriesRoutes from './categories.routes';
import transactionsRoutes from './transactions.routes';
import budgetsRoutes from './budgets.routes';
import insightsRoutes from './insights.routes';
import plaidRoutes from './plaid.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/budgets', budgetsRoutes);
router.use('/insights', insightsRoutes);
router.use('/plaid', plaidRoutes);

export default router;
