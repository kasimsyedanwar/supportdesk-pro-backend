import request from 'supertest';
import { app } from '../../app';

export const loginAndGetAccessToken = async (data: {
  email: string;
  password: string;
}): Promise<string> => {
  const response = await request(app)
    .post('/auth/login')
    .send(data)
    .expect(200);

  return response.body.data.accessToken as string;
};

export const loginSeededUsers = async () => {
  const [adminToken, agentToken, customerToken] = await Promise.all([
    loginAndGetAccessToken({
      email: 'admin@supportdeskpro.dev',
      password: 'Password@123',
    }),
    loginAndGetAccessToken({
      email: 'agent.tech@supportdeskpro.dev',
      password: 'Password@123',
    }),
    loginAndGetAccessToken({
      email: 'kasim.customer@supportdeskpro.dev',
      password: 'Password@123',
    }),
  ]);

  return {
    adminToken,
    agentToken,
    customerToken,
  };
};
