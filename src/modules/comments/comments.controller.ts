import { AppError } from '../../common/errors/app-error';
import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { TicketIdParams } from '../tickets/ticket.schemas';
import { CreateCommentInput } from './comments.schemas';
import { commentsService } from './comments.service';

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

export const commentsController = {
  createComment: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await commentsService.createComment(
      ticketId,
      user,
      req.body as CreateCommentInput,
    );

    return sendSuccess(res, 201, 'Comment added successfully', result);
  }),

  listComments: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await commentsService.listComments(ticketId, user);

    return sendSuccess(res, 200, 'Comments fetched successfully', result);
  }),
};
