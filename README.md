# Company Member Management & Employee Authentication System

A full-stack company management and private social networking application developed as part of the **Infynux Solutions Full Stack Development Internship**.

The application allows companies to register, manage employees, provide secure employee authentication, and create a private social platform where employees can share posts, like posts, and interact through comments.

## Project Overview

The system provides separate dashboards and authentication for company administrators and employees.

Company administrators can register, log in, manage company members, generate employee login credentials, and manage company posts.

Employees can securely log in, manage their profiles, create posts, view their company's social feed, like and unlike posts, and interact with other employees through comments.

All employee and social feed operations are restricted to the employee's respective company.

## Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt Password Hashing

## Features

### 1. Company Administration
- Company registration and login.
- Dedicated company dashboard.
- Add and manage employees.
- Automatic employee Login ID generation.
- Secure temporary password generation.
- View employee records and account status.
- Reset employee passwords.
- View and manage company posts.

### 2. Employee Authentication
- Employee login using Login ID and password.
- Secure password verification using bcrypt.
- Mandatory password change during first login.
- JWT-based authentication.
- Protected employee routes.
- Company-specific employee access.

### 3. Employee Dashboard
- Display employee name and email.
- Unique employee Login ID.
- Company information.
- Account status.
- Account creation date.
- Private company social feed.

### 4. Company Social Feed
- Employees can create posts.
- View posts shared by employees of the same company.
- Edit their own posts.
- Delete their own posts.
- View post authors and timestamps.
- Pagination for displaying posts.
- Company-specific feed visibility.

### 5. Post Engagement System
- Employees can like and unlike posts.
- Prevent duplicate likes from the same employee.
- Display the total number of likes.
- View employees who liked a post.
- Add comments to posts.
- Edit their own comments.
- Delete their own comments.
- Display comment counts and employee information.
- Paginated comment retrieval.
- Restrict post engagement to employees belonging to the same company.

### 6. Security
- Passwords stored as bcrypt hashes.
- JWT-based authentication.
- Protected company and employee routes.
- Role-based authorization.
- Company-specific data isolation.
- Employees can modify only their own posts and comments.
- Server-side first-login password change enforcement.
- Database constraints to prevent duplicate post likes.

## Project Structure

```text
Task2/
|
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |
|   |-- src/
|       |-- auth/
|       |-- companies/
|       |-- employees/
|       |-- posts/
|       |   |-- dto/
|       |   |-- engagement/
|       |-- prisma/
|       |-- users/
|       |-- main.ts
|
|-- frontend/
|   |-- src/
|       |-- components/
|       |   |-- CompanyPortal.jsx
|       |   |-- CompanyPortal.css
|       |   |-- PostsSection.jsx
|       |   |-- PostsSection.css
|       |-- App.jsx
|
|-- README.md
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

Generate Prisma Client if required:

```bash
npx prisma generate
```

Start the backend:

```bash
npm run start:dev
```

Backend runs at:

`http://localhost:3000`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## API Endpoints

### Company APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/companies/auth/register` | Register company |
| POST | `/api/companies/auth/login` | Company login |
| GET | `/api/companies/dashboard` | Company dashboard |

### Employee APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/employees/auth/login` | Employee login |
| POST | `/api/employees/auth/change-password` | Change employee password |
| GET | `/api/employees/me` | Get employee profile |

### Social Feed APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | View company feed |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/my` | View own posts |
| GET | `/api/posts/:id` | View individual post |
| PATCH | `/api/posts/:id` | Edit own post |
| DELETE | `/api/posts/:id` | Delete own post |

### Post Engagement APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/posts/:postId/like` | Like a post |
| DELETE | `/api/posts/:postId/like` | Unlike a post |
| GET | `/api/posts/:postId/likes` | View employees who liked |
| POST | `/api/posts/:postId/comments` | Add a comment |
| GET | `/api/posts/:postId/comments` | View comments |
| PATCH | `/api/posts/:postId/comments/:commentId` | Edit own comment |
| DELETE | `/api/posts/:postId/comments/:commentId` | Delete own comment |

Protected endpoints require the appropriate Bearer JWT token.

## Employee Account Workflow

1. Company administrator registers and logs in.
2. Administrator opens the Members section.
3. Administrator enters employee name and email.
4. System generates a unique Login ID and temporary password.
5. Employee logs in using the generated credentials.
6. Employee changes the temporary password.
7. Employee accesses the dashboard.
8. Employee can create posts and interact with other employees in the same company's social feed.

## Post Engagement Workflow

1. Employee A creates a post.
2. Employee B views the post in the company feed.
3. Employee B likes the post.
4. The like count is updated.
5. Employee B can unlike the post.
6. Employees can add comments.
7. Employees can edit or delete their own comments.
8. The system prevents employees from interacting with posts belonging to other companies.

## Validation and Testing

The following development checks were completed:

| Test | Result |
|---|---|
| Backend production build | Passed |
| Backend lint | Passed |
| Frontend production build | Passed |
| Frontend lint | Passed |
| Existing backend Jest tests | 11 passed |
| Prisma database migrations | Up to date |
| Company registration and login | Tested |
| Employee creation and login | Tested |
| Employee password change | Tested |
| Social post creation | Tested |
| Post liking and unliking | Tested |
| Comment creation, editing and deletion | Tested |
| Cross-company post access restriction | Tested |

### Build and Test Commands

Backend:

```bash
npm run build
npm run lint
npm test
```

Frontend:

```bash
npm run lint
npm run build
```

## Git Information

**Repository:**
https://github.com/Aishwaryam990/infynux-task2-fullstack-auth

**Development Branch:**
`task8/post-engagement`

## Conclusion

The project provides a secure company employee management and private social networking platform.

It combines company administration, employee authentication, social feed management, and post engagement features using React, NestJS, Prisma, and PostgreSQL.

The application demonstrates full-stack development concepts, secure authentication, database relationships, API development, authorization, and company-level data isolation.