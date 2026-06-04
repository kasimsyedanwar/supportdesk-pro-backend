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
