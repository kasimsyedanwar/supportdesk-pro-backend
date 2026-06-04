import { AppError } from '../../common/errors/app-error';
import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import {
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
} from './auth.schemas';
import { authService } from './auth.service';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body as RegisterInput);

    return sendSuccess(res, 201, 'User registered successfully', result);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body as LoginInput);

    return sendSuccess(res, 200, 'User logged in successfully', result);
  }),

  me: asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError(
        401,
        'Authentication required',
        'AUTHENTICATION_REQUIRED',
      );
    }

    const result = await authService.getMe(req.user.id);

    return sendSuccess(res, 200, 'Current user fetched successfully', result);
  }),

  refresh: asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.body as RefreshTokenInput);

    return sendSuccess(res, 200, 'Token refreshed successfully', result);
  }),

  logout: asyncHandler(async (req, res) => {
    const result = await authService.logout(req.body as LogoutInput);

    return sendSuccess(res, 200, 'User logged out successfully', result);
  }),
};
