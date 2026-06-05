import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../config/prisma';
import { disconnectRedis } from '../../config/redis';
import { disconnectMongo } from '../../config/mongo';
import { loginSeededUsers } from './test-helpers';

describe('dashboard integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
    await disconnectRedis();
    await disconnectMongo();
  });

  it('allows admin to access admin dashboard', async () => {
    const { adminToken } = await loginSeededUsers();

    const response = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.dashboard.tickets).toBeDefined();
    expect(response.body.data.dashboard.users).toBeDefined();
  });

  it('allows agent to access agent dashboard', async () => {
    const { agentToken } = await loginSeededUsers();

    const response = await request(app)
      .get('/agent/dashboard')
      .set('Authorization', `Bearer ${agentToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.dashboard.assignedTickets).toBeDefined();
  });

  it('blocks customer from admin dashboard', async () => {
    const { customerToken } = await loginSeededUsers();

    const response = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN_ROLE');
  });
});
