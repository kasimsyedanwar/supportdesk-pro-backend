import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authorizeRoles } from '../../common/middlewares/authorize-roles.middleware';
import { authenticate } from '../auth/auth.middleware';
import { notificationEventsController } from './notification-events.controller';

export const notificationEventsRouter = Router();

notificationEventsRouter.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  notificationEventsController.listNotificationEvents,
);
