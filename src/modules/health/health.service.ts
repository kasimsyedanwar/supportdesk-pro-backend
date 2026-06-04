import { checkMongoConnection } from '../../config/mongo';
import { checkPostgresConnection } from '../../config/postgres';
import { checkRedisConnection } from '../../config/redis';

type DependencyStatus = {
  status: 'up' | 'down';
  responseTimeMs: number;
  error?: string;
};

type ReadinessResult = {
  status: 'ready' | 'not_ready';
  dependencies: {
    postgres: DependencyStatus;
    redis: DependencyStatus;
    mongo: DependencyStatus;
  };
};

const checkDependency = async (
  checkFn: () => Promise<void>,
): Promise<DependencyStatus> => {
  const startedAt = Date.now();

  try {
    await checkFn();

    return {
      status: 'up',
      responseTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTimeMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getReadiness = async (): Promise<ReadinessResult> => {
  const [postgres, redis, mongo] = await Promise.all([
    checkDependency(checkPostgresConnection),
    checkDependency(checkRedisConnection),
    checkDependency(checkMongoConnection),
  ]);

  const isReady =
    postgres.status === 'up' && redis.status === 'up' && mongo.status === 'up';

  return {
    status: isReady ? 'ready' : 'not_ready',
    dependencies: {
      postgres,
      redis,
      mongo,
    },
  };
};
