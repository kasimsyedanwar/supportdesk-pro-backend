import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;

export const connectRedis = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  redisClient.on('error', (error) => {
    logger.error({ error }, 'Redis error');
  });

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return connectRedis();
  }

  return redisClient;
};

export const checkRedisConnection = async (): Promise<void> => {
  const redis = getRedisClient();
  await redis.ping();
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
