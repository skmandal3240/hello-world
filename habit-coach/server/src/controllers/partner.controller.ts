import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as partnerService from '../services/partner.service';

let ioInstance: Parameters<typeof partnerService.optIn>[2] | undefined;

export function setIO(io: NonNullable<Parameters<typeof partnerService.optIn>[2]>) {
  ioInstance = io;
}

export const getStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await partnerService.getStatus(req.userId!)); }
  catch (err) { next(err); }
};

export const optIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await partnerService.optIn(req.userId!, req.body.category, ioInstance)); }
  catch (err) { next(err); }
};

export const optOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await partnerService.optOut(req.userId!); res.status(204).send(); }
  catch (err) { next(err); }
};

export const getPartnerHabits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await partnerService.getPartnerHabits(req.userId!)); }
  catch (err) { next(err); }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    await partnerService.markMessagesRead(req.userId!);
    res.json(await partnerService.getMessages(req.userId!, page));
  } catch (err) { next(err); }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await partnerService.sendMessage(req.userId!, req.body.content, ioInstance)); }
  catch (err) { next(err); }
};
