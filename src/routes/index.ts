import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { commentsRouter } from '../modules/comments/comments.routes';
import { healthRouter } from '../modules/health/health.routes';
import {
  adminTicketsRouter,
  agentTicketsRouter,
  ticketsRouter,
} from '../modules/tickets/tickets.routes';
import {
  adminUsersRouter,
  agentUsersRouter,
  usersRouter,
} from '../modules/users/users.routes';
import { activityLogRouter } from '../modules/activity-logs/activity-log.routes';
import { attachmentsRouter } from '../modules/attachments/attachments.routes';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/auth', authRouter);

apiRouter.use('/users', usersRouter);
apiRouter.use('/admin/users', adminUsersRouter);
apiRouter.use('/agent', agentUsersRouter);

apiRouter.use('/tickets', ticketsRouter);
apiRouter.use('/tickets', commentsRouter);
apiRouter.use('/tickets', attachmentsRouter);
apiRouter.use('/tickets', activityLogRouter);
apiRouter.use('/admin/tickets', adminTicketsRouter);
apiRouter.use('/agent/tickets', agentTicketsRouter);
