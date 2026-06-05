import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { redisCacheService } from '../../common/cache/redis-cache.service';
import { env } from '../../config/env';
import { DashboardQuery } from './dashboard.schemas';

type CurrentUser = {
  id: string;
  role: UserRole;
};

const stableStringify = (value: Record<string, unknown>): string => {
  return JSON.stringify(value, Object.keys(value).sort());
};

const hashQuery = (query: DashboardQuery): string => {
  const normalizedQuery = {
    from: query.from?.toISOString() ?? null,
    to: query.to?.toISOString() ?? null,
  };

  return crypto
    .createHash('sha256')
    .update(stableStringify(normalizedQuery))
    .digest('hex')
    .slice(0, 16);
};

export const dashboardCacheService = {
  adminKey(user: CurrentUser, query: DashboardQuery): string {
    return `cache:dashboard:admin:${user.id}:${hashQuery(query)}`;
  },

  agentKey(user: CurrentUser, query: DashboardQuery): string {
    return `cache:dashboard:agent:${user.id}:${hashQuery(query)}`;
  },

  async get<T>(key: string): Promise<T | null> {
    return redisCacheService.getJson<T>(key);
  },

  async set<T>(key: string, value: T): Promise<void> {
    await redisCacheService.setJson(key, value, env.CACHE_TTL_SECONDS);
  },

  async invalidateDashboards(): Promise<void> {
    await Promise.all([
      redisCacheService.deleteByPattern('cache:dashboard:admin:*'),
      redisCacheService.deleteByPattern('cache:dashboard:agent:*'),
    ]);
  },
};
