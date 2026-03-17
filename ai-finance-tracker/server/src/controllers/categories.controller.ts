import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as svc from '../services/categories.service';

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.listCategories(req.userId!)); } catch (e) { next(e); }
};
export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await svc.createCategory(req.userId!, req.body)); } catch (e) { next(e); }
};
export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await svc.deleteCategory(req.params.id, req.userId!); res.status(204).send(); } catch (e) { next(e); }
};
