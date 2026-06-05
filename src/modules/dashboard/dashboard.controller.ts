import { AppError } from '../../common/errors/app-error';
import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { DashboardQuery } from './dashboard.schemas';
import { dashboardService } from './dashboard.service';

const getAuthenticatedUser = (reqUser: Express.Request['user']) => {
  if (!reqUser) {
    throw new AppError(
      401,
      'Authentication required',
      'AUTHENTICATION_REQUIRED',
    );
  }

  return {
    id: reqUser.id,
    role: reqUser.role,
  };
};

export const dashboardController = {
  adminDashboard: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);

    const result = await dashboardService.getAdminDashboard(
      user,
      req.query as unknown as DashboardQuery,
    );

    return sendSuccess(
      res,
      200,
      'Admin dashboard fetched successfully',
      result,
    );
  }),

  agentDashboard: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);

    const result = await dashboardService.getAgentDashboard(
      user,
      req.query as unknown as DashboardQuery,
    );

    return sendSuccess(
      res,
      200,
      'Agent dashboard fetched successfully',
      result,
    );
  }),
};
