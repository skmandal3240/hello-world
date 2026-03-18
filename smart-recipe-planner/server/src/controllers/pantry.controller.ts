import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as pantryService from '../services/pantry.service';

export const getPantry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await pantryService.getPantry(req.userId!)); }
  catch (err) { next(err); }
};

export const addItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await pantryService.addItem(req.userId!, req.body)); }
  catch (err) { next(err); }
};

export const addBulk = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await pantryService.addBulk(req.userId!, req.body.items)); }
  catch (err) { next(err); }
};

export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await pantryService.updateItem(req.userId!, req.params['id'] as string, req.body)); }
  catch (err) { next(err); }
};

export const deleteItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await pantryService.deleteItem(req.userId!, req.params['id'] as string); res.status(204).send(); }
  catch (err) { next(err); }
};
