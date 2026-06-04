import {
  OAuthProvider,
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { prisma } from '../../config/prisma';

type DbClient = PrismaClient | Prisma.TransactionClient;

const db = (client?: DbClient): DbClient => client ?? prisma;

export const authRepository = {
  findUserByEmail(email: string, client?: DbClient) {
    return db(client).user.findUnique({
      where: { email },
    });
  },

  findUserById(userId: string, client?: DbClient) {
    return db(client).user.findUnique({
      where: { id: userId },
    });
  },

  createCustomer(
    data: {
      name: string;
      email: string;
      passwordHash: string;
    },
    client?: DbClient,
  ) {
    return db(client).user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });
  },

  createRefreshToken(
    data: {
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    },
    client?: DbClient,
  ) {
    return db(client).refreshToken.create({
      data,
    });
  },

  findRefreshTokenByHash(tokenHash: string, client?: DbClient) {
    return db(client).refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });
  },

  revokeRefreshToken(refreshTokenId: string, client?: DbClient) {
    return db(client).refreshToken.update({
      where: { id: refreshTokenId },
      data: {
        revokedAt: new Date(),
      },
    });
  },
  findOAuthAccount(
    data: {
      provider: OAuthProvider;
      providerAccountId: string;
    },
    client?: DbClient,
  ) {
    return db(client).oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });
  },

  createOAuthAccount(
    data: {
      userId: string;
      provider: OAuthProvider;
      providerAccountId: string;
      email: string;
    },
    client?: DbClient,
  ) {
    return db(client).oAuthAccount.create({
      data,
    });
  },

  createGoogleCustomer(
    data: {
      name: string;
      email: string;
    },
    client?: DbClient,
  ) {
    return db(client).user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: null,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });
  },
};
