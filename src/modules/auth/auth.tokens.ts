import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../../config/env';
import { AppError } from '../../common/errors/app-error';

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access';
};

export const signAccessToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  return jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'access',
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    },
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    if (typeof decoded === 'string') {
      throw new AppError(401, 'Invalid access token', 'INVALID_ACCESS_TOKEN');
    }

    const payload = decoded as JwtPayload & AccessTokenPayload;

    if (
      !payload.sub ||
      !payload.email ||
      !payload.role ||
      payload.type !== 'access'
    ) {
      throw new AppError(401, 'Invalid access token', 'INVALID_ACCESS_TOKEN');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      type: 'access',
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      401,
      'Invalid or expired access token',
      'INVALID_ACCESS_TOKEN',
    );
  }
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const hashRefreshToken = (refreshToken: string): string => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

export const getRefreshTokenExpiryDate = (): Date => {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS);

  return expiresAt;
};
