import { OutboxEvent, OutboxEventStatus } from '@prisma/client';
import { logger } from '../../config/logger';
import { ticketsRepository } from '../tickets/tickets.repository';
import { buildNotificationMessage } from './notification-message.builder';
import {
  NotificationDeliveryStatus,
  NotificationEventRecord,
} from './notification-event.types';
import { notificationEventsRepository } from './notification-events.repository';

const normalizePayload = (payload: unknown): Record<string, unknown> => {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }

  return {};
};

const toNotificationRecord = (
  event: OutboxEvent,
  processedAt: Date,
): NotificationEventRecord => {
  const payload = normalizePayload(event.payload);

  return {
    pk: `OUTBOX_EVENT#${event.id}`,
    sk: 'NOTIFICATION_EVENT',
    outboxEventId: event.id,
    ticketId: event.ticketId,
    actorId: event.actorId,
    type: event.type,
    outboxStatus: OutboxEventStatus.PROCESSED,
    deliveryStatus: NotificationDeliveryStatus.SENT,
    message: buildNotificationMessage({
      type: event.type,
      payload,
    }),
    payload,
    attempts: event.retryCount,
    createdAt: event.createdAt.toISOString(),
    processedAt: processedAt.toISOString(),
  };
};

export const notificationProcessorService = {
  async processPendingEvents(limit = 10) {
    const pendingEvents =
      await ticketsRepository.listPendingOutboxEvents(limit);

    const results: Array<{
      outboxEventId: string;
      status: 'processed' | 'failed' | 'skipped';
      error?: string;
    }> = [];

    for (const event of pendingEvents) {
      try {
        const existingRecord =
          await notificationEventsRepository.getNotificationEventByOutboxId(
            event.id,
          );

        if (existingRecord) {
          await ticketsRepository.markOutboxEventProcessed(event.id);

          results.push({
            outboxEventId: event.id,
            status: 'skipped',
          });

          continue;
        }

        const processingEvent =
          await ticketsRepository.markOutboxEventProcessing(event.id);

        const processedAt = new Date();

        const notificationRecord = toNotificationRecord(
          processingEvent,
          processedAt,
        );

        await notificationEventsRepository.putNotificationEvent(
          notificationRecord,
        );

        await ticketsRepository.markOutboxEventProcessed(event.id);

        results.push({
          outboxEventId: event.id,
          status: 'processed',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown processor error';

        logger.error(
          {
            error,
            outboxEventId: event.id,
          },
          'Failed to process outbox event',
        );

        await ticketsRepository.markOutboxEventFailed(event.id, errorMessage);

        results.push({
          outboxEventId: event.id,
          status: 'failed',
          error: errorMessage,
        });
      }
    }

    return {
      requestedLimit: limit,
      found: pendingEvents.length,
      results,
    };
  },

  async listNotificationEvents(limit = 50) {
    const events =
      await notificationEventsRepository.listNotificationEvents(limit);

    return {
      count: events.length,
      events,
    };
  },
};
