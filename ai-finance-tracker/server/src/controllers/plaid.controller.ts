import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as svc from '../services/plaid.service';
import { createError } from '../middleware/errorHandler';
import { env } from '../config/env';

function checkPlaidConfigured(res: Response): boolean {
  if (!env.PLAID_CLIENT_ID || !env.PLAID_SECRET) {
    res.status(501).json({ error: 'Plaid is not configured on this server' });
    return false;
  }
  return true;
}

export const linkToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!checkPlaidConfigured(res)) return;
  try { res.json({ linkToken: await svc.createLinkToken(req.userId!) }); } catch (e) { next(e); }
};

export const exchange = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!checkPlaidConfigured(res)) return;
  try {
    const { publicToken, institutionName } = req.body;
    res.json(await svc.exchangeToken(req.userId!, publicToken, institutionName));
  } catch (e) { next(e); }
};

export const sync = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!checkPlaidConfigured(res)) return;
  try { res.json(await svc.syncTransactions(req.userId!)); } catch (e) { next(e); }
};

export const disconnect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!checkPlaidConfigured(res)) return;
  try {
    await svc.disconnectItem(req.params.id, req.userId!);
    res.status(204).send();
  } catch (e) { next(e); }
};
