import { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';

type ValidationSchemas = {
  body?: z.ZodType;
};

export const validateRequest = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }

    next();
  };
};
