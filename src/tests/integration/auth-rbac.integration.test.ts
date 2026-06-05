import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../config/prisma';
import { disconnectRedis } from '../../config/redis';
import { disconnectMongo } from '../../config/mongo';
import { loginSeededUsers } from './test-helpers';

describe('auth and RBAC integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
    await disconnectRedis();
    await disconnectMongo();
  });

  it('allows admin to access admin users route', async () => {
    const { adminToken } = await loginSeededUsers();

    const response = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.users.length).toBeGreaterThan(0);
  });

  it('blocks customer from admin users route', async () => {
    const { customerToken } = await loginSeededUsers();

    const response = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('FORBIDDEN_ROLE');
  });

  it('blocks unauthenticated request to protected route', async () => {
    const response = await request(app).get('/admin/users').expect(401);

    expect(response.body.success).toBe(false);
  });
});
