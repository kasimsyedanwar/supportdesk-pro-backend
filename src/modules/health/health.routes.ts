import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'SupportDesk Pro Api is healthy',
    data: {
      service: 'supportdesk-pro-backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
    },
  });
});
