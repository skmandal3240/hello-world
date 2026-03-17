import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as svc from '../services/transactions.service';
import { categorizeBatch } from '../services/ai.service';

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { from, to, categoryId, accountId, type, q, page, limit } = req.query as Record<string, string>;
    res.json(await svc.listTransactions(req.userId!, {
      from, to, categoryId, accountId,
      type: type as any,
      q,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    }));
  } catch (e) { next(e); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await svc.createTransaction(req.userId!, req.body)); } catch (e) { next(e); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.updateTransaction(req.params.id, req.userId!, req.body)); } catch (e) { next(e); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await svc.deleteTransaction(req.params.id, req.userId!); res.status(204).send(); } catch (e) { next(e); }
};

export const importCsv = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId, rows } = req.body;
    const result = await svc.bulkImport(req.userId!, accountId, rows);
    res.json(result);
  } catch (e) { next(e); }
};

export const categorize = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { descriptions, categories } = req.body;
    const result = await categorizeBatch(descriptions, categories);
    res.json(result);
  } catch (e) { next(e); }
};
