import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { env } from '../../config/env';
import { redisCacheService } from '../../common/cache/redis-cache.service';
import { TicketListQuery } from './ticket.schemas';

type CurrentUser = {
  id: string;
  role: UserRole;
};

const stableStringify = (value: unknown): string => {
  return JSON.stringify(
    value,
    Object.keys(value as Record<string, unknown>).sort(),
  );
};

const hashQuery = (query: TicketListQuery): string => {
  return crypto
    .createHash('sha256')
    .update(stableStringify(query))
    .digest('hex')
    .slice(0, 16);
};

export const ticketCacheService = {
  detailKey(ticketId: string, user: CurrentUser): string {
    return `cache:tickets:detail:${user.role}:${user.id}:${ticketId}`;
  },

  listKey(
    scope: 'customer' | 'agent' | 'admin',
    user: CurrentUser,
    query: TicketListQuery,
  ): string {
    return `cache:tickets:list:${scope}:${user.role}:${user.id}:${hashQuery(query)}`;
  },

  async get<T>(key: string): Promise<T | null> {
    return redisCacheService.getJson<T>(key);
  },

  async set<T>(key: string, value: T): Promise<void> {
    await redisCacheService.setJson(key, value, env.CACHE_TTL_SECONDS);
  },

  async invalidateTicket(ticketId: string): Promise<void> {
    await Promise.all([
      redisCacheService.deleteByPattern(`cache:tickets:detail:*:*:${ticketId}`),
      redisCacheService.deleteByPattern('cache:tickets:list:*'),
    ]);
  },

  async invalidateTicketLists(): Promise<void> {
    await redisCacheService.deleteByPattern('cache:tickets:list:*');
  },
};
