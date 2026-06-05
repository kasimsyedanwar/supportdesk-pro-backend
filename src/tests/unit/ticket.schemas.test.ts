import { TicketPriority, TicketStatus } from '@prisma/client';
import {
  createTicketSchema,
  ticketListQuerySchema,
  updateTicketSchema,
} from '../../modules/tickets/ticket.schemas';

describe('ticket schemas', () => {
  it('validates create ticket input', () => {
    const result = createTicketSchema.parse({
      title: 'Cannot reset password',
      description: 'The password reset email is not arriving.',
      priority: TicketPriority.HIGH,
    });

    expect(result).toEqual({
      title: 'Cannot reset password',
      description: 'The password reset email is not arriving.',
      priority: TicketPriority.HIGH,
    });
  });

  it('defaults priority to MEDIUM', () => {
    const result = createTicketSchema.parse({
      title: 'Cannot reset password',
      description: 'The password reset email is not arriving.',
    });

    expect(result.priority).toBe(TicketPriority.MEDIUM);
  });

  it('rejects short title', () => {
    expect(() =>
      createTicketSchema.parse({
        title: 'Bad',
        description: 'This description is valid enough.',
      }),
    ).toThrow();
  });

  it('requires at least one field for update', () => {
    expect(() => updateTicketSchema.parse({})).toThrow();
  });

  it('coerces pagination query values', () => {
    const result = ticketListQuerySchema.parse({
      page: '2',
      limit: '10',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
    });

    expect(result).toEqual({
      page: 2,
      limit: 10,
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
    });
  });
});
