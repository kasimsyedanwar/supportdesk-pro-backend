# SupportDesk Pro Backend

A professional TypeScript backend for a support ticket management system

## Overview

SupportDesk Pro is a backend API for managing customer support tickets.

The final system will support customer, agent, and admin workflows such as ticket creation, assignment, status lifecycle management, comments, attachments, dashboards, and notification processing.

The project is being built stage by stage with a focus on clean architecture, TypeScript ownership, testing, and interview-ready explanations.

## Current Implementation Status

The project is currently in the initial backend setup stage.

Implemented so far:

- TypeScript project setup
- Express.js server setup
- Central route registration
- Health check endpoint
- Basic 404 route handling
- TypeScript type checking
- Production build script

## Tech Stack Currently Used

- TypeScript
- Node.js
- Express.js

## Planned Tech Stack

The following technologies will be added gradually as the project grows:

- PostgreSQL
- Prisma ORM
- Redis
- MongoDB
- JWT authentication
- OAuth2 foundation
- RBAC
- AWS S3
- AWS Lambda
- DynamoDB
- Docker
- GitHub Actions
- Jest
- Postman

## Current API Endpoints

### Health Check

```txt
GET /health
```

## Phase 1: TypeScript Express Setup

Implemented the initial TypeScript Express backend foundation.

### Added

- TypeScript configuration
- Express app setup
- Separate `app.ts` and `server.ts`
- Central route registry
- Health module
- `GET /health` endpoint
- Development, build, start, and typecheck scripts

### Commands

```bash
npm run dev
npm run typecheck
npm run build
npm start
```

## Phase 2: Core Config, Logging, Errors, Request ID, and Error Handler

Implemented the core backend infrastructure for configuration, logging, request tracing, and error handling.

### Added

- Environment variable validation using Zod
- `.env.example`
- Pino structured logger
- Request ID middleware
- Request logging middleware
- Central `AppError` class
- Central success response helper
- 404 not found middleware
- Global error handler

### Standard Success Response

```json
{
  "success": true,
  "message": "SupportDesk Pro API is healthy",
  "data": {},
  "requestId": "request-id"
}
```

## Phase 3: Local Infra with Docker Compose

Implemented local infrastructure using Docker Compose.

### Added

- PostgreSQL container
- Redis container
- MongoDB container
- Docker Compose configuration
- PostgreSQL health check
- Redis health check
- MongoDB health check
- `GET /ready` readiness endpoint

### Infrastructure

```txt
PostgreSQL -> transactional source of truth
Redis      -> cache and rate limiting
MongoDB    -> flexible activity logs
```

## Phase 4: Prisma Schema and Migrations

Implemented the initial PostgreSQL schema using Prisma ORM.

### Added

- Prisma setup
- PostgreSQL datasource
- User role and status enums
- Ticket status and priority enums
- User model
- AgentProfile model
- RefreshToken model
- Ticket model
- TicketAssignment model
- Comment model
- Attachment model
- OutboxEvent model
- Initial database migration
- Shared Prisma client configuration

### Core Database Responsibility

PostgreSQL is the transactional source of truth for:

- Users
- Agent profiles
- Refresh tokens
- Tickets
- Assignments
- Comments
- Attachment metadata
- Outbox events

### Commands

```bash
npx prisma format
npx prisma migrate dev --name init_supportdesk_schema
npx prisma generate
npx prisma studio
npm run typecheck
npm run dev
```

## Phase 5: Seed Scripts

Implemented repeatable local database seed data.

### Added

- Seed script using Prisma
- Hashed passwords using bcrypt
- 1 admin user
- 2 agent users
- 2 customer users
- Agent profiles
- Sample tickets
- Sample ticket assignments
- Sample comments
- Sample outbox events

### Seed Users

| Role     | Email                             | Password     |
| -------- | --------------------------------- | ------------ |
| ADMIN    | admin@supportdeskpro.dev          | Password@123 |
| AGENT    | agent.tech@supportdeskpro.dev     | Password@123 |
| AGENT    | agent.billing@supportdeskpro.dev  | Password@123 |
| CUSTOMER | kasim.customer@supportdeskpro.dev | Password@123 |
| CUSTOMER | demo.customer@supportdeskpro.dev  | Password@123 |

### Commands

```bash
npm run db:seed
npx tsx src/scripts/check-prisma.ts
npm run prisma:studio
npm run typecheck
```

## Phase 6: JWT Auth and Refresh Tokens

Implemented authentication using JWT access tokens and hashed refresh tokens.

### Added

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`
- Request validation using Zod
- JWT access token generation and verification
- Opaque refresh token generation
- SHA-256 hashed refresh token storage
- Refresh token rotation
- Logout by refresh token revocation
- Authentication middleware
- Safe user response without password hash

### Auth Design

```txt
Access token  -> short-lived JWT
Refresh token -> random opaque token
Database      -> stores only refresh token hash
```

## Phase 7: OAuth2 Login Foundation

Implemented Google OAuth2 login foundation with account linking.

### Added

- `GET /auth/google`
- `GET /auth/google/callback`
- Google OAuth authorization URL generation
- OAuth state signing and verification
- Google authorization code exchange
- Google ID token verification
- OAuth account linking using `OAuthAccount`
- Local user creation for new Google users
- Existing user linking by verified email
- SupportDesk JWT access token and refresh token after Google login

### OAuth Design

```txt
Google login proves external identity.
SupportDesk Pro still issues its own accessToken and refreshToken.
```

## Phase 8: RBAC and Ownership Guards

Implemented reusable role-based access control and ticket ownership guard logic.

### Added

- Reusable `authorizeRoles` middleware
- `GET /users/me` for authenticated users
- `GET /admin/users` protected by ADMIN role
- `GET /agent/me` protected by AGENT role
- Ticket ownership guard service for future ticket APIs

### RBAC Rule

```txt
RBAC checks whether the logged-in user's role can access a route.
```

## Phase 9: Ticket CRUD

Implemented core ticket APIs with role-based access and ownership checks.

### Added

- `POST /tickets`
- `GET /tickets/my`
- `GET /tickets/:ticketId`
- `PATCH /tickets/:ticketId`
- `GET /admin/tickets`
- `GET /agent/tickets`
- Ticket request validation using Zod
- Customer ticket creation
- Customer own ticket listing
- Customer own OPEN ticket update
- Admin all-ticket listing
- Agent assigned-ticket listing
- Ticket detail access using ownership guard
- Ticket creation outbox event

### Ticket Access Rules

```txt
CUSTOMER -> create tickets, view own tickets, update own OPEN tickets
AGENT    -> view assigned tickets
ADMIN    -> view all tickets
```

## Phase 10: Assignment and Status Lifecycle

Implemented ticket assignment and agent status lifecycle workflows.

### Added

- `PATCH /admin/tickets/:ticketId/assign`
- `PATCH /agent/tickets/:ticketId/status`
- Admin ticket assignment
- Ticket reassignment with old assignment closed using `unassignedAt`
- Agent-only assigned ticket status updates
- Allowed status transition rules
- `TICKET_ASSIGNED` outbox event
- `STATUS_CHANGED` outbox event

### Assignment Rules

```txt
ADMIN can assign or reassign tickets.
Target assignee must be an ACTIVE AGENT.
Target agent must have AgentProfile.
Unavailable agents cannot be assigned.
CLOSED tickets cannot be assigned.
```

## Phase 11: Ticket Comments

Implemented role-aware ticket comments.

### Added

- `POST /tickets/:ticketId/comments`
- `GET /tickets/:ticketId/comments`
- Public customer comments
- Agent/admin internal notes
- Customer restriction from creating internal notes
- Customer restriction from viewing internal notes
- Assigned-agent comment access
- Admin all-ticket comment access
- `COMMENT_ADDED` outbox event

### Comment Rules

```txt
CUSTOMER -> can add PUBLIC comments on own tickets only
CUSTOMER -> cannot add or view INTERNAL notes
AGENT    -> can add PUBLIC or INTERNAL comments on assigned tickets
ADMIN    -> can add PUBLIC or INTERNAL comments on any ticket
```

## Phase 12: Attachments and S3 Prep

Implemented ticket attachment support with local upload and S3 presigned URL preparation.

### Added

- `POST /tickets/:ticketId/attachments`
- `GET /tickets/:ticketId/attachments`
- `POST /tickets/:ticketId/attachments/presigned-url`
- Local file upload using Multer
- File type and size validation
- Attachment metadata stored in PostgreSQL
- `ATTACHMENT_UPLOADED` outbox event
- S3 presigned URL generation foundation
- S3 configuration guard

### Attachment Rules

```txt
CUSTOMER -> can upload/list attachments on own tickets
AGENT    -> can upload/list attachments on assigned tickets
ADMIN    -> can upload/list attachments on any ticket
```
