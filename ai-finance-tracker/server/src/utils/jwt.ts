import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions);

export const signRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
