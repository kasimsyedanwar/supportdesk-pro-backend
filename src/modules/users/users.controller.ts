import { AppError } from '../../common/errors/app-error';
import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { usersService } from './users.service';

export const usersController = {
  me: asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError(
        401,
        'Authentication required',
        'AUTHENTICATION_REQUIRED',
      );
    }

    const result = await usersService.getCurrentUser(req.user.id);

    return sendSuccess(res, 200, 'Current user fetched successfully', result);
  }),

  listUsers: asyncHandler(async (_req, res) => {
    const result = await usersService.listUsers();

    return sendSuccess(res, 200, 'Users fetched successfully', result);
  }),

  agentMe: asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError(
        401,
        'Authentication required',
        'AUTHENTICATION_REQUIRED',
      );
    }

    const result = await usersService.getCurrentAgentProfile(req.user.id);

    return sendSuccess(
      res,
      200,
      'Current agent profile fetched successfully',
      result,
    );
  }),
};
