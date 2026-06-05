import { UserRole } from '@prisma/client';
import { AppError } from '../../common/errors/app-error';
import { dashboardCacheService } from './dashboard-cache.service';
import { dashboardRepository } from './dashboard.repository';
import { DashboardQuery } from './dashboard.schemas';

type CurrentUser = {
  id: string;
  role: UserRole;
};

export const dashboardService = {
  async getAdminDashboard(user: CurrentUser, query: DashboardQuery) {
    if (user.role !== UserRole.ADMIN) {
      throw new AppError(
        403,
        'Only admins can access admin dashboard',
        'ADMIN_ROLE_REQUIRED',
      );
    }

    const cacheKey = dashboardCacheService.adminKey(user, query);

    const cached = await dashboardCacheService.get<{
      dashboard: unknown;
      filters: {
        from: string | null;
        to: string | null;
      };
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const dashboard = await dashboardRepository.getAdminDashboard(query);

    const response = {
      dashboard,
      filters: {
        from: query.from?.toISOString() ?? null,
        to: query.to?.toISOString() ?? null,
      },
    };

    await dashboardCacheService.set(cacheKey, response);

    return response;
  },

  async getAgentDashboard(user: CurrentUser, query: DashboardQuery) {
    if (user.role !== UserRole.AGENT) {
      throw new AppError(
        403,
        'Only agents can access agent dashboard',
        'AGENT_ROLE_REQUIRED',
      );
    }

    const cacheKey = dashboardCacheService.agentKey(user, query);

    const cached = await dashboardCacheService.get<{
      dashboard: unknown;
      filters: {
        from: string | null;
        to: string | null;
      };
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const dashboard = await dashboardRepository.getAgentDashboard(
      user.id,
      query,
    );

    const response = {
      dashboard,
      filters: {
        from: query.from?.toISOString() ?? null,
        to: query.to?.toISOString() ?? null,
      },
    };

    await dashboardCacheService.set(cacheKey, response);

    return response;
  },
};
