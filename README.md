# Full-Stack Authentication, User Profile Management & Company Dashboard

## Overview

This project is a React, NestJS, and PostgreSQL application developed during the Infynux Solutions internship.

The application provides personal user registration, login, profile management, and a separate company registration and authentication system with a protected company dashboard.

The project focuses on secure authentication, input validation, database integration, access control, responsive user interfaces, and production readiness.

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

### 1. Personal User Authentication

* User registration and login.
* Email normalization and validation.
* Password hashing using bcrypt.
* Duplicate-email detection.
* JWT-based authentication.
* Protected user profile retrieval and updates.
* Profile updates restricted to the authenticated user.

### 2. User Profile Management

* Retrieve personal account information.
* Update profile information.
* Display account details from the database.
* Protected profile routes.

### 3. Company Registration and Authentication

* Company registration with:

  * Company name
  * Company email
  * Unique company username
  * Password
  * Confirm password
* Frontend and backend input validation.
* Password confirmation validation.
* Unique email and username checks.
* Duplicate company registration prevention.
* Secure password hashing using bcrypt.
* Company login using database credentials.
* JWT-based company authentication.
* Generic invalid-credentials error messages.

### 4. Company Dashboard

* Protected company dashboard.
* Company-specific workspace.
* Company information retrieved from PostgreSQL.
* Dashboard displays:

  * Company name
  * Company email
  * Company username
  * Account creation date
* Dashboard navigation:

  * Home
  * Members
  * Posts
  * Settings
* Initial Members and Posts placeholder sections.
* Company logout functionality.
* Session persistence across browser refreshes.

### 5. Security and Access Control

* Separate authentication for personal users and companies.
* JWT token type verification.
* Protected API routes.
* Company dashboard access restricted to the authenticated company.
* Personal and company authentication isolation.
* Environment-based configuration.
* Global API request rate limiting.

## Security Improvements

* The application validates required environment configuration at startup.
* JWT signing uses the `JWT_SECRET` environment variable.
* JWT access tokens have a 15-minute expiration.
* Passwords are hashed before being stored in PostgreSQL.
* Registration validates user and company information.
* Duplicate email and company username registrations are rejected.
* Authentication guards verify JWT tokens and check the corresponding database records.
* Personal-user tokens cannot access company-protected routes.
* Company tokens cannot access personal-user protected routes.
* Profile routes use the authenticated user's identity.
* Company dashboard routes use the authenticated company's identity.
* The global validation pipe rejects unexpected request properties.
* Global rate limiting is configured to allow up to 10 requests per 60-second window, subject to the application's throttler storage and deployment configuration.
* Environment files containing secrets must not be committed to Git.

## Project Structure

```text
Task2/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── auth.service.spec.ts
│   │   ├── companies/
│   │   │   ├── dto/
│   │   │   │   ├── company-login.dto.ts
│   │   │   │   └── company-register.dto.ts
│   │   │   ├── company-auth.controller.ts
│   │   │   ├── company-auth.guard.ts
│   │   │   ├── company-auth.module.ts
│   │   │   ├── company-auth.service.ts
│   │   │   ├── company.controller.ts
│   │   │   └── company.service.ts
│   │   ├── users/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CompanyPortal.jsx
│   │   │   └── CompanyPortal.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
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

### 1. Clone the Repository

```bash
git clone https://github.com/Aishwaryam990/infynux-task2-fullstack-auth.git
cd infynux-task2-fullstack-auth
```

### 2. Configure the Backend

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

Create the PostgreSQL database specified by `DATABASE_URL` before running migrations.

### 3. Apply Database Migrations

From the backend directory:

```bash
npx prisma migrate deploy
npx prisma generate
```

For a new development database where a development migration needs to be created, use the Prisma development migration workflow instead.

### 4. Start the Backend

From the backend directory:

```bash
npm run start:dev
```

The backend normally runs at:

```text
http://localhost:3000
```

### 5. Configure the Frontend

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

### 6. Start the Frontend

From the frontend directory:

```bash
npm run dev
```

Open the local URL displayed by Vite, normally:

```text
http://localhost:5173
```

Keep both servers running while testing the application.

## API Endpoints

### Personal User Authentication

| Method | Endpoint         | Description                               |
| ------ | ---------------- | ----------------------------------------- |
| POST   | `/auth/register` | Register a personal user                  |
| POST   | `/auth/login`    | Authenticate a personal user              |
| GET    | `/api/users/me`  | Retrieve the authenticated user's profile |
| PATCH  | `/api/users/me`  | Update the authenticated user's profile   |

### Company Authentication and Dashboard

| Method | Endpoint                       | Description                                    |
| ------ | ------------------------------ | ---------------------------------------------- |
| POST   | `/api/companies/auth/register` | Register a company                             |
| POST   | `/api/companies/auth/login`    | Authenticate a company                         |
| GET    | `/api/companies/dashboard`     | Retrieve the authenticated company's dashboard |

The company dashboard endpoint requires a valid company JWT access token.

Personal-user and company authentication use separate token types and protected routes.

## Testing

### Backend Checks

Run the following commands from the backend directory:

```bash
npm run lint
npm run build
npm test -- --runInBand
```

The backend unit tests cover authentication and JWT guard behavior.

### Frontend Production Build

Run from the frontend directory:

```bash
npm run build
```

### Company Authentication and Dashboard Verification

The following functional checks were performed:

* Company registration.
* Successful company login.
* Duplicate company registration rejection.
* Protected company dashboard access.
* Dashboard information retrieved from the database.
* Dashboard navigation.
* Session persistence after browser refresh.
* Company logout.
* Personal-user token rejected by the company dashboard API.
* Company token rejected by the personal profile API.

### Build and Code Quality Results

The following checks were successfully completed during development:

* Frontend production build.
* Backend production build.
* Backend lint with zero warnings and zero errors.

## Limitations and Further Improvements

* The Members and Posts sections currently provide initial placeholder interfaces.
* Employee accounts, photo uploads, feeds, likes, comments, and notifications are outside the current implementation scope.
* Current unit tests use mocks for authentication dependencies; they do not replace end-to-end tests against a real PostgreSQL database.
* Rate limiting and authentication should be tested in the intended deployment environment.
* Production deployment should use HTTPS, secure secret management, appropriate CORS settings, and monitoring.
* Distributed deployments may require shared rate-limit storage.
* Further tests should cover DTO validation, authorization, rate limiting, and database integration.

## Environment Security

Never commit `.env` files, database passwords, access tokens, or JWT secrets.

Use `.env.example` to document the required configuration without exposing real credentials.

## Author

Aishwarya M.

Developed as part of the Infynux Solutions internship.
