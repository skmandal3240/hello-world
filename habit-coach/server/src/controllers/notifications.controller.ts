import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as notificationsService from '../services/notifications.service';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    res.json(await notificationsService.getNotifications(req.userId!, page));
  } catch (err) { next(err); }
};

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ count: await notificationsService.getUnreadCount(req.userId!) }); }
  catch (err) { next(err); }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await notificationsService.markRead(req.userId!, req.params['id'] as string)); }
  catch (err) { next(err); }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await notificationsService.markAllRead(req.userId!); res.status(204).send(); }
  catch (err) { next(err); }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await notificationsService.deleteNotification(req.userId!, req.params['id'] as string); res.status(204).send(); }
  catch (err) { next(err); }
};
