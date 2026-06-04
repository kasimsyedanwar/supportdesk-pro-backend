import { CommentVisibility, TicketStatus, UserRole } from '@prisma/client';
import { AppError } from '../../common/errors/app-error';
import { prisma } from '../../config/prisma';

type CurrentUser = {
  id: string;
  role: UserRole;
};

type TicketAccessRecord = {
  id: string;
  customerId: string;
  status: TicketStatus;
  assignments: {
    agentId: string;
  }[];
};

const getTicketAccessRecord = async (
  ticketId: string,
): Promise<TicketAccessRecord> => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      customerId: true,
      status: true,
      assignments: {
        where: {
          unassignedAt: null,
        },
        select: {
          agentId: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new AppError(404, 'Ticket not found', 'TICKET_NOT_FOUND');
  }

  return ticket;
};

const isAssignedAgent = (
  ticket: TicketAccessRecord,
  userId: string,
): boolean => {
  return ticket.assignments.some((assignment) => assignment.agentId === userId);
};

export const ticketAccessService = {
  async ensureCanViewTicket(ticketId: string, user: CurrentUser) {
    const ticket = await getTicketAccessRecord(ticketId);

    if (user.role === UserRole.ADMIN) {
      return ticket;
    }

    if (user.role === UserRole.CUSTOMER && ticket.customerId === user.id) {
      return ticket;
    }

    if (user.role === UserRole.AGENT && isAssignedAgent(ticket, user.id)) {
      return ticket;
    }

    throw new AppError(
      403,
      'You do not have access to this ticket',
      'TICKET_ACCESS_DENIED',
    );
  },

  async ensureCanAddComment(
    ticketId: string,
    user: CurrentUser,
    visibility: CommentVisibility,
  ) {
    const ticket = await this.ensureCanViewTicket(ticketId, user);

    if (
      user.role === UserRole.CUSTOMER &&
      visibility === CommentVisibility.INTERNAL
    ) {
      throw new AppError(
        403,
        'Customers cannot create internal notes',
        'INTERNAL_NOTE_FORBIDDEN',
      );
    }

    return ticket;
  },

  async ensureCanUploadAttachment(ticketId: string, user: CurrentUser) {
    return this.ensureCanViewTicket(ticketId, user);
  },

  async ensureCustomerCanUpdateTicket(ticketId: string, user: CurrentUser) {
    const ticket = await getTicketAccessRecord(ticketId);

    if (user.role !== UserRole.CUSTOMER || ticket.customerId !== user.id) {
      throw new AppError(
        403,
        'Only the ticket owner can update this ticket',
        'TICKET_OWNER_REQUIRED',
      );
    }

    if (ticket.status !== TicketStatus.OPEN) {
      throw new AppError(
        409,
        'Only OPEN tickets can be updated by the customer',
        'TICKET_UPDATE_NOT_ALLOWED',
        {
          currentStatus: ticket.status,
        },
      );
    }

    return ticket;
  },

  async ensureAgentCanUpdateStatus(ticketId: string, user: CurrentUser) {
    const ticket = await getTicketAccessRecord(ticketId);

    if (user.role !== UserRole.AGENT || !isAssignedAgent(ticket, user.id)) {
      throw new AppError(
        403,
        'Only the assigned agent can update ticket status',
        'ASSIGNED_AGENT_REQUIRED',
      );
    }

    if (ticket.status === TicketStatus.CLOSED) {
      throw new AppError(
        409,
        'Closed tickets cannot be updated by agents',
        'CLOSED_TICKET_UPDATE_BLOCKED',
      );
    }

    return ticket;
  },
};
