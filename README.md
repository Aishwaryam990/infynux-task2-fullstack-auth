# Full-Stack Authentication and User Profile Management

## Overview

This project is a React, NestJS, and PostgreSQL application developed during the Infynux Solutions internship. This improvement assignment focuses on code quality, input validation, authentication security, configuration management, automated testing, and production readiness.

## Technology Stack

* Frontend: React and Vite
* Backend: NestJS and TypeScript
* Database: PostgreSQL
* ORM: Prisma
* Password hashing: bcrypt
* Authentication: JSON Web Tokens (JWT)
* Validation: class-validator and class-transformer
* Automated testing: Jest
* Request rate limiting: @nestjs/throttler

## Features

* User registration and login
* Email normalization and validation
* Password hashing using bcrypt
* Duplicate-email detection
* JWT-based authentication
* Protected user profile retrieval and updates
* Profile updates restricted to the authenticated user
* Backend request validation
* Environment-based configuration
* Global API rate limiting
* Loading, success, and error messages
* Responsive React interface
* Automated unit tests for authentication and JWT guard behavior

## Security Improvements

* The application validates required environment configuration at startup.
* JWT signing uses the JWT_SECRET environment variable.
* JWT access tokens have a 15-minute expiration.
* Registration validates the name, email, and password.
* Passwords are hashed before being stored.
* The JWT guard verifies the token and checks that the user still exists in the database.
* Profile routes require authentication and use the authenticated user's identity.
* The global validation pipe should reject unexpected request properties.
* Global rate limiting is configured to allow up to 10 requests per 60-second window, subject to the application's throttler storage and deployment configuration.
* Environment files containing secrets must not be committed to Git.

## Project Structure

```text
Task2/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── jwt-auth.guard.spec.ts
│   │   ├── users/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

* Node.js and npm
* PostgreSQL
* Git

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Aishwaryam990/infynux-task2-fullstack-auth.git
cd infynux-task2-fullstack-auth
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a local `.env` file from the example.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure these variables in `backend/.env`:

* `DATABASE_URL`: PostgreSQL connection string.
* `JWT_SECRET`: A securely generated secret containing at least 32 characters.

Create the database specified by `DATABASE_URL` before running migrations.

### 3. Apply database migrations

From the backend directory:

```bash
npx prisma migrate deploy
npx prisma generate
```

For a new development database where a development migration needs to be created, use the Prisma development migration workflow instead.

### 4. Start the backend

From the backend directory:

```bash
npm run start:dev
```

The backend normally runs at `http://localhost:3000`.

### 5. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Set the API URL in `frontend/.env`:

```text
VITE_API_URL=http://localhost:3000
```

### 6. Start the frontend

From the frontend directory:

```bash
npm run dev
```

Open the local URL displayed by Vite, normally `http://localhost:5173`.

Keep both servers running while testing the application.

## API Endpoints

| Method | Endpoint         | Description                               |
| ------ | ---------------- | ----------------------------------------- |
| POST   | `/auth/register` | Register a user                           |
| POST   | `/auth/login`    | Authenticate a user                       |
| GET    | `/api/users/me`  | Retrieve the authenticated user's profile |
| PATCH  | `/api/users/me`  | Update the authenticated user's profile   |

Profile endpoints require a valid JWT access token.

## Automated Tests

The backend unit tests cover:

* Successful registration and password hashing
* Duplicate registration rejection
* Successful login
* Rejection of unknown email addresses
* Rejection of incorrect passwords
* Missing authentication headers
* Malformed authorization headers
* Invalid or expired JWTs
* Rejection when the token's user no longer exists
* Acceptance of a valid token for an existing user

Run the backend build and tests from the `backend` directory:

```bash
npm run build
npm test -- --runInBand
```

Run frontend checks from the `frontend` directory:

```bash
npm run build
npm run lint
```

Only report the checks as passing after executing them successfully.

## Limitations and Further Improvements

* Current unit tests use mocks for authentication dependencies; they do not replace end-to-end tests against a real PostgreSQL database.
* Rate limiting and authentication should be tested in the intended deployment environment.
* Production deployment should use HTTPS, secure secret management, appropriate CORS settings, and monitoring.
* Distributed deployments may require shared rate-limit storage.
* Dependency audit findings should be reviewed and resolved without applying potentially breaking upgrades blindly.
* Further tests should cover DTO validation, profile authorization, rate limiting, and database integration.

## Environment Security

Never commit `.env` files, database passwords, or JWT secrets. Use `.env.example` to document the required configuration without exposing real credentials.

## Author

Aishwarya M.

Developed as part of the Infynux Solutions internship.
