import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authorizeRoles } from '../../common/middlewares/authorize-roles.middleware';
import { authenticate } from '../auth/auth.middleware';
import { usersController } from './users.controller';

export const usersRouter = Router();
export const adminUsersRouter = Router();
export const agentUsersRouter = Router();

usersRouter.get('/me', authenticate, usersController.me);

adminUsersRouter.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  usersController.listUsers,
);

agentUsersRouter.get(
  '/me',
  authenticate,
  authorizeRoles(UserRole.AGENT),
  usersController.agentMe,
);
