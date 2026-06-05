import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authorizeRoles } from '../../common/middlewares/authorize-roles.middleware';
import { validateRequest } from '../../common/middlewares/validate-request.middleware';
import { authenticate } from '../auth/auth.middleware';
import { workersController } from './workers.controller';
import { processNotificationsSchema } from './workers.schemas';

export const workersRouter = Router();

workersRouter.post(
  '/notifications/process-local',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  validateRequest({
    body: processNotificationsSchema,
  }),
  workersController.processNotificationsLocal,
);
