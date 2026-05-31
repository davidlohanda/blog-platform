import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: '15m',
  });
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function signRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign({ userId, tokenId }, config.jwt.refreshSecret, {
    expiresIn: '30d',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
}
