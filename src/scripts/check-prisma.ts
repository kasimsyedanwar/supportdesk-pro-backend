import { prisma } from '../config/prisma';

const main = async (): Promise<void> => {
  const userCount = await prisma.user.count();
  const ticketCount = await prisma.ticket.count();

  console.log({
    userCount,
    ticketCount,
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
