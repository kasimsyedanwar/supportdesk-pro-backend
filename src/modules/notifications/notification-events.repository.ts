import { PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../../config/aws';
import { env } from '../../config/env';
import { NotificationEventRecord } from './notification-event.types';

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const notificationEventsRepository = {
  async putNotificationEvent(record: NotificationEventRecord): Promise<void> {
    await documentClient.send(
      new PutCommand({
        TableName: env.AWS_DYNAMODB_NOTIFICATION_EVENTS_TABLE,
        Item: record,
      }),
    );
  },

  async getNotificationEventByOutboxId(
    outboxEventId: string,
  ): Promise<NotificationEventRecord | null> {
    const result = await documentClient.send(
      new GetCommand({
        TableName: env.AWS_DYNAMODB_NOTIFICATION_EVENTS_TABLE,
        Key: {
          pk: `OUTBOX_EVENT#${outboxEventId}`,
          sk: 'NOTIFICATION_EVENT',
        },
      }),
    );

    return (result.Item as NotificationEventRecord | undefined) ?? null;
  },

  async listNotificationEvents(
    limit: number,
  ): Promise<NotificationEventRecord[]> {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: env.AWS_DYNAMODB_NOTIFICATION_EVENTS_TABLE,
        Limit: limit,
      }),
    );

    return (result.Items as NotificationEventRecord[] | undefined) ?? [];
  },
};
