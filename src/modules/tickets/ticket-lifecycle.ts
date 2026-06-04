import { TicketStatus } from '@prisma/client';

const allowedAgentTransitions: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],

  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.WAITING_FOR_CUSTOMER,
    TicketStatus.RESOLVED,
  ],

  [TicketStatus.WAITING_FOR_CUSTOMER]: [TicketStatus.IN_PROGRESS],

  [TicketStatus.RESOLVED]: [],

  [TicketStatus.CLOSED]: [],
};

export const isAllowedAgentStatusTransition = (
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
): boolean => {
  return allowedAgentTransitions[currentStatus].includes(nextStatus);
};

export const getAllowedAgentTransitions = (
  currentStatus: TicketStatus,
): TicketStatus[] => {
  return allowedAgentTransitions[currentStatus];
};
