import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as svc from '../services/budgets.service';

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month as string) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string) || now.getFullYear();
    res.json(await svc.listBudgets(req.userId!, month, year));
  } catch (e) { next(e); }
};

export const upsert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.upsertBudget(req.userId!, req.body)); } catch (e) { next(e); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await svc.deleteBudget(req.params.id, req.userId!); res.status(204).send(); } catch (e) { next(e); }
};
