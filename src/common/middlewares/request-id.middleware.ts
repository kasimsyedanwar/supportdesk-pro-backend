import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const incomingRequestId = req.header(REQUEST_ID_HEADER);

  const requestId =
    incomingRequestId && incomingRequestId.trim().length > 0
      ? incomingRequestId
      : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, requestId);
  res.locals.requestId = requestId;

  next();
};
