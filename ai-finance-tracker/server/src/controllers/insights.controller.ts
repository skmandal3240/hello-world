import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as svc from '../services/insights.service';

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.listInsights(req.userId!)); } catch (e) { next(e); }
};

export const generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const month = parseInt(req.body.month) || now.getMonth() + 1;
    const year = parseInt(req.body.year) || now.getFullYear();
    res.json(await svc.generateInsights(req.userId!, month, year));
  } catch (e) { next(e); }
};

export const forecast = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.getForecast(req.userId!)); } catch (e) { next(e); }
};

export const chatEndpoint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reply = await svc.chatWithAI(req.userId!, req.body.message);
    res.json({ reply });
  } catch (e) { next(e); }
};
