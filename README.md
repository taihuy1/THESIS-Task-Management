# Task Management System

A web-based task management application built with React and Node.js. Authors create and assign tasks to solvers, track progress, and approve or reject completed work.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+

## Setup

You will need two terminal windows, one for the backend and one for the frontend.

### Database

Make sure PostgreSQL is running, then create the database.

On Mac:
```
brew services start postgresql@15
createdb taskmanager
```

On Windows, open a terminal and run:
```
psql -U postgres
CREATE DATABASE taskmanager;
\q
```

### Backend (Terminal 1)

```
cd api
npm install
```

Create a file called `.env` inside the `api` folder:

```
DATABASE_URL=postgres://postgres:YOUR_PG_PASSWORD@localhost:5432/taskmanager
JWT_SECRET=dev_secret_key
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Replace `YOUR_PG_PASSWORD` with your actual PostgreSQL password. If you set no password during install, use `postgres://postgres@localhost:5432/taskmanager` instead.

Then run:

```
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

The server should print `Server running on port 3001`.

### Frontend (Terminal 2)

```
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Test Accounts

Password for all accounts: `seed1223`

Authors:
- prof.vondrak@university.edu
- manager.smith@company.com

Solvers:
- tai.huy@student.edu
- anna.novak@student.edu
- pavel.kovar@student.edu
- lucie.horova@student.edu
