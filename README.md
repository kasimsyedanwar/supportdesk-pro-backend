# SupportDesk Pro Backend

A professional TypeScript backend for a support ticket management system, built to demonstrate production-style backend engineering skills for SDE-1 / junior backend developer roles.

## Overview

SupportDesk Pro is a backend API for managing customer support tickets. Customers can raise support tickets, agents can work on assigned tickets, and admins can manage users, assignments, ticket workflows, dashboards, and notification processing.

The project is designed as a controlled, explainable backend system that covers real-world concepts such as authentication, authorization, relational database design, caching, file uploads, asynchronous event processing, testing, Docker, and CI/CD.

## Project Goals

- Build a clean, modular TypeScript backend using Node.js and Express.js.
- Implement real support ticket workflows with customer, agent, and admin roles.
- Use PostgreSQL and Prisma ORM for core transactional data.
- Add JWT authentication, refresh tokens, OAuth2 foundation, and RBAC.
- Use Redis for caching and rate limiting.
- Use MongoDB for flexible ticket activity logs.
- Use AWS S3 for ticket attachments.
- Use AWS Lambda and DynamoDB for asynchronous notification event processing.
- Add automated tests using Jest.
- Containerize the application with Docker.
- Add GitHub Actions CI for type checking, linting, testing, building, and Docker validation.
- Keep the architecture professional but explainable for interviews.

## Tech Stack

### Backend

- TypeScript
- Node.js
- Express.js
- REST APIs
- Zod validation
- JWT authentication
- OAuth2 foundation
- Role-Based Access Control

### Databases and Storage

- PostgreSQL
- Prisma ORM
- Redis
- MongoDB
- AWS S3
- DynamoDB

### DevOps and Tooling

- Docker
- Docker Compose
- GitHub Actions
- Jest
- Postman
- Git

## Core Features

### Authentication and Authorization

- User registration and login
- JWT access tokens
- Refresh token rotation
- Logout support
- Google OAuth2 login foundation
- Role-based access control for CUSTOMER, AGENT, and ADMIN users
- Ownership checks for ticket access

### Ticket Management

- Customers can create support tickets
- Customers can view and update their own tickets
- Agents can view assigned tickets
- Admins can view and manage all tickets
- Admins can assign tickets to agents
- Agents can update ticket status based on allowed lifecycle rules

### Ticket Lifecycle

Supported ticket statuses:

- OPEN
- IN_PROGRESS
- WAITING_FOR_CUSTOMER
- RESOLVED
- CLOSED

### Comments

- Customers can add replies to their tickets
- Agents can add public replies
- Agents and admins can add internal notes
- Comments are role-aware

### Attachments

- Local upload support during development
- S3 presigned URL design for production-style uploads
- Attachment metadata stored in PostgreSQL

### Activity Logs

- Ticket actions are stored as activity events
- MongoDB is used for flexible event log storage
- Example events include ticket creation, assignment, status change, comment added, and attachment uploaded

### Caching and Rate Limiting

- Redis caching for ticket lists and dashboard metrics
- Cache invalidation on ticket updates
- Rate limiting for authentication and ticket creation endpoints

### Dashboards

- Admin dashboard metrics
- Agent dashboard metrics
- Ticket counts by status
- Assignment-based summaries

### Notification Event Processing

- Outbox event pattern for asynchronous processing
- Lambda-style notification processor
- DynamoDB event state tracking
- Local processor endpoint for development testing

## Planned API Modules

### Health

```txt
GET /health
GET /ready
```
