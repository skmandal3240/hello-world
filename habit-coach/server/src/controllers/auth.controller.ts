import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middleware/authenticate';
import { prisma } from '../config/prisma';

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

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, displayName: true, avatarColor: true, bio: true, timezone: true, matchingEnabled: true, preferredCategory: true, createdAt: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: req.body,
      select: { id: true, email: true, displayName: true, avatarColor: true, bio: true, timezone: true, matchingEnabled: true, preferredCategory: true, createdAt: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};
