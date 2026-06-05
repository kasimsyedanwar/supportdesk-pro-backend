import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../errors/app-error';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { getRedisClient } from '../../config/redis';

const getClientIp = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || 'unknown';
};

export const redisRateLimit = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const redis = getRedisClient();

        const ip = getClientIp(req);
        const key = `rate-limit:${ip}`;

        const currentCount = await redis.incr(key);

        if (currentCount === 1) {
          await redis.expire(key, env.RATE_LIMIT_WINDOW_SECONDS);
        }

        const ttl = await redis.ttl(key);

        res.setHeader('X-RateLimit-Limit', env.RATE_LIMIT_MAX_REQUESTS);
        res.setHeader(
          'X-RateLimit-Remaining',
          Math.max(env.RATE_LIMIT_MAX_REQUESTS - currentCount, 0),
        );
        res.setHeader('X-RateLimit-Reset', ttl);

        if (currentCount > env.RATE_LIMIT_MAX_REQUESTS) {
          throw new AppError(
            429,
            'Too many requests, please try again later',
            'RATE_LIMIT_EXCEEDED',
            {
              retryAfterSeconds: ttl,
            },
          );
        }

        next();
      } catch (error) {
        if (error instanceof AppError) {
          next(error);
          return;
        }

        logger.error({ error }, 'Redis rate limiter failed');

        // Fail-open strategy:
        // If Redis has an issue, do not take the whole API down.
        next();
      }
    })();
  };
};
