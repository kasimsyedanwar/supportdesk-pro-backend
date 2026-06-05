import { CommentVisibility, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ticketAccessService } from '../tickets/ticket-access.service';
import { CreateCommentInput } from './comments.schemas';
import { ticketCacheService } from '../tickets/ticket-cache.service';
import { dashboardCacheService } from '../dashboard/dashboard-cache.service';
import { activityLogService } from '../activity-logs/activity-log.service';
import { ActivityLogType } from '../activity-logs/activity-log.types';
import { commentsRepository } from './comments.repository';

type CurrentUser = {
  id: string;
  role: UserRole;
};

const canViewInternalComments = (user: CurrentUser): boolean => {
  return user.role === UserRole.ADMIN || user.role === UserRole.AGENT;
};

export const commentsService = {
  async createComment(
    ticketId: string,
    user: CurrentUser,
    input: CreateCommentInput,
  ) {
    await ticketAccessService.ensureCanAddComment(
      ticketId,
      user,
      input.visibility,
    );

    const result = await prisma.$transaction(async (tx) => {
      const comment = await commentsRepository.createComment(
        {
          ticketId,
          authorId: user.id,
          input,
        },
        tx,
      );

      await commentsRepository.createCommentOutboxEvent(
        {
          ticketId,
          actorId: user.id,
          commentId: comment.id,
          visibility: comment.visibility,
        },
        tx,
      );

      return comment;
    });

    await activityLogService.createActivityLogSafely({
      ticketId,
      actorId: user.id,
      actorRole: user.role,
      type: ActivityLogType.COMMENT_ADDED,
      message: 'Comment added',
      metadata: {
        commentId: result.id,
        visibility: result.visibility,
      },
    });

    await ticketCacheService.invalidateTicket(ticketId);
    await dashboardCacheService.invalidateDashboards();

    return {
      comment: result,
    };
  },

  async listComments(ticketId: string, user: CurrentUser) {
    await ticketAccessService.ensureCanViewTicket(ticketId, user);

    const comments = await commentsRepository.listComments({
      ticketId,
      includeInternal: canViewInternalComments(user),
    });

    return {
      count: comments.length,
      comments,
    };
  },
};
