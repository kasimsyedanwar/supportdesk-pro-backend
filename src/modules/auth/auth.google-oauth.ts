import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';
import { AppError } from '../../common/errors/app-error';
import { createOAuthState } from './auth.oauth-state';

type GoogleProfile = {
  providerAccountId: string;
  email: string;
  name: string;
};

const getRequiredGoogleConfig = () => {
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new AppError(
      500,
      'Google OAuth is not configured',
      'GOOGLE_OAUTH_NOT_CONFIGURED',
    );
  }

  return {
    clientId: env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI,
  };
};

const createGoogleOAuthClient = (): OAuth2Client => {
  const { clientId, clientSecret, redirectUri } = getRequiredGoogleConfig();

  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

export const getGoogleAuthorizationUrl = (): string => {
  const client = createGoogleOAuthClient();

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'consent',
    state: createOAuthState(),
  });
};

export const getGoogleProfileFromCode = async (
  code: string,
): Promise<GoogleProfile> => {
  const { clientId } = getRequiredGoogleConfig();
  const client = createGoogleOAuthClient();

  const { tokens } = await client.getToken(code);

  if (!tokens.id_token) {
    throw new AppError(
      401,
      'Google ID token missing',
      'GOOGLE_ID_TOKEN_MISSING',
    );
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new AppError(
      401,
      'Google account email could not be verified',
      'GOOGLE_EMAIL_NOT_VERIFIED',
    );
  }

  return {
    providerAccountId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? payload.email,
  };
};
