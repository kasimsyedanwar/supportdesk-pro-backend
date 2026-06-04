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
