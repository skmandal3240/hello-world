import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as habitsService from '../services/habits.service';

export const getHabits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await habitsService.getHabits(req.userId!)); }
  catch (err) { next(err); }
};

export const getHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await habitsService.getHabitWithHistory(req.userId!, req.params['id'] as string)); }
  catch (err) { next(err); }
};

export const createHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await habitsService.createHabit(req.userId!, req.body)); }
  catch (err) { next(err); }
};

export const updateHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await habitsService.updateHabit(req.userId!, req.params['id'] as string, req.body)); }
  catch (err) { next(err); }
};

export const archiveHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await habitsService.archiveHabit(req.userId!, req.params['id'] as string)); }
  catch (err) { next(err); }
};

export const deleteHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await habitsService.deleteHabit(req.userId!, req.params['id'] as string); res.status(204).send(); }
  catch (err) { next(err); }
};
