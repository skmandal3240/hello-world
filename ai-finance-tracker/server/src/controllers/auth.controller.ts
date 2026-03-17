import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middleware/authenticate';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await authService.signup(req.body.email, req.body.password, req.body.displayName)); }
  catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await authService.login(req.body.email, req.body.password)); }
  catch (err) { next(err); }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await authService.refresh(req.body.refreshToken)); }
  catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await authService.logout(req.body.refreshToken); res.status(204).send(); }
  catch (err) { next(err); }
};
