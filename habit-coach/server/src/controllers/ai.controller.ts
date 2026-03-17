import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as aiService from '../services/ai.service';

export const getNudge = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await aiService.getDailyNudge(req.userId!)); }
  catch (err) { next(err); }
};

export const getWeeklySummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await aiService.getWeeklySummary(req.userId!)); }
  catch (err) { next(err); }
};

export const chat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await aiService.chat(req.userId!, req.body.message, res); }
  catch (err) { next(err); }
};
