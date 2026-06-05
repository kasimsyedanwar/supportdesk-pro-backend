import { OutboxEventStatus, OutboxEventType } from '@prisma/client';

export const NotificationDeliveryStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

export type NotificationDeliveryStatus =
  (typeof NotificationDeliveryStatus)[keyof typeof NotificationDeliveryStatus];

export type NotificationEventRecord = {
  pk: string;
  sk: string;
  outboxEventId: string;
  ticketId: string | null;
  actorId: string | null;
  type: OutboxEventType;
  outboxStatus: OutboxEventStatus;
  deliveryStatus: NotificationDeliveryStatus;
  message: string;
  payload: Record<string, unknown>;
  attempts: number;
  createdAt: string;
  processedAt: string;
};
