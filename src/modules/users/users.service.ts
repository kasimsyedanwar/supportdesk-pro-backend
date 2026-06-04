import { AppError } from '../../common/errors/app-error';
import { usersRepository } from './users.repository';

export const usersService = {
  async getCurrentUser(userId: string) {
    const user = await usersRepository.findSafeUserById(userId);

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return {
      user,
    };
  },

  async listUsers() {
    const users = await usersRepository.listSafeUsers();

    return {
      count: users.length,
      users,
    };
  },

  async getCurrentAgentProfile(userId: string) {
    const agentProfile = await usersRepository.findAgentProfileByUserId(userId);

    if (!agentProfile) {
      throw new AppError(
        404,
        'Agent profile not found',
        'AGENT_PROFILE_NOT_FOUND',
      );
    }

    return {
      agentProfile,
    };
  },
};
