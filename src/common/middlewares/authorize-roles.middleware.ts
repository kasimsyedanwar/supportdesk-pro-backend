import { UserRole } from '@prisma/client';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../errors/app-error';

export const authorizeRoles = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(
        401,
        'Authentication required',
        'AUTHENTICATION_REQUIRED',
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        403,
        'You do not have permission to access this resource',
        'FORBIDDEN_ROLE',
        {
          requiredRoles: allowedRoles,
          currentRole: req.user.role,
        },
      );
    }

    next();
  };
};
