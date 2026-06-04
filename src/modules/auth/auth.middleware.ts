import { UserStatus } from '@prisma/client';
import { AppError } from '../../common/errors/app-error';
import { asyncHandler } from '../../common/utils/async-handler';
import { authRepository } from './auth.repository';
import { verifyAccessToken } from './auth.tokens';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authorizationHeader = req.header('authorization');

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new AppError(
      401,
      'Access token is required',
      'ACCESS_TOKEN_REQUIRED',
    );
  }

  const accessToken = authorizationHeader.replace('Bearer ', '').trim();

  if (!accessToken) {
    throw new AppError(
      401,
      'Access token is required',
      'ACCESS_TOKEN_REQUIRED',
    );
  }

  const payload = verifyAccessToken(accessToken);

  const user = await authRepository.findUserById(payload.sub);

  if (!user) {
    throw new AppError(401, 'Invalid access token user', 'INVALID_TOKEN_USER');
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(403, 'User account is not active', 'USER_NOT_ACTIVE');
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  next();
});
