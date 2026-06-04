import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (event) => {
  logger.debug(
    {
      query: event.query,
      params: event.params,
      durationMs: event.duration,
    },
    'prisma query',
  );
});

prisma.$on('error', (event) => {
  logger.error(
    {
      target: event.target,
      message: event.message,
    },
    'prisma error',
  );
});

prisma.$on('warn', (event) => {
  logger.warn(
    {
      target: event.target,
      message: event.message,
    },
    'prisma warning',
  );
});
