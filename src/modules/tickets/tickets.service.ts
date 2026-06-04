import { UserRole } from '@prisma/client';
import { AppError } from '../../common/errors/app-error';
import {
  CreateTicketInput,
  TicketListQuery,
  UpdateTicketInput,
} from './ticket.schemas';
import { ticketAccessService } from './ticket-access.service';
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
};
