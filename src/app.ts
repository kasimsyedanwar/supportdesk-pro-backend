import express from 'express';
import { requestIdMiddleware } from './common/middlewares/request-id.middleware';
import { requestLoggerMiddleware } from './common/middlewares/request-logger.middleware';
import { errorHandler } from './common/middlewares/error.middleware';
import { notFoundMiddleware } from './common/middlewares/not-found.middleware';
import { redisRateLimit } from './common/middlewares/rate-limit.middleware';
import { apiRouter } from './routes';

export const app = express();

app.disable('x-powered-by');

app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.use(express.json({ limit: '1mb' }));
app.use(redisRateLimit());
app.use(apiRouter);

app.use(notFoundMiddleware);
app.use(errorHandler);
