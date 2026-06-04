import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
) => {
  const requestId = res.locals.requestId as string | undefined;
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    requestId,
  });
};
