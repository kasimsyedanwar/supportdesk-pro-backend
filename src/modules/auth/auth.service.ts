import bcrypt from 'bcrypt';
import { OAuthProvider, User, UserStatus } from '@prisma/client';
import {
  getGoogleAuthorizationUrl,
  getGoogleProfileFromCode,
} from './auth.google-oauth';
import { verifyOAuthState } from './auth.oauth-state';
import { AppError } from '../../common/errors/app-error';
import { prisma } from '../../config/prisma';
import {
  generateRefreshToken,
  getRefreshTokenExpiryDate,
  hashRefreshToken,
  signAccessToken,
} from './auth.tokens';
import {
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
} from './auth.schemas';
import { authRepository } from './auth.repository';

const PASSWORD_SALT_ROUNDS = 10;

type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  status: User['status'];
  createdAt: Date;
};

type AuthResponse = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};

const toSafeUser = (user: User): SafeUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
};

const createTokenPairForUser = async (
  user: User,
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt: getRefreshTokenExpiryDate(),
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError(
        409,
        'Email is already registered',
        'EMAIL_ALREADY_EXISTS',
      );
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      PASSWORD_SALT_ROUNDS,
    );

    const user = await authRepository.createCustomer({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const tokens = await createTokenPairForUser(user);

    return {
      user: toSafeUser(user),
      ...tokens,
    };
  },
  getGoogleLoginUrl(): { url: string } {
    return {
      url: getGoogleAuthorizationUrl(),
    };
  },

  async loginWithGoogle(input: {
    code: string;
    state: string;
  }): Promise<AuthResponse> {
    verifyOAuthState(input.state);

    const googleProfile = await getGoogleProfileFromCode(input.code);

    const result = await prisma.$transaction(async (tx) => {
      const existingOAuthAccount = await authRepository.findOAuthAccount(
        {
          provider: OAuthProvider.GOOGLE,
          providerAccountId: googleProfile.providerAccountId,
        },
        tx,
      );

      if (existingOAuthAccount) {
        if (existingOAuthAccount.user.status !== UserStatus.ACTIVE) {
          throw new AppError(
            403,
            'User account is not active',
            'USER_NOT_ACTIVE',
          );
        }

        return existingOAuthAccount.user;
      }

      const existingUser = await authRepository.findUserByEmail(
        googleProfile.email,
        tx,
      );

      if (existingUser) {
        if (existingUser.status !== UserStatus.ACTIVE) {
          throw new AppError(
            403,
            'User account is not active',
            'USER_NOT_ACTIVE',
          );
        }

        await authRepository.createOAuthAccount(
          {
            userId: existingUser.id,
            provider: OAuthProvider.GOOGLE,
            providerAccountId: googleProfile.providerAccountId,
            email: googleProfile.email,
          },
          tx,
        );

        return existingUser;
      }

      const newUser = await authRepository.createGoogleCustomer(
        {
          name: googleProfile.name,
          email: googleProfile.email,
        },
        tx,
      );

      await authRepository.createOAuthAccount(
        {
          userId: newUser.id,
          provider: OAuthProvider.GOOGLE,
          providerAccountId: googleProfile.providerAccountId,
          email: googleProfile.email,
        },
        tx,
      );

      return newUser;
    });

    const tokens = await createTokenPairForUser(result);

    return {
      user: toSafeUser(result),
      ...tokens,
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user || !user.passwordHash) {
      throw new AppError(
        401,
        'Invalid email or password',
        'INVALID_CREDENTIALS',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(403, 'User account is not active', 'USER_NOT_ACTIVE');
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError(
        401,
        'Invalid email or password',
        'INVALID_CREDENTIALS',
      );
    }

    const tokens = await createTokenPairForUser(user);

    return {
      user: toSafeUser(user),
      ...tokens,
    };
  },

  async getMe(userId: string): Promise<{ user: SafeUser }> {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return {
      user: toSafeUser(user),
    };
  },

  async refresh(input: RefreshTokenInput): Promise<AuthResponse> {
    const incomingTokenHash = hashRefreshToken(input.refreshToken);

    const result = await prisma.$transaction(async (tx) => {
      const storedToken = await authRepository.findRefreshTokenByHash(
        incomingTokenHash,
        tx,
      );

      if (!storedToken) {
        throw new AppError(
          401,
          'Invalid refresh token',
          'INVALID_REFRESH_TOKEN',
        );
      }

      if (storedToken.revokedAt) {
        throw new AppError(
          401,
          'Refresh token has been revoked',
          'REFRESH_TOKEN_REVOKED',
        );
      }

      if (storedToken.expiresAt.getTime() < Date.now()) {
        throw new AppError(
          401,
          'Refresh token has expired',
          'REFRESH_TOKEN_EXPIRED',
        );
      }

      if (storedToken.user.status !== UserStatus.ACTIVE) {
        throw new AppError(
          403,
          'User account is not active',
          'USER_NOT_ACTIVE',
        );
      }

      await authRepository.revokeRefreshToken(storedToken.id, tx);

      const newRefreshToken = generateRefreshToken();
      const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

      await authRepository.createRefreshToken(
        {
          userId: storedToken.userId,
          tokenHash: newRefreshTokenHash,
          expiresAt: getRefreshTokenExpiryDate(),
        },
        tx,
      );

      const accessToken = signAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      });

      return {
        user: storedToken.user,
        accessToken,
        refreshToken: newRefreshToken,
      };
    });

    return {
      user: toSafeUser(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  },

  async logout(input: LogoutInput): Promise<{ loggedOut: true }> {
    const tokenHash = hashRefreshToken(input.refreshToken);

    const storedToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await authRepository.revokeRefreshToken(storedToken.id);
    }

    return {
      loggedOut: true,
    };
  },
};
