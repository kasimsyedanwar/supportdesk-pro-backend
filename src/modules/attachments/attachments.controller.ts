import { AppError } from '../../common/errors/app-error';
import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { TicketIdParams } from '../tickets/ticket.schemas';
import { CreatePresignedUrlInput } from './attachments.schemas';
import { attachmentsService } from './attachments.service';

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

export const attachmentsController = {
  uploadLocalAttachment: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await attachmentsService.uploadLocalAttachment(
      ticketId,
      user,
      req.file,
    );

    return sendSuccess(res, 201, 'Attachment uploaded successfully', result);
  }),

  listAttachments: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await attachmentsService.listAttachments(ticketId, user);

    return sendSuccess(res, 200, 'Attachments fetched successfully', result);
  }),

  createPresignedUrl: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await attachmentsService.createPresignedUrl(
      ticketId,
      user,
      req.body as CreatePresignedUrlInput,
    );

    return sendSuccess(
      res,
      200,
      'S3 presigned upload URL generated successfully',
      result,
    );
  }),
};
