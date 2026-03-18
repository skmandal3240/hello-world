import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as shoppingListService from '../services/shoppinglist.service';

export const getShoppingList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const week = req.query['week'] as string | undefined;
    res.json(await shoppingListService.getShoppingList(req.userId!, week));
  } catch (err) { next(err); }
};

export const generateShoppingList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await shoppingListService.generateShoppingList(req.userId!)); }
  catch (err) { next(err); }
};

export const toggleItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await shoppingListService.toggleItem(req.userId!, req.params['id'] as string)); }
  catch (err) { next(err); }
};

export const deleteItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await shoppingListService.deleteItem(req.userId!, req.params['id'] as string); res.status(204).send(); }
  catch (err) { next(err); }
};
