import request from 'supertest';
import { UserRole } from '@prisma/client';
import { app } from '../../app';
import { prisma } from '../../config/prisma';
import { disconnectRedis } from '../../config/redis';
import { disconnectMongo } from '../../config/mongo';
import { loginSeededUsers } from './test-helpers';

describe('ticket workflow integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
    await disconnectRedis();
    await disconnectMongo();
  });

  it('customer creates ticket, admin assigns it, assigned agent updates status', async () => {
    const { adminToken, agentToken, customerToken } = await loginSeededUsers();

    const createResponse = await request(app)
      .post('/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        title: 'Integration test ticket',
        description: 'This ticket is created from Jest integration test.',
        priority: 'HIGH',
      })
      .expect(201);

    const ticketId = createResponse.body.data.ticket.id as string;

    expect(createResponse.body.data.ticket.status).toBe('OPEN');

    const agent = await prisma.user.findFirstOrThrow({
      where: {
        email: 'agent.tech@supportdeskpro.dev',
        role: UserRole.AGENT,
      },
    });

    const assignResponse = await request(app)
      .patch(`/admin/tickets/${ticketId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        agentId: agent.id,
      })
      .expect(200);

    expect(assignResponse.body.data.ticket.assignments[0].agent.id).toBe(
      agent.id,
    );

    const statusResponse = await request(app)
      .patch(`/agent/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        status: 'IN_PROGRESS',
      })
      .expect(200);

    expect(statusResponse.body.data.ticket.status).toBe('IN_PROGRESS');
  });

  it('blocks customer from creating internal comment', async () => {
    const { customerToken } = await loginSeededUsers();

    const createResponse = await request(app)
      .post('/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        title: 'Internal comment block test',
        description: 'This ticket is created for internal comment test.',
        priority: 'MEDIUM',
      })
      .expect(201);

    const ticketId = createResponse.body.data.ticket.id as string;

    const response = await request(app)
      .post(`/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        body: 'Customer should not be able to create internal note.',
        visibility: 'INTERNAL',
      })
      .expect(403);

    expect(response.body.error.code).toBe('INTERNAL_NOTE_FORBIDDEN');
  });
});
