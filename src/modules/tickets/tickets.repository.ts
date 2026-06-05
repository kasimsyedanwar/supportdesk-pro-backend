import {
  OutboxEventStatus,
  OutboxEventType,
  Prisma,
  PrismaClient,
  TicketStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  CreateTicketInput,
  TicketListQuery,
  UpdateTicketInput,
} from './ticket.schemas';

type DbClient = PrismaClient | Prisma.TransactionClient;

const db = (client?: DbClient): DbClient => client ?? prisma;

const ticketInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  },
  assignments: {
    where: {
      unassignedAt: null,
    },
    select: {
      id: true,
      assignedAt: true,
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
      assignedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
} satisfies Prisma.TicketInclude;

const buildTicketWhere = (query: TicketListQuery): Prisma.TicketWhereInput => {
  const where: Prisma.TicketWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: query.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return where;
};

export const ticketsRepository = {
  createTicketWithOutbox(
    data: {
      customerId: string;
      input: CreateTicketInput;
    },
    client?: DbClient,
  ) {
    return db(client).ticket.create({
      data: {
        customerId: data.customerId,
        title: data.input.title,
        description: data.input.description,
        priority: data.input.priority,
        status: TicketStatus.OPEN,
        outboxEvents: {
          create: {
            type: OutboxEventType.TICKET_CREATED,
            actorId: data.customerId,
            payload: {
              title: data.input.title,
              priority: data.input.priority,
            },
          },
        },
      },
      include: ticketInclude,
    });
  },

  findTicketById(ticketId: string, client?: DbClient) {
    return db(client).ticket.findUnique({
      where: { id: ticketId },
      include: ticketInclude,
    });
  },

  updateTicket(ticketId: string, input: UpdateTicketInput, client?: DbClient) {
    return db(client).ticket.update({
      where: { id: ticketId },
      data: input,
      include: ticketInclude,
    });
  },
  listPendingOutboxEvents(limit: number, client?: DbClient) {
    return db(client).outboxEvent.findMany({
      where: {
        status: OutboxEventStatus.PENDING,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });
  },

  markOutboxEventProcessing(outboxEventId: string, client?: DbClient) {
    return db(client).outboxEvent.update({
      where: {
        id: outboxEventId,
      },
      data: {
        status: OutboxEventStatus.PROCESSING,
        retryCount: {
          increment: 1,
        },
      },
    });
  },

  markOutboxEventProcessed(outboxEventId: string, client?: DbClient) {
    return db(client).outboxEvent.update({
      where: {
        id: outboxEventId,
      },
      data: {
        status: OutboxEventStatus.PROCESSED,
        processedAt: new Date(),
        lastError: null,
      },
    });
  },

  markOutboxEventFailed(
    outboxEventId: string,
    errorMessage: string,
    client?: DbClient,
  ) {
    return db(client).outboxEvent.update({
      where: {
        id: outboxEventId,
      },
      data: {
        status: OutboxEventStatus.FAILED,
        lastError: errorMessage,
      },
    });
  },

  async listCustomerTickets(
    customerId: string,
    query: TicketListQuery,
    client?: DbClient,
  ) {
    const where: Prisma.TicketWhereInput = {
      ...buildTicketWhere(query),
      customerId,
    };

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      db(client).ticket.findMany({
        where,
        include: ticketInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: query.limit,
      }),
      db(client).ticket.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },

  async listAgentTickets(
    agentId: string,
    query: TicketListQuery,
    client?: DbClient,
  ) {
    const where: Prisma.TicketWhereInput = {
      ...buildTicketWhere(query),
      assignments: {
        some: {
          agentId,
          unassignedAt: null,
        },
      },
    };

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      db(client).ticket.findMany({
        where,
        include: ticketInclude,
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: query.limit,
      }),
      db(client).ticket.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },

  async listAdminTickets(query: TicketListQuery, client?: DbClient) {
    const where = buildTicketWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      db(client).ticket.findMany({
        where,
        include: ticketInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: query.limit,
      }),
      db(client).ticket.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },
  findAssignableAgent(agentId: string, client?: DbClient) {
    return db(client).user.findUnique({
      where: {
        id: agentId,
      },
      include: {
        agentProfile: true,
      },
    });
  },

  unassignActiveTicketAssignments(ticketId: string, client?: DbClient) {
    return db(client).ticketAssignment.updateMany({
      where: {
        ticketId,
        unassignedAt: null,
      },
      data: {
        unassignedAt: new Date(),
      },
    });
  },

  createTicketAssignment(
    data: {
      ticketId: string;
      agentId: string;
      assignedBy: string;
    },
    client?: DbClient,
  ) {
    return db(client).ticketAssignment.create({
      data,
    });
  },

  createTicketOutboxEvent(
    data: {
      ticketId: string;
      actorId: string;
      type: OutboxEventType;
      payload: Prisma.InputJsonValue;
    },
    client?: DbClient,
  ) {
    return db(client).outboxEvent.create({
      data: {
        ticketId: data.ticketId,
        actorId: data.actorId,
        type: data.type,
        payload: data.payload,
      },
    });
  },

  updateTicketStatusWithOutbox(
    data: {
      ticketId: string;
      actorId: string;
      fromStatus: TicketStatus;
      toStatus: TicketStatus;
    },
    client?: DbClient,
  ) {
    const resolvedAt =
      data.toStatus === TicketStatus.RESOLVED ? new Date() : undefined;

    return db(client).ticket.update({
      where: {
        id: data.ticketId,
      },
      data: {
        status: data.toStatus,
        resolvedAt,
        outboxEvents: {
          create: {
            type: OutboxEventType.STATUS_CHANGED,
            actorId: data.actorId,
            payload: {
              from: data.fromStatus,
              to: data.toStatus,
            },
          },
        },
      },
      include: ticketInclude,
    });
  },
};
