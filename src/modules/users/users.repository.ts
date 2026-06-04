import { prisma } from '../../config/prisma';

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const usersRepository = {
  findSafeUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });
  },

  listSafeUsers() {
    return prisma.user.findMany({
      select: safeUserSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  findAgentProfileByUserId(userId: string) {
    return prisma.agentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: safeUserSelect,
        },
      },
    });
  },
};
