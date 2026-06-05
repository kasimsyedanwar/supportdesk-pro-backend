import { CommentVisibility, UserRole } from '@prisma/client';
import { getMongoDb } from '../../config/mongo';
import { ActivityLogDocument } from './activity-log.types';

const COLLECTION_NAME = 'activity_logs';

export const activityLogRepository = {
  async createActivityLog(data: ActivityLogDocument) {
    const db = getMongoDb();

    const result = await db
      .collection<ActivityLogDocument>(COLLECTION_NAME)
      .insertOne(data);

    return {
      id: result.insertedId.toString(),
      ...data,
    };
  },

  async listTicketActivity(data: { ticketId: string; viewerRole: UserRole }) {
    const db = getMongoDb();

    const filter: Record<string, unknown> = {
      ticketId: data.ticketId,
    };

    if (data.viewerRole === UserRole.CUSTOMER) {
      filter.$or = [
        {
          type: {
            $ne: 'COMMENT_ADDED',
          },
        },
        {
          type: 'COMMENT_ADDED',
          'metadata.visibility': CommentVisibility.PUBLIC,
        },
      ];
    }

    return db
      .collection<ActivityLogDocument>(COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray();
  },

  async createIndexes() {
    const db = getMongoDb();

    await db.collection<ActivityLogDocument>(COLLECTION_NAME).createIndexes([
      {
        key: {
          ticketId: 1,
          createdAt: 1,
        },
        name: 'ticket_activity_timeline_idx',
      },
      {
        key: {
          type: 1,
        },
        name: 'activity_type_idx',
      },
      {
        key: {
          actorId: 1,
        },
        name: 'activity_actor_idx',
      },
    ]);
  },
};
