import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as sessionsService from '../services/sessions.service';

export async function listSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const result = await sessionsService.getSessionHistory(req.userId!, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await sessionsService.getSessionById(req.params.id, req.userId!);
    res.json(session);
  } catch (err) {
    next(err);
  }
}
