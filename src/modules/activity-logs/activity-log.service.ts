import { UserRole } from '@prisma/client';
import { logger } from '../../config/logger';
import { ticketAccessService } from '../tickets/ticket-access.service';
import { ActivityLogDocument, ActivityLogType } from './activity-log.types';
import { activityLogRepository } from './activity-log.repository';

type CurrentUser = {
  id: string;
  role: UserRole;
};

type CreateActivityLogInput = {
  ticketId: string;
  actorId: string;
  actorRole: UserRole;
  type: ActivityLogType;
  message: string;
  metadata?: Record<string, unknown>;
};

export const activityLogService = {
  async createActivityLog(input: CreateActivityLogInput) {
    const activityLog: ActivityLogDocument = {
      ticketId: input.ticketId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      type: input.type,
      message: input.message,
      metadata: input.metadata ?? {},
      createdAt: new Date(),
    };

    return activityLogRepository.createActivityLog(activityLog);
  },

  async createActivityLogSafely(input: CreateActivityLogInput) {
    try {
      return await this.createActivityLog(input);
    } catch (error) {
      logger.error(
        {
          error,
          ticketId: input.ticketId,
          type: input.type,
        },
        'Failed to create MongoDB activity log',
      );

      return null;
    }
  },

  async listTicketActivity(ticketId: string, user: CurrentUser) {
    await ticketAccessService.ensureCanViewTicket(ticketId, user);

    const activity = await activityLogRepository.listTicketActivity({
      ticketId,
      viewerRole: user.role,
    });

    return {
      count: activity.length,
      activity,
    };
  },

  async ensureIndexes() {
    await activityLogRepository.createIndexes();
  },
};
