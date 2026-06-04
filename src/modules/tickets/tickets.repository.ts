import {
  OutboxEventType,
  Prisma,
  PrismaClient,
  TicketStatus,
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
};
