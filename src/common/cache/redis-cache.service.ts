import { logger } from '../../config/logger';
import { getRedisClient } from '../../config/redis';

export const redisCacheService = {
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      const value = await redis.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error({ error, key }, 'Failed to read from Redis cache');
      return null;
    }
  },

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const redis = getRedisClient();

      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      logger.error({ error, key }, 'Failed to write to Redis cache');
    }
  },

  async deleteKey(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Failed to delete Redis cache key');
    }
  },

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const stream = redis.scanStream({
        match: pattern,
        count: 100,
      });

      const pipeline = redis.pipeline();

      await new Promise<void>((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          for (const key of keys) {
            pipeline.del(key);
          }
        });

        stream.on('end', () => {
          resolve();
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });

      await pipeline.exec();
    } catch (error) {
      logger.error(
        { error, pattern },
        'Failed to delete Redis keys by pattern',
      );
    }
  },
};
