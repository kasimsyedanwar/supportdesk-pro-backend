import {
  AttachmentStorageProvider,
  OutboxEventType,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { prisma } from '../../config/prisma';

type DbClient = PrismaClient | Prisma.TransactionClient;

const db = (client?: DbClient): DbClient => client ?? prisma;

const attachmentInclude = {
  uploadedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  },
} satisfies Prisma.AttachmentInclude;

export const attachmentsRepository = {
  createAttachment(
    data: {
      ticketId: string;
      uploadedById: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      storageProvider: AttachmentStorageProvider;
      storageKey: string;
    },
    client?: DbClient,
  ) {
    return db(client).attachment.create({
      data,
      include: attachmentInclude,
    });
  },

  listTicketAttachments(ticketId: string, client?: DbClient) {
    return db(client).attachment.findMany({
      where: {
        ticketId,
      },
      include: attachmentInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  createAttachmentOutboxEvent(
    data: {
      ticketId: string;
      actorId: string;
      attachmentId: string;
      storageProvider: AttachmentStorageProvider;
    },
    client?: DbClient,
  ) {
    return db(client).outboxEvent.create({
      data: {
        ticketId: data.ticketId,
        actorId: data.actorId,
        type: OutboxEventType.ATTACHMENT_UPLOADED,
        payload: {
          attachmentId: data.attachmentId,
          storageProvider: data.storageProvider,
        },
      },
    });
  },
};
