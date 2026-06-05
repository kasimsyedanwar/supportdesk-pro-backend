import {
  CommentVisibility,
  OutboxEventType,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { prisma } from '../../config/prisma';
import { CreateCommentInput } from './comments.schemas';

type DbClient = PrismaClient | Prisma.TransactionClient;

const db = (client?: DbClient): DbClient => client ?? prisma;

const commentInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  },
} satisfies Prisma.CommentInclude;

export const commentsRepository = {
  createComment(
    data: {
      ticketId: string;
      authorId: string;
      input: CreateCommentInput;
    },
    client?: DbClient,
  ) {
    return db(client).comment.create({
      data: {
        ticketId: data.ticketId,
        authorId: data.authorId,
        body: data.input.body,
        visibility: data.input.visibility,
      },
      include: commentInclude,
    });
  },

  createCommentOutboxEvent(
    data: {
      ticketId: string;
      actorId: string;
      commentId: string;
      visibility: CommentVisibility;
    },
    client?: DbClient,
  ) {
    return db(client).outboxEvent.create({
      data: {
        ticketId: data.ticketId,
        actorId: data.actorId,
        type: OutboxEventType.COMMENT_ADDED,
        payload: {
          commentId: data.commentId,
          visibility: data.visibility,
        },
      },
    });
  },

  listComments(
    data: {
      ticketId: string;
      includeInternal: boolean;
    },
    client?: DbClient,
  ) {
    return db(client).comment.findMany({
      where: {
        ticketId: data.ticketId,
        visibility: data.includeInternal ? undefined : CommentVisibility.PUBLIC,
      },
      include: commentInclude,
      orderBy: {
        createdAt: 'asc',
      },
    });
  },
};
