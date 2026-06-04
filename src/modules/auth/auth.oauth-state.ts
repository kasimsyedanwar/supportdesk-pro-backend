import crypto from 'crypto';
import { env } from '../../config/env';
import { AppError } from '../../common/errors/app-error';

type OAuthStatePayload = {
  provider: 'google';
  nonce: string;
  createdAt: number;
};

const STATE_TTL_MS = 10 * 60 * 1000;

const encodeBase64Url = (value: string): string => {
  return Buffer.from(value, 'utf8').toString('base64url');
};

const decodeBase64Url = (value: string): string => {
  return Buffer.from(value, 'base64url').toString('utf8');
};

const createSignature = (payload: string): string => {
  return crypto
    .createHmac('sha256', env.OAUTH_STATE_SECRET)
    .update(payload)
    .digest('base64url');
};

const safeCompare = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const createOAuthState = (): string => {
  const payload: OAuthStatePayload = {
    provider: 'google',
    nonce: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = createSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

export const verifyOAuthState = (state: string): OAuthStatePayload => {
  const [encodedPayload, incomingSignature] = state.split('.');

  if (!encodedPayload || !incomingSignature) {
    throw new AppError(400, 'Invalid OAuth state', 'INVALID_OAUTH_STATE');
  }

  const expectedSignature = createSignature(encodedPayload);

  if (!safeCompare(incomingSignature, expectedSignature)) {
    throw new AppError(
      400,
      'Invalid OAuth state signature',
      'INVALID_OAUTH_STATE',
    );
  }

  const payload = JSON.parse(
    decodeBase64Url(encodedPayload),
  ) as OAuthStatePayload;

  if (payload.provider !== 'google') {
    throw new AppError(
      400,
      'Invalid OAuth provider state',
      'INVALID_OAUTH_STATE',
    );
  }

  if (Date.now() - payload.createdAt > STATE_TTL_MS) {
    throw new AppError(400, 'OAuth state expired', 'OAUTH_STATE_EXPIRED');
  }

  return payload;
};
