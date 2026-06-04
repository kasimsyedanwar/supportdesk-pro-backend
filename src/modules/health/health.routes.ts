import { Router } from 'express';
import { env } from '../../config/env';
import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { getReadiness } from './health.service';

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

healthRouter.get(
  '/ready',
  asyncHandler(async (_req, res) => {
    const readiness = await getReadiness();

    const statusCode = readiness.status === 'ready' ? 200 : 503;

    return sendSuccess(
      res,
      statusCode,
      readiness.status === 'ready'
        ? 'SupportDesk Pro API is ready'
        : 'SupportDesk Pro API is not ready',
      readiness,
    );
  }),
);
