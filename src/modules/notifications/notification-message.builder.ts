import { OutboxEventType } from '@prisma/client';

export const buildNotificationMessage = (data: {
  type: OutboxEventType;
  payload: Record<string, unknown>;
}): string => {
  switch (data.type) {
    case OutboxEventType.TICKET_CREATED:
      return 'A new support ticket was created.';

    case OutboxEventType.TICKET_ASSIGNED:
      return 'A support ticket was assigned to an agent.';

    case OutboxEventType.STATUS_CHANGED:
      return 'A support ticket status was updated.';

    case OutboxEventType.COMMENT_ADDED:
      return 'A new comment was added to a support ticket.';

    case OutboxEventType.ATTACHMENT_UPLOADED:
      return 'A new attachment was uploaded to a support ticket.';

    default:
      return 'A support ticket event occurred.';
  }
};
