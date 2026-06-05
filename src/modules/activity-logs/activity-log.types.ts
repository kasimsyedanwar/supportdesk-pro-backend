import { UserRole } from '@prisma/client';

export const ActivityLogType = {
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_ASSIGNED: 'TICKET_ASSIGNED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  ATTACHMENT_UPLOADED: 'ATTACHMENT_UPLOADED',
} as const;

export type ActivityLogType =
  (typeof ActivityLogType)[keyof typeof ActivityLogType];

export type ActivityLogDocument = {
  ticketId: string;
  actorId: string;
  actorRole: UserRole;
  type: ActivityLogType;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
};
