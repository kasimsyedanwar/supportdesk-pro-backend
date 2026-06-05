import { TicketStatus } from '@prisma/client';
import {
  getAllowedAgentTransitions,
  isAllowedAgentStatusTransition,
} from '../../modules/tickets/ticket-lifecycle';

describe('ticket lifecycle rules', () => {
  it('allows OPEN to IN_PROGRESS', () => {
    expect(
      isAllowedAgentStatusTransition(
        TicketStatus.OPEN,
        TicketStatus.IN_PROGRESS,
      ),
    ).toBe(true);
  });

  it('blocks OPEN to RESOLVED', () => {
    expect(
      isAllowedAgentStatusTransition(TicketStatus.OPEN, TicketStatus.RESOLVED),
    ).toBe(false);
  });

  it('allows IN_PROGRESS to WAITING_FOR_CUSTOMER', () => {
    expect(
      isAllowedAgentStatusTransition(
        TicketStatus.IN_PROGRESS,
        TicketStatus.WAITING_FOR_CUSTOMER,
      ),
    ).toBe(true);
  });

  it('allows IN_PROGRESS to RESOLVED', () => {
    expect(
      isAllowedAgentStatusTransition(
        TicketStatus.IN_PROGRESS,
        TicketStatus.RESOLVED,
      ),
    ).toBe(true);
  });

  it('blocks CLOSED to anything', () => {
    expect(
      isAllowedAgentStatusTransition(
        TicketStatus.CLOSED,
        TicketStatus.IN_PROGRESS,
      ),
    ).toBe(false);
  });

  it('returns allowed transitions for IN_PROGRESS', () => {
    expect(getAllowedAgentTransitions(TicketStatus.IN_PROGRESS)).toEqual([
      TicketStatus.WAITING_FOR_CUSTOMER,
      TicketStatus.RESOLVED,
    ]);
  });
});
