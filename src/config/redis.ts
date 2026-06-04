import Redis from 'ioredis';
import { env } from './env';

export const redisClient = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
});

export const checkRedisConnection = async (): Promise<void> => {
  if (redisClient.status === 'wait') {
    await redisClient.connect();
  }

  const response = await redisClient.ping();

  if (response !== 'PONG') {
    throw new Error('Redis health check failed');
  }
};
