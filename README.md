# Full-Stack Registration, Login and User Profile Management System

A responsive full-stack web application developed as part of the Infynux Solutions internship. The application allows users to register, log in, and manage their profiles using a React frontend, NestJS backend, and PostgreSQL database.

## Project Overview

This project demonstrates the integration of frontend development, backend APIs, database operations, input validation, and JWT-based authentication.

Users can create an account using their name, email, and password, log in with their registered credentials, view their profile information, update their name, and log out.

## Technologies Used

### Frontend

* React
* Vite
* HTML
* CSS
* JavaScript

### Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* bcrypt for password hashing
* JWT for access-token generation and authentication

## Features

* User registration and login
* Responsive interface for desktop and mobile devices
* Required-field and email-format validation
* Password confirmation during registration
* Duplicate-email detection
* Password hashing using bcrypt
* JWT access-token generation after successful login
* JWT-protected user profile access
* Retrieve and update user profile information
* Backend validation for profile updates
* Logout functionality
* Loading, success, and error messages
* PostgreSQL database integration
* Password hashes excluded from API responses

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
│   │   │   └── jwt-auth.guard.ts
│   │   ├── users/
│   │   │   ├── dto/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

* Node.js and npm
* PostgreSQL
* Git (optional, for cloning the repository)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Aishwaryam990/infynux-task2-fullstack-auth.git
cd infynux-task2-fullstack-auth
```

### 2. Configure the Backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

Create a local `.env` file from the example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure these environment variables using your own values:

* `DATABASE_URL`: PostgreSQL connection string for your database.
* `JWT_SECRET`: A long, randomly generated secret used to sign access tokens.

Create the PostgreSQL database specified in your connection string before running the migrations.

**Important:** Keep your actual `.env` file private. Never upload database passwords or JWT secrets to GitHub.

### 3. Run Database Migrations

From the `backend` directory, run:

```bash
npx prisma migrate dev
```

This applies the existing Prisma migrations to your configured PostgreSQL database.

### 4. Start the Backend Server

From the `backend` directory, run:

```bash
npm run start:dev
```

The backend runs at:

`http://localhost:3000`

### 5. Start the Frontend

Open a second terminal in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL displayed by Vite. By default, it is:

`http://localhost:5173`

Keep both development servers running while using the application.

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint         | Description                                |
| ------ | ---------------- | ------------------------------------------ |
| POST   | `/auth/register` | Registers a new user                       |
| POST   | `/auth/login`    | Authenticates a registered user            |
| GET    | `/api/users/me`  | Retrieves the authenticated user's profile |
| PATCH  | `/api/users/me`  | Updates the authenticated user's profile   |

**Note:** The profile endpoints require a valid JWT access token.

### Registration

Example request body:

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "TestPass123!"
}
```

A successful registration creates a user record and returns the user's safe profile information.

### Login

Example request body:

```json
{
  "email": "testuser@example.com",
  "password": "TestPass123!"
}
```

A successful login returns an access token and the user's safe profile information.

The backend rejects invalid credentials and does not return the stored password hash.

### Retrieve User Profile

The `GET /api/users/me` endpoint retrieves the profile of the currently authenticated user.

The backend verifies the JWT access token and identifies the user from the token.

### Update User Profile

The `PATCH /api/users/me` endpoint allows the authenticated user to update their profile name.

The backend validates the submitted data before updating the user's record.

## Validation and Error Handling

The application handles:

* Missing required fields
* Invalid email addresses
* Password confirmation mismatches during registration
* Duplicate email addresses
* Incorrect login credentials
* Missing or invalid authentication tokens
* Invalid profile update data
* Loading and API error states

## Testing

The following scenarios were tested during development:

* Successful registration
* Duplicate registration rejection
* Invalid input rejection
* Successful login
* Incorrect password rejection
* Database storage of user records
* Password hashing and exclusion of password hashes from API responses
* Successful profile retrieval
* Successful profile name update
* Protected profile access using JWT authentication
* Logout functionality
* Successful backend production build
* Successful frontend production build

## Security Notes

* Passwords are hashed using bcrypt before being stored.
* JWT access tokens are generated after successful login.
* Profile endpoints require valid authentication.
* The authenticated user is identified using the verified JWT.
* Database credentials and JWT secrets must be configured locally.
* The actual `.env` file is excluded from version control.

## Author

**Aishwarya M.**

Developed as part of the Infynux Solutions internship.

## Repository

[View the GitHub Repository](https://github.com/Aishwaryam990/infynux-task2-fullstack-auth)
