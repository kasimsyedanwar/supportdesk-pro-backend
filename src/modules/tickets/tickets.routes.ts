import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authorizeRoles } from '../../common/middlewares/authorize-roles.middleware';
import { validateRequest } from '../../common/middlewares/validate-request.middleware';
import { authenticate } from '../auth/auth.middleware';
import {
  assignTicketSchema,
  createTicketSchema,
  ticketIdParamSchema,
  ticketListQuerySchema,
  updateTicketSchema,
  updateTicketStatusSchema,
} from './ticket.schemas';
import { ticketsController } from './tickets.controller';

export const ticketsRouter = Router();
export const adminTicketsRouter = Router();
export const agentTicketsRouter = Router();

ticketsRouter.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  validateRequest({ body: createTicketSchema }),
  ticketsController.createTicket,
);

ticketsRouter.get(
  '/my',
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  validateRequest({ query: ticketListQuerySchema }),
  ticketsController.listMyTickets,
);

ticketsRouter.get(
  '/:ticketId',
  authenticate,
  validateRequest({ params: ticketIdParamSchema }),
  ticketsController.getTicketById,
);

ticketsRouter.patch(
  '/:ticketId',
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  validateRequest({
    params: ticketIdParamSchema,
    body: updateTicketSchema,
  }),
  ticketsController.updateOwnTicket,
);

adminTicketsRouter.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  validateRequest({ query: ticketListQuerySchema }),
  ticketsController.listAdminTickets,
);

agentTicketsRouter.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.AGENT),
  validateRequest({ query: ticketListQuerySchema }),
  ticketsController.listAgentTickets,
);

adminTicketsRouter.patch(
  '/:ticketId/assign',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  validateRequest({
    params: ticketIdParamSchema,
    body: assignTicketSchema,
  }),
  ticketsController.assignTicket,
);

agentTicketsRouter.patch(
  '/:ticketId/status',
  authenticate,
  authorizeRoles(UserRole.AGENT),
  validateRequest({
    params: ticketIdParamSchema,
    body: updateTicketStatusSchema,
  }),
  ticketsController.updateAssignedTicketStatus,
);
