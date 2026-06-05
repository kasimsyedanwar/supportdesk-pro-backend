import { OutboxEventType } from '@prisma/client';
import { buildNotificationMessage } from '../../modules/notifications/notification-message.builder';

describe('buildNotificationMessage', () => {
  it('builds message for ticket created', () => {
    expect(
      buildNotificationMessage({
        type: OutboxEventType.TICKET_CREATED,
        payload: {},
      }),
    ).toBe('A new support ticket was created.');
  });

  it('builds message for ticket assigned', () => {
    expect(
      buildNotificationMessage({
        type: OutboxEventType.TICKET_ASSIGNED,
        payload: {},
      }),
    ).toBe('A support ticket was assigned to an agent.');
  });

  it('builds message for status changed', () => {
    expect(
      buildNotificationMessage({
        type: OutboxEventType.STATUS_CHANGED,
        payload: {},
      }),
    ).toBe('A support ticket status was updated.');
  });

  it('builds message for comment added', () => {
    expect(
      buildNotificationMessage({
        type: OutboxEventType.COMMENT_ADDED,
        payload: {},
      }),
    ).toBe('A new comment was added to a support ticket.');
  });

  it('builds message for attachment uploaded', () => {
    expect(
      buildNotificationMessage({
        type: OutboxEventType.ATTACHMENT_UPLOADED,
        payload: {},
      }),
    ).toBe('A new attachment was uploaded to a support ticket.');
  });
});
