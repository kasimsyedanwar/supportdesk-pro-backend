import { TicketPriority, TicketStatus } from '@prisma/client';
import { z } from 'zod';

export const ticketIdParamSchema = z.object({
  ticketId: z.uuid(),
});

export const createTicketSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(5000),
  priority: z.enum(TicketPriority).default(TicketPriority.MEDIUM),
});

export const updateTicketSchema = z
  .object({
    title: z.string().trim().min(5).max(120).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    priority: z.enum(TicketPriority).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.priority !== undefined,
    {
      message: 'At least one field must be provided for update',
    },
  );

export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(TicketStatus).optional(),
  priority: z.enum(TicketPriority).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const assignTicketSchema = z.object({
  agentId: z.uuid(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(TicketStatus),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type TicketIdParams = z.infer<typeof ticketIdParamSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;
