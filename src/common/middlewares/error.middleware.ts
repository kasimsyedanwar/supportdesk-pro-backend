import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../config/logger';
import { AppError } from '../errors/app-error';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const requestId = res.locals.requestId as string | undefined;

  if (error instanceof AppError) {
    logger.warn(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: error.statusCode,
        errorCode: error.code,
        details: error.details,
      },
      error.message,
    );

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        code: error.code,
        details: error.details ?? null,
      },
      requestId,
    });
  }

  if (error instanceof ZodError) {
    logger.warn(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        issues: error.issues,
      },
      'Validation failed',
    );

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: error.issues,
      },
      requestId,
    });
  }

  logger.error(
    {
      requestId,
      method: req.method,
      path: req.originalUrl,
      error,
    },
    'Unhandled error',
  );

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details: null,
    },
    requestId,
  });
};
