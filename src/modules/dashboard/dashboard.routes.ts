import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authorizeRoles } from '../../common/middlewares/authorize-roles.middleware';
import { validateRequest } from '../../common/middlewares/validate-request.middleware';
import { authenticate } from '../auth/auth.middleware';
import { dashboardController } from './dashboard.controller';
import { dashboardQuerySchema } from './dashboard.schemas';

export const adminDashboardRouter = Router();
export const agentDashboardRouter = Router();

adminDashboardRouter.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  validateRequest({
    query: dashboardQuerySchema,
  }),
  dashboardController.adminDashboard,
);

agentDashboardRouter.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.AGENT),
  validateRequest({
    query: dashboardQuerySchema,
  }),
  dashboardController.agentDashboard,
);
