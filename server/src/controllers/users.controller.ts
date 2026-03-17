import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import * as usersService from '../services/users.service';

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.getProfile(req.userId!);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { displayName, avatarUrl } = req.body;
    const user = await usersService.updateProfile(req.userId!, { displayName, avatarUrl });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function onboarding(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { nativeLanguageId, learningLanguageId, proficiencyLevel } = req.body;
    const user = await usersService.completeOnboarding(
      req.userId!,
      nativeLanguageId,
      learningLanguageId,
      proficiencyLevel
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await usersService.getStats(req.userId!);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
