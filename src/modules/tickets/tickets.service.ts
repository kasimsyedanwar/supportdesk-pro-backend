import {
  OutboxEventType,
  TicketStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { AppError } from '../../common/errors/app-error';
import { prisma } from '../../config/prisma';
import {
  AssignTicketInput,
  CreateTicketInput,
  TicketListQuery,
  UpdateTicketInput,
  UpdateTicketStatusInput,
} from './ticket.schemas';
import { ticketAccessService } from './ticket-access.service';
import {
  getAllowedAgentTransitions,
  isAllowedAgentStatusTransition,
} from './ticket-lifecycle';
import { ticketsRepository } from './tickets.repository';

type CurrentUser = {
  id: string;
  role: UserRole;
};

const buildPagination = (query: TicketListQuery, total: number) => {
  return {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
};

export const ticketsService = {
  async createTicket(user: CurrentUser, input: CreateTicketInput) {
    if (user.role !== UserRole.CUSTOMER) {
      throw new AppError(
        403,
        'Only customers can create support tickets',
        'CUSTOMER_ROLE_REQUIRED',
      );
    }

    const ticket = await ticketsRepository.createTicketWithOutbox({
      customerId: user.id,
      input,
    });

    return {
      ticket,
    };
  },

  async listMyTickets(user: CurrentUser, query: TicketListQuery) {
    if (user.role !== UserRole.CUSTOMER) {
      throw new AppError(
        403,
        'Only customers can access my tickets',
        'CUSTOMER_ROLE_REQUIRED',
      );
    }

    const result = await ticketsRepository.listCustomerTickets(user.id, query);

    return {
      tickets: result.items,
      pagination: buildPagination(query, result.total),
    };
  },

  async listAgentTickets(user: CurrentUser, query: TicketListQuery) {
    if (user.role !== UserRole.AGENT) {
      throw new AppError(
        403,
        'Only agents can access assigned tickets',
        'AGENT_ROLE_REQUIRED',
      );
    }

    const result = await ticketsRepository.listAgentTickets(user.id, query);

    return {
      tickets: result.items,
      pagination: buildPagination(query, result.total),
    };
  },

  async listAdminTickets(user: CurrentUser, query: TicketListQuery) {
    if (user.role !== UserRole.ADMIN) {
      throw new AppError(
        403,
        'Only admins can access all tickets',
        'ADMIN_ROLE_REQUIRED',
      );
    }

    const result = await ticketsRepository.listAdminTickets(query);

    return {
      tickets: result.items,
      pagination: buildPagination(query, result.total),
    };
  },

  async getTicketById(ticketId: string, user: CurrentUser) {
    await ticketAccessService.ensureCanViewTicket(ticketId, user);

    const ticket = await ticketsRepository.findTicketById(ticketId);

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'TICKET_NOT_FOUND');
    }

    return {
      ticket,
    };
  },

  async updateOwnTicket(
    ticketId: string,
    user: CurrentUser,
    input: UpdateTicketInput,
  ) {
    await ticketAccessService.ensureCustomerCanUpdateTicket(ticketId, user);

    const ticket = await ticketsRepository.updateTicket(ticketId, input);

    return {
      ticket,
    };
  },
  async assignTicket(
    ticketId: string,
    user: CurrentUser,
    input: AssignTicketInput,
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new AppError(
        403,
        'Only admins can assign tickets',
        'ADMIN_ROLE_REQUIRED',
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const ticket = await ticketsRepository.findTicketById(ticketId, tx);

      if (!ticket) {
        throw new AppError(404, 'Ticket not found', 'TICKET_NOT_FOUND');
      }

      if (ticket.status === TicketStatus.CLOSED) {
        throw new AppError(
          409,
          'Closed tickets cannot be assigned',
          'CLOSED_TICKET_ASSIGNMENT_BLOCKED',
        );
      }

      const agent = await ticketsRepository.findAssignableAgent(
        input.agentId,
        tx,
      );

      if (!agent) {
        throw new AppError(404, 'Agent not found', 'AGENT_NOT_FOUND');
      }

      if (agent.role !== UserRole.AGENT) {
        throw new AppError(
          400,
          'Target user is not an agent',
          'TARGET_USER_NOT_AGENT',
        );
      }

      if (agent.status !== UserStatus.ACTIVE) {
        throw new AppError(
          409,
          'Agent account is not active',
          'AGENT_NOT_ACTIVE',
        );
      }

      if (!agent.agentProfile) {
        throw new AppError(
          409,
          'Agent profile is missing',
          'AGENT_PROFILE_MISSING',
        );
      }

      if (!agent.agentProfile.isAvailable) {
        throw new AppError(
          409,
          'Agent is currently unavailable',
          'AGENT_UNAVAILABLE',
        );
      }

      const activeAssignment = ticket.assignments[0];

      if (activeAssignment?.agent.id === input.agentId) {
        throw new AppError(
          409,
          'Ticket is already assigned to this agent',
          'TICKET_ALREADY_ASSIGNED_TO_AGENT',
        );
      }

      await ticketsRepository.unassignActiveTicketAssignments(ticketId, tx);

      const assignment = await ticketsRepository.createTicketAssignment(
        {
          ticketId,
          agentId: input.agentId,
          assignedBy: user.id,
        },
        tx,
      );

      await ticketsRepository.createTicketOutboxEvent(
        {
          ticketId,
          actorId: user.id,
          type: OutboxEventType.TICKET_ASSIGNED,
          payload: {
            ticketId,
            agentId: input.agentId,
            assignedBy: user.id,
            previousAgentId: activeAssignment?.agent.id ?? null,
          },
        },
        tx,
      );

      const updatedTicket = await ticketsRepository.findTicketById(
        ticketId,
        tx,
      );

      if (!updatedTicket) {
        throw new AppError(404, 'Ticket not found', 'TICKET_NOT_FOUND');
      }

      return {
        ticket: updatedTicket,
        assignment,
      };
    });

    return result;
  },

  async updateAssignedTicketStatus(
    ticketId: string,
    user: CurrentUser,
    input: UpdateTicketStatusInput,
  ) {
    if (user.role !== UserRole.AGENT) {
      throw new AppError(
        403,
        'Only agents can update assigned ticket status',
        'AGENT_ROLE_REQUIRED',
      );
    }

    const currentTicket = await ticketAccessService.ensureAgentCanUpdateStatus(
      ticketId,
      user,
    );

    if (currentTicket.status === input.status) {
      throw new AppError(
        409,
        'Ticket already has this status',
        'STATUS_ALREADY_APPLIED',
        {
          currentStatus: currentTicket.status,
        },
      );
    }

    if (!isAllowedAgentStatusTransition(currentTicket.status, input.status)) {
      throw new AppError(
        409,
        'Ticket status transition is not allowed',
        'INVALID_STATUS_TRANSITION',
        {
          currentStatus: currentTicket.status,
          requestedStatus: input.status,
          allowedTransitions: getAllowedAgentTransitions(currentTicket.status),
        },
      );
    }

    const ticket = await ticketsRepository.updateTicketStatusWithOutbox({
      ticketId,
      actorId: user.id,
      fromStatus: currentTicket.status,
      toStatus: input.status,
    });

    return {
      ticket,
    };
  },
};
