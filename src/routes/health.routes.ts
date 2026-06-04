import { Router, type Request, type Response } from 'express';

const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'SupportDesk Pro API is healthy',
    data: {
      service: 'supportdesk-pro-api',
      status: 'UP',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

export { healthRouter };
