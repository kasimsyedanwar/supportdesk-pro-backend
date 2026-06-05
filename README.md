# SupportDesk Pro Backend

SupportDesk Pro is a backend API for a customer support ticket management system. It supports customer, agent, and admin workflows such as ticket creation, ticket assignment, status updates, comments, attachments, dashboards, activity logs, caching, rate limiting, and notification event processing.

## Tech Stack

- TypeScript
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- MongoDB
- DynamoDB Local
- JWT Authentication
- OAuth2 Foundation
- Zod
- Jest
- Supertest
- Docker Compose
- GitHub Actions

## Main Features

- Customer, Agent, and Admin role-based access control
- JWT login with refresh token rotation
- Google OAuth2 login foundation
- Ticket creation, listing, filtering, and updating
- Admin ticket assignment to agents
- Agent ticket status lifecycle workflow
- Public comments and internal notes
- Ticket attachment upload support
- MongoDB activity logs for ticket history
- Redis caching and rate limiting
- Admin and agent dashboard APIs
- PostgreSQL outbox pattern
- DynamoDB Local notification event projection
- Unit and integration testing
- Lightweight GitHub Actions CI pipeline

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start local services

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, MongoDB, and DynamoDB Local.

### 3. Setup environment variables

Create a `.env` file from `.env.example`.

```bash
copy .env.example .env
```

For Mac/Linux:

```bash
cp .env.example .env
```

Generate two secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use one value for:

```env
ACCESS_TOKEN_SECRET=
```

Use another value for:

```env
OAUTH_STATE_SECRET=
```

For local development, real AWS keys are not required. DynamoDB uses local values:

```env
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
AWS_DYNAMODB_ENDPOINT=http://127.0.0.1:8000
AWS_DYNAMODB_NOTIFICATION_EVENTS_TABLE=supportdesk_notification_events
```

### 4. Run database setup

```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dynamodb:create-table
```

### 5. Start the backend

```bash
npm run dev
```

API base URL:

```txt
http://localhost:5000
```

Health check:

```txt
GET /health
```

Readiness check:

```txt
GET /ready
```

## Seeded Users

| Role     | Email                             | Password     |
| -------- | --------------------------------- | ------------ |
| Admin    | admin@supportdeskpro.dev          | Password@123 |
| Agent    | agent.tech@supportdeskpro.dev     | Password@123 |
| Agent    | agent.billing@supportdeskpro.dev  | Password@123 |
| Customer | kasim.customer@supportdeskpro.dev | Password@123 |
| Customer | demo.customer@supportdeskpro.dev  | Password@123 |

## Important API Routes

| Module        | Routes                                                           |
| ------------- | ---------------------------------------------------------------- |
| Auth          | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Users         | `/users/me`, `/admin/users`, `/agent/me`                         |
| Tickets       | `/tickets`, `/tickets/my`, `/tickets/:ticketId`                  |
| Admin Tickets | `/admin/tickets`, `/admin/tickets/:ticketId/assign`              |
| Agent Tickets | `/agent/tickets`, `/agent/tickets/:ticketId/status`              |
| Comments      | `/tickets/:ticketId/comments`                                    |
| Attachments   | `/tickets/:ticketId/attachments`                                 |
| Dashboards    | `/admin/dashboard`, `/agent/dashboard`                           |
| Worker        | `/workers/notifications/process-local`                           |
| Notifications | `/admin/notification-events`                                     |

## Testing

Run TypeScript check:

```bash
npm run typecheck
```

Run production build:

```bash
npm run build
```

Run unit tests:

```bash
npm run test:unit
```

Run integration tests:

```bash
npm run test:integration
```

Run all tests:

```bash
npm test
```

## CI Pipeline

This project uses GitHub Actions to run a lightweight CI pipeline on push.

The CI pipeline checks:

- Dependency installation
- Prisma Client generation
- TypeScript typecheck
- Production build
- Jest unit tests

## Project Status

SupportDesk Pro is a local backend portfolio project focused on backend architecture, API development, authentication, authorization, testing, caching, activity logging, and event processing.

Deployment is not included in the current version.
