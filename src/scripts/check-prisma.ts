import { prisma } from '../config/prisma';

const main = async (): Promise<void> => {
  const [
    userCount,
    agentProfileCount,
    ticketCount,
    assignmentCount,
    commentCount,
    outboxEventCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.agentProfile.count(),
    prisma.ticket.count(),
    prisma.ticketAssignment.count(),
    prisma.comment.count(),
    prisma.outboxEvent.count(),
  ]);

  console.log({
    userCount,
    agentProfileCount,
    ticketCount,
    assignmentCount,
    commentCount,
    outboxEventCount,
  });
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
