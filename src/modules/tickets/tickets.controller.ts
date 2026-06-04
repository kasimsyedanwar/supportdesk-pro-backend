import { AppError } from '../../common/errors/app-error';
import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import {
  AssignTicketInput,
  CreateTicketInput,
  TicketIdParams,
  TicketListQuery,
  UpdateTicketInput,
  UpdateTicketStatusInput,
} from './ticket.schemas';
import { ticketsService } from './tickets.service';

const getAuthenticatedUser = (reqUser: Express.Request['user']) => {
  if (!reqUser) {
    throw new AppError(
      401,
      'Authentication required',
      'AUTHENTICATION_REQUIRED',
    );
  }

  return {
    id: reqUser.id,
    role: reqUser.role,
  };
};

export const ticketsController = {
  createTicket: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const result = await ticketsService.createTicket(
      user,
      req.body as CreateTicketInput,
    );

    return sendSuccess(res, 201, 'Ticket created successfully', result);
  }),

  listMyTickets: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const result = await ticketsService.listMyTickets(
      user,
      req.query as unknown as TicketListQuery,
    );

    return sendSuccess(res, 200, 'My tickets fetched successfully', result);
  }),

  listAgentTickets: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const result = await ticketsService.listAgentTickets(
      user,
      req.query as unknown as TicketListQuery,
    );

    return sendSuccess(
      res,
      200,
      'Assigned tickets fetched successfully',
      result,
    );
  }),

  listAdminTickets: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const result = await ticketsService.listAdminTickets(
      user,
      req.query as unknown as TicketListQuery,
    );

    return sendSuccess(res, 200, 'Tickets fetched successfully', result);
  }),

  getTicketById: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await ticketsService.getTicketById(ticketId, user);

    return sendSuccess(res, 200, 'Ticket fetched successfully', result);
  }),

  updateOwnTicket: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await ticketsService.updateOwnTicket(
      ticketId,
      user,
      req.body as UpdateTicketInput,
    );

    return sendSuccess(res, 200, 'Ticket updated successfully', result);
  }),
  assignTicket: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await ticketsService.assignTicket(
      ticketId,
      user,
      req.body as AssignTicketInput,
    );

    return sendSuccess(res, 200, 'Ticket assigned successfully', result);
  }),

  updateAssignedTicketStatus: asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req.user);
    const { ticketId } = req.params as TicketIdParams;

    const result = await ticketsService.updateAssignedTicketStatus(
      ticketId,
      user,
      req.body as UpdateTicketStatusInput,
    );

    return sendSuccess(res, 200, 'Ticket status updated successfully', result);
  }),
};
