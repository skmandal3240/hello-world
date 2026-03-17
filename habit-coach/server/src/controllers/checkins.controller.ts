import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as checkinsService from '../services/checkins.service';

export const getTodayStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await checkinsService.getTodayStatus(req.userId!)); }
  catch (err) { next(err); }
};

export const logCheckIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { habitId, completed, note, date } = req.body;
    res.status(201).json(await checkinsService.logCheckIn(req.userId!, habitId, completed, note, date));
  } catch (err) { next(err); }
};

export const updateCheckIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await checkinsService.updateCheckIn(req.userId!, req.params['id'] as string, req.body)); }
  catch (err) { next(err); }
};

export const getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    res.json(await checkinsService.getCheckInHistory(req.userId!, days));
  } catch (err) { next(err); }
};
