import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authorizeRoles } from '../../common/middlewares/authorize-roles.middleware';
import { uploadSingleAttachment } from '../../common/middlewares/upload.middleware';
import { validateRequest } from '../../common/middlewares/validate-request.middleware';
import { authenticate } from '../auth/auth.middleware';
import { ticketIdParamSchema } from '../tickets/ticket.schemas';
import { attachmentsController } from './attachments.controller';
import { createPresignedUrlSchema } from './attachments.schemas';

export const attachmentsRouter = Router();

attachmentsRouter.post(
  '/:ticketId/attachments',
  authenticate,
  authorizeRoles(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  validateRequest({ params: ticketIdParamSchema }),
  uploadSingleAttachment,
  attachmentsController.uploadLocalAttachment,
);

attachmentsRouter.get(
  '/:ticketId/attachments',
  authenticate,
  authorizeRoles(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  validateRequest({ params: ticketIdParamSchema }),
  attachmentsController.listAttachments,
);

attachmentsRouter.post(
  '/:ticketId/attachments/presigned-url',
  authenticate,
  authorizeRoles(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  validateRequest({
    params: ticketIdParamSchema,
    body: createPresignedUrlSchema,
  }),
  attachmentsController.createPresignedUrl,
);
