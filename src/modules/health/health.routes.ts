import { Router } from 'express';
import { env } from '../../config/env';
import { sendSuccess } from '../../common/utils/api-response';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  return sendSuccess(res, 200, 'SupportDesk Pro API is healthy', {
    service: 'supportdesk-pro-backend',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});
