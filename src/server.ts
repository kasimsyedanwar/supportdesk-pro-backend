import { Server } from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectMongo, disconnectMongo } from './config/mongo';
import { prisma } from './config/prisma';
import { disconnectRedis } from './config/redis';
import { activityLogService } from './modules/activity-logs/activity-log.service';

let server: Server;

const startServer = async (): Promise<void> => {
  await connectMongo();
  await activityLogService.ensureIndexes();

  server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        environment: env.NODE_ENV,
      },
      `SupportDesk Pro API running on http://localhost:${env.PORT}`,
    );
  });
};

const shutdown = (signal: string): void => {
  logger.info({ signal }, 'Shutdown signal received');

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    Promise.all([prisma.$disconnect(), disconnectMongo(), disconnectRedis()])
      .then(() => {
        logger.info('Prisma disconnected');
        logger.info('MongoDB disconnected');
        logger.info('Redis disconnected');
        logger.info('Server closed');
        process.exit(0);
      })
      .catch((error: unknown) => {
        logger.error({ error }, 'Error while shutting down services');
        process.exit(1);
      });
  });
};

startServer().catch((error: unknown) => {
  logger.fatal({ error }, 'Failed to start server');
  process.exit(1);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});
