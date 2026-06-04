import { Router } from 'express';
import { validateRequest } from '../../common/middlewares/validate-request.middleware';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from './auth.schemas';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateRequest({ body: registerSchema }),
  authController.register,
);

authRouter.post(
  '/login',
  validateRequest({ body: loginSchema }),
  authController.login,
);

authRouter.get('/me', authenticate, authController.me);

authRouter.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  authController.refresh,
);

authRouter.post(
  '/logout',
  validateRequest({ body: logoutSchema }),
  authController.logout,
);
