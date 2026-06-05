import { AppError } from '../../common/errors/app-error';
import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { TicketIdParams } from '../tickets/ticket.schemas';
import { activityLogService } from './activity-log.service';

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

export const activityLogController = {
  listTicketActivity: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await activityLogService.listTicketActivity(ticketId, user);

    return sendSuccess(
      res,
      200,
      'Ticket activity fetched successfully',
      result,
    );
  }),
};
