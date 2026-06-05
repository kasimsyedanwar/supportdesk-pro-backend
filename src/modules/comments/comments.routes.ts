import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authorizeRoles } from '../../common/middlewares/authorize-roles.middleware';
import { validateRequest } from '../../common/middlewares/validate-request.middleware';
import { authenticate } from '../auth/auth.middleware';
import { ticketIdParamSchema } from '../tickets/ticket.schemas';
import { commentsController } from './comments.controller';
import { createCommentSchema } from './comments.schemas';

export const commentsRouter = Router();

commentsRouter.post(
  '/:ticketId/comments',
  authenticate,
  authorizeRoles(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  validateRequest({
    params: ticketIdParamSchema,
    body: createCommentSchema,
  }),
  commentsController.createComment,
);

commentsRouter.get(
  '/:ticketId/comments',
  authenticate,
  authorizeRoles(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  validateRequest({
    params: ticketIdParamSchema,
  }),
  commentsController.listComments,
);
