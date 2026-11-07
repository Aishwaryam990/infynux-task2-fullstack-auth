# Company Member Management & Employee Authentication

A full-stack web application developed as part of the Infynux Solutions internship. The application allows company administrators to manage employees, generate employee login credentials, and provide secure employee authentication.

## Project Overview

The system provides separate authentication and dashboard experiences for company administrators and employees.

Company administrators can register, log in, add employees, view employee records, and reset employee passwords. Employees can log in using their generated credentials and must change their temporary password during their first login.

## Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- NestJS
- Node.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt Password Hashing

## Features

### Company Administration
- Company registration and login.
- Company dashboard.
- Add new employees.
- Automatic employee Login ID generation.
- Secure temporary password generation.
- View employee list and account status.
- Reset employee passwords.

### Employee Authentication
- Employee login using Login ID and password.
- Secure password verification using bcrypt.
- Mandatory password change during first login.
- JWT-based authentication.
- Employee account status verification.

### Employee Dashboard
- Employee name and email.
- Unique employee Login ID.
- Company information.
- Account status.
- Account creation date.
- Home and Posts placeholder sections.

### Security
- Passwords stored as bcrypt hashes.
- JWT-based authentication.
- Protected company and employee routes.
- Company-specific employee data isolation.
- Employee authorization checks.
- Server-side first-login password change enforcement.

## Project Structure

```text
Task2/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── companies/
│       ├── employees/
│       ├── prisma/
│       └── main.ts
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── CompanyPortal.jsx
│       │   └── CompanyPortal.css
│       └── App.jsx
│
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Aishwaryam990/infynux-task2-fullstack-auth.git
```

```bash
cd infynux-task2-fullstack-auth
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure the backend `.env` file with your PostgreSQL database connection and JWT secret.

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/intern_auth?schema=public"
JWT_SECRET="your_secure_secret"
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

Start the backend:

```bash
npm run start:dev
```

Backend runs on:

`http://localhost:3000`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create or configure the frontend `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Open the Vite URL displayed in the terminal.

## API Endpoints

### Company APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/companies/auth/register` | Register company |
| POST | `/api/companies/auth/login` | Company login |
| GET | `/api/companies/dashboard` | Company dashboard |
| POST | `/api/companies/employees` | Create employee |
| GET | `/api/companies/employees` | List employees |
| POST | `/api/companies/employees/:loginId/reset-password` | Reset employee password |

### Employee APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/employees/auth/login` | Employee login |
| POST | `/api/employees/auth/change-password` | Change password |
| GET | `/api/employees/me` | Get employee profile |

Protected endpoints require the appropriate Bearer JWT token.

## Employee Account Workflow

1. Company administrator logs in.
2. Administrator opens Company Members.
3. Administrator enters employee name and email.
4. System generates a unique Login ID and temporary password.
5. Employee receives the generated credentials.
6. Employee logs in using those credentials.
7. System requires a password change during first login.
8. Employee accesses their dashboard after successfully changing the password.

Administrators can reset an employee's password when required. The newly generated temporary password is displayed once.

## Validation and Testing

The following checks were completed:

| Test | Result |
|---|---|
| Backend production build | Passed |
| Backend lint | Passed |
| Frontend production build | Passed |
| Employee account creation | Passed |
| Employee login | Passed |
| Temporary password change | Passed |
| Employee dashboard | Passed |
| Employee password reset | Passed |

### Build Commands

Backend:

```bash
npm run build
npm run lint
```

Frontend:

```bash
npm run build
```

## Git Information

**Repository:**  
https://github.com/Aishwaryam990/infynux-task2-fullstack-auth

**Development Branch:**  
`task6/company-member-authentication`

**Latest Commit:**  
`097a15f86dfcc3a5270232202fc4b3a8f72addd3`

## Future Enhancements

- Employee profile editing.
- Employee account activation and deactivation.
- Company announcements.
- Posts and internal communication.
- Employee notifications.
- Advanced role-based permissions.

## Conclusion

The project demonstrates a full-stack company employee management and authentication system using React, NestJS, PostgreSQL, and Prisma. It provides secure employee account creation, authentication, password management, and company-specific employee access.