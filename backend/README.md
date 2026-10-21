
# Full-Stack Registration and Login System

## Overview

This project is developed for Infynux Solutions Internship Task 2.

## Technology Stack

* Frontend: React and Vite
* Backend: NestJS
* Database: PostgreSQL
* ORM: Prisma 6
* Password hashing: bcrypt
* Validation: class-validator

## Features

* User registration and login
* Full name, email, password, and confirm password fields
* Required-field and email validation
* Password confirmation
* Duplicate email prevention
* Secure password hashing
* Loading, success, and error messages
* Responsive user interface

## API Endpoints

* POST /auth/register - Register a new user
* POST /auth/login - Verify login credentials

## Database

Database name: intern_auth

Prisma migrations manage the database schema. Passwords are stored as bcrypt hashes.

## Setup

1. Install PostgreSQL and create the intern_auth database.
2. Configure DATABASE_URL in backend/.env using your local database credentials.
3. In the backend folder, run npm install.
4. Run npx prisma migrate deploy.
5. Run npx prisma generate.
6. Start the backend with npm run start:dev.
7. In the frontend folder, run npm install.
8. Start the frontend with npm run dev.
9. Open http://localhost:5173 in your browser.

## Security

* Database credentials must remain in .env.
* Never commit .env to Git.
* API responses must not expose password hashes.
* Prisma is the ORM used for this project.

## Authentication Status

Registration and password verification are implemented. JWT or server-side session authentication must still be implemented to fully satisfy the authentication requirements.

## Testing

Registration, successful login, duplicate email rejection, incorrect password rejection, and unregistered email rejection have been tested. Invalid registration data and password-hash response checks remain to be demonstrated.
