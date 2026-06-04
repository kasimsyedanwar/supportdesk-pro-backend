import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
    },
    `SupportDesk Pro API running on http://localhost:${env.PORT}`,
  );
});

const shutdown = (signal: string): void => {
  logger.info({ signal }, 'Shutdown signal received');

  server.close(() => {
    prisma
      .$disconnect()
      .then(() => {
        logger.info('Prisma disconnected');
        logger.info('Server closed');
        process.exit(0);
      })
      .catch((error: unknown) => {
        logger.error({ error }, 'Error while disconnecting Prisma');
        process.exit(1);
      });
  });
};

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
