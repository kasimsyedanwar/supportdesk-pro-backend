import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger';

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;

    logger.info(
      {
        requestId: res.locals.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      },
      'request completed',
    );
  });

  next();
};
