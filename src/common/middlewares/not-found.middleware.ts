import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(404, 'Route not found', 'ROUTE_NOT_FOUND', {
      method: req.method,
      path: req.originalUrl,
    }),
  );
};
