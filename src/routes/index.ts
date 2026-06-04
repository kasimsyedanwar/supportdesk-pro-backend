import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { healthRouter } from '../modules/health/health.routes';
import {
  adminUsersRouter,
  agentUsersRouter,
  usersRouter,
} from '../modules/users/users.routes';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/admin/users', adminUsersRouter);
apiRouter.use('/agent', agentUsersRouter);
