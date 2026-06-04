import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {
  CommentVisibility,
  OutboxEventType,
  PrismaClient,
  TicketPriority,
  TicketStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Password@123';
const SALT_ROUNDS = 10;

const main = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed script must not run in production');
  }

  console.log('Starting database seed...');

  await cleanDatabase();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@supportdeskpro.dev',
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const technicalAgent = await prisma.user.create({
    data: {
      name: 'Technical Support Agent',
      email: 'agent.tech@supportdeskpro.dev',
      passwordHash,
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
      agentProfile: {
        create: {
          department: 'Technical Support',
          isAvailable: true,
        },
      },
    },
  });

  const billingAgent = await prisma.user.create({
    data: {
      name: 'Billing Support Agent',
      email: 'agent.billing@supportdeskpro.dev',
      passwordHash,
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
      agentProfile: {
        create: {
          department: 'Billing',
          isAvailable: true,
        },
      },
    },
  });

  const customerKasim = await prisma.user.create({
    data: {
      name: 'Kasim Syed Anwar',
      email: 'kasim.customer@supportdeskpro.dev',
      passwordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  const customerDemo = await prisma.user.create({
    data: {
      name: 'Demo Customer',
      email: 'demo.customer@supportdeskpro.dev',
      passwordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  const loginTicket = await prisma.ticket.create({
    data: {
      customerId: customerKasim.id,
      title: 'Unable to login to my account',
      description:
        'I am entering the correct password, but the system keeps showing an invalid credentials error.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
    },
  });

  const billingTicket = await prisma.ticket.create({
    data: {
      customerId: customerDemo.id,
      title: 'Invoice amount looks incorrect',
      description:
        'My latest invoice amount is higher than expected. Please check the billing details.',
      status: TicketStatus.WAITING_FOR_CUSTOMER,
      priority: TicketPriority.MEDIUM,
    },
  });

  const openTicket = await prisma.ticket.create({
    data: {
      customerId: customerKasim.id,
      title: 'Need help updating profile information',
      description:
        'I want to update my profile details but I cannot find the correct option.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
    },
  });

  await prisma.ticketAssignment.create({
    data: {
      ticketId: loginTicket.id,
      agentId: technicalAgent.id,
      assignedBy: admin.id,
    },
  });

  await prisma.ticketAssignment.create({
    data: {
      ticketId: billingTicket.id,
      agentId: billingAgent.id,
      assignedBy: admin.id,
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        ticketId: loginTicket.id,
        authorId: customerKasim.id,
        body: 'I tried resetting the password, but I am still unable to login.',
        visibility: CommentVisibility.PUBLIC,
      },
      {
        ticketId: loginTicket.id,
        authorId: technicalAgent.id,
        body: 'I am checking the authentication logs for your account.',
        visibility: CommentVisibility.PUBLIC,
      },
      {
        ticketId: loginTicket.id,
        authorId: technicalAgent.id,
        body: 'Internal note: possible account lock issue after repeated failed attempts.',
        visibility: CommentVisibility.INTERNAL,
      },
      {
        ticketId: billingTicket.id,
        authorId: billingAgent.id,
        body: 'Can you please confirm the billing period you are referring to?',
        visibility: CommentVisibility.PUBLIC,
      },
    ],
  });

  await prisma.outboxEvent.createMany({
    data: [
      {
        type: OutboxEventType.TICKET_CREATED,
        ticketId: loginTicket.id,
        actorId: customerKasim.id,
        payload: {
          ticketId: loginTicket.id,
          title: loginTicket.title,
          customerId: customerKasim.id,
        },
      },
      {
        type: OutboxEventType.TICKET_ASSIGNED,
        ticketId: loginTicket.id,
        actorId: admin.id,
        payload: {
          ticketId: loginTicket.id,
          assignedTo: technicalAgent.id,
          assignedBy: admin.id,
        },
      },
      {
        type: OutboxEventType.TICKET_CREATED,
        ticketId: billingTicket.id,
        actorId: customerDemo.id,
        payload: {
          ticketId: billingTicket.id,
          title: billingTicket.title,
          customerId: customerDemo.id,
        },
      },
      {
        type: OutboxEventType.TICKET_CREATED,
        ticketId: openTicket.id,
        actorId: customerKasim.id,
        payload: {
          ticketId: openTicket.id,
          title: openTicket.title,
          customerId: customerKasim.id,
        },
      },
    ],
  });

  console.log('Database seed completed successfully.');

  console.table([
    {
      role: 'ADMIN',
      email: admin.email,
      password: SEED_PASSWORD,
    },
    {
      role: 'AGENT',
      email: technicalAgent.email,
      password: SEED_PASSWORD,
    },
    {
      role: 'AGENT',
      email: billingAgent.email,
      password: SEED_PASSWORD,
    },
    {
      role: 'CUSTOMER',
      email: customerKasim.email,
      password: SEED_PASSWORD,
    },
    {
      role: 'CUSTOMER',
      email: customerDemo.email,
      password: SEED_PASSWORD,
    },
  ]);
};

const cleanDatabase = async (): Promise<void> => {
  await prisma.outboxEvent.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticketAssignment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.user.deleteMany();
};

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
