import { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';

type ValidationSchemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export const validateRequest = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }

    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as Request['params'];
    }

    if (schemas.query) {
      req.query = schemas.query.parse(req.query) as Request['query'];
    }

    next();
  };
};
