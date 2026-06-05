import {
  Prisma,
  TicketPriority,
  TicketStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { prisma } from '../../config/prisma';
import { DashboardQuery } from './dashboard.schemas';

const buildCreatedAtWhere = (
  query: DashboardQuery,
): Pick<Prisma.TicketWhereInput, 'createdAt'> => {
  const createdAt: Prisma.DateTimeFilter = {};

  if (query.from) {
    createdAt.gte = query.from;
  }

  if (query.to) {
    createdAt.lte = query.to;
  }

  if (Object.keys(createdAt).length === 0) {
    return {};
  }

  return {
    createdAt,
  };
};

const buildCommentCreatedAtWhere = (
  query: DashboardQuery,
): Pick<Prisma.CommentWhereInput, 'createdAt'> => {
  const createdAt: Prisma.DateTimeFilter = {};

  if (query.from) {
    createdAt.gte = query.from;
  }

  if (query.to) {
    createdAt.lte = query.to;
  }

  if (Object.keys(createdAt).length === 0) {
    return {};
  }

  return {
    createdAt,
  };
};

const buildAttachmentCreatedAtWhere = (
  query: DashboardQuery,
): Pick<Prisma.AttachmentWhereInput, 'createdAt'> => {
  const createdAt: Prisma.DateTimeFilter = {};

  if (query.from) {
    createdAt.gte = query.from;
  }

  if (query.to) {
    createdAt.lte = query.to;
  }

  if (Object.keys(createdAt).length === 0) {
    return {};
  }

  return {
    createdAt,
  };
};

const createTicketStatusCountMap = (): Record<TicketStatus, number> => {
  return Object.values(TicketStatus).reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<TicketStatus, number>,
  );
};

const createTicketPriorityCountMap = (): Record<TicketPriority, number> => {
  return Object.values(TicketPriority).reduce(
    (acc, priority) => {
      acc[priority] = 0;
      return acc;
    },
    {} as Record<TicketPriority, number>,
  );
};

const createUserRoleCountMap = (): Record<UserRole, number> => {
  return Object.values(UserRole).reduce(
    (acc, role) => {
      acc[role] = 0;
      return acc;
    },
    {} as Record<UserRole, number>,
  );
};

const toStatusCountMap = (
  rows: Array<{
    status: TicketStatus;
    _count: {
      _all: number;
    };
  }>,
): Record<TicketStatus, number> => {
  const counts = createTicketStatusCountMap();

  for (const row of rows) {
    counts[row.status] = row._count._all;
  }

  return counts;
};

const toPriorityCountMap = (
  rows: Array<{
    priority: TicketPriority;
    _count: {
      _all: number;
    };
  }>,
): Record<TicketPriority, number> => {
  const counts = createTicketPriorityCountMap();

  for (const row of rows) {
    counts[row.priority] = row._count._all;
  }

  return counts;
};

const toUserRoleCountMap = (
  rows: Array<{
    role: UserRole;
    _count: {
      _all: number;
    };
  }>,
): Record<UserRole, number> => {
  const counts = createUserRoleCountMap();

  for (const row of rows) {
    counts[row.role] = row._count._all;
  }

  return counts;
};

const calculateAverageResolutionTimeHours = (
  tickets: Array<{
    createdAt: Date;
    resolvedAt: Date | null;
  }>,
): number | null => {
  const resolvedTickets = tickets.filter((ticket) => ticket.resolvedAt);

  if (resolvedTickets.length === 0) {
    return null;
  }

  const totalMs = resolvedTickets.reduce((sum, ticket) => {
    return sum + (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime());
  }, 0);

  const averageMs = totalMs / resolvedTickets.length;
  const averageHours = averageMs / (1000 * 60 * 60);

  return Number(averageHours.toFixed(2));
};

const recentTicketSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  assignments: {
    where: {
      unassignedAt: null,
    },
    select: {
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.TicketSelect;

export const dashboardRepository = {
  async getAdminDashboard(query: DashboardQuery) {
    const ticketDateWhere = buildCreatedAtWhere(query);
    const commentDateWhere = buildCommentCreatedAtWhere(query);
    const attachmentDateWhere = buildAttachmentCreatedAtWhere(query);

    const [
      totalTickets,
      ticketStatusRows,
      ticketPriorityRows,
      assignedTickets,
      unassignedTickets,
      userRoleRows,
      totalUsers,
      activeAgents,
      unavailableAgents,
      commentsCount,
      attachmentsCount,
      resolvedTicketsForAverage,
      recentTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: ticketDateWhere,
      }),

      prisma.ticket.groupBy({
        by: ['status'],
        where: ticketDateWhere,
        _count: {
          _all: true,
        },
      }),

      prisma.ticket.groupBy({
        by: ['priority'],
        where: ticketDateWhere,
        _count: {
          _all: true,
        },
      }),

      prisma.ticket.count({
        where: {
          ...ticketDateWhere,
          assignments: {
            some: {
              unassignedAt: null,
            },
          },
        },
      }),

      prisma.ticket.count({
        where: {
          ...ticketDateWhere,
          assignments: {
            none: {
              unassignedAt: null,
            },
          },
        },
      }),

      prisma.user.groupBy({
        by: ['role'],
        _count: {
          _all: true,
        },
      }),

      prisma.user.count(),

      prisma.agentProfile.count({
        where: {
          isAvailable: true,
          user: {
            role: UserRole.AGENT,
            status: UserStatus.ACTIVE,
          },
        },
      }),

      prisma.agentProfile.count({
        where: {
          isAvailable: false,
          user: {
            role: UserRole.AGENT,
            status: UserStatus.ACTIVE,
          },
        },
      }),

      prisma.comment.count({
        where: commentDateWhere,
      }),

      prisma.attachment.count({
        where: attachmentDateWhere,
      }),

      prisma.ticket.findMany({
        where: {
          ...ticketDateWhere,
          resolvedAt: {
            not: null,
          },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      }),

      prisma.ticket.findMany({
        where: ticketDateWhere,
        select: recentTicketSelect,
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
    ]);

    return {
      tickets: {
        total: totalTickets,
        assigned: assignedTickets,
        unassigned: unassignedTickets,
        byStatus: toStatusCountMap(ticketStatusRows),
        byPriority: toPriorityCountMap(ticketPriorityRows),
        averageResolutionTimeHours: calculateAverageResolutionTimeHours(
          resolvedTicketsForAverage,
        ),
      },
      users: {
        total: totalUsers,
        byRole: toUserRoleCountMap(userRoleRows),
      },
      agents: {
        active: activeAgents,
        unavailable: unavailableAgents,
      },
      engagement: {
        comments: commentsCount,
        attachments: attachmentsCount,
      },
      recentTickets,
    };
  },

  async getAgentDashboard(userId: string, query: DashboardQuery) {
    const ticketDateWhere = buildCreatedAtWhere(query);
    const commentDateWhere = buildCommentCreatedAtWhere(query);
    const attachmentDateWhere = buildAttachmentCreatedAtWhere(query);

    const assignedTicketWhere: Prisma.TicketWhereInput = {
      ...ticketDateWhere,
      assignments: {
        some: {
          agentId: userId,
          unassignedAt: null,
        },
      },
    };

    const [
      assignedTickets,
      ticketStatusRows,
      ticketPriorityRows,
      resolvedTicketsForAverage,
      commentsCount,
      attachmentsCount,
      recentAssignedTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: assignedTicketWhere,
      }),

      prisma.ticket.groupBy({
        by: ['status'],
        where: assignedTicketWhere,
        _count: {
          _all: true,
        },
      }),

      prisma.ticket.groupBy({
        by: ['priority'],
        where: assignedTicketWhere,
        _count: {
          _all: true,
        },
      }),

      prisma.ticket.findMany({
        where: {
          ...assignedTicketWhere,
          resolvedAt: {
            not: null,
          },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      }),

      prisma.comment.count({
        where: {
          ...commentDateWhere,
          authorId: userId,
        },
      }),

      prisma.attachment.count({
        where: {
          ...attachmentDateWhere,
          uploadedById: userId,
        },
      }),

      prisma.ticket.findMany({
        where: assignedTicketWhere,
        select: recentTicketSelect,
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
      }),
    ]);

    return {
      assignedTickets: {
        total: assignedTickets,
        byStatus: toStatusCountMap(ticketStatusRows),
        byPriority: toPriorityCountMap(ticketPriorityRows),
        averageResolutionTimeHours: calculateAverageResolutionTimeHours(
          resolvedTicketsForAverage,
        ),
      },
      engagement: {
        commentsWritten: commentsCount,
        attachmentsUploaded: attachmentsCount,
      },
      recentAssignedTickets,
    };
  },
};
