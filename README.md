# Task Management System

A web application for managing tasks between authors and solvers.

The setup is simple: authors create tasks and assign them to solvers, then review the work when it is done. Solvers pick up tasks, work on them, and submit completion notes. Everything updates in real time through Server-Sent Events (SSE).

## Prerequisites
- Node.js 18+
- PostgreSQL 15+

## Setup

You will need two terminal windows, one for the backend and one for the frontend.

### Database

Make sure PostgreSQL is running, then create the database.

On Mac:
```bash
brew services start postgresql@15
createdb taskmanager
```

On Windows, open a terminal and run:
```bash
psql -U postgres
CREATE DATABASE taskmanager;
\q
```

### Backend (Terminal 1)

```bash
cd api
npm install
```

Create a file called `.env` inside the `api` folder:

```text
DATABASE_URL=postgres://postgres:YOUR_PG_PASSWORD@localhost:5432/taskmanager
JWT_SECRET=dev_secret_key
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Replace `YOUR_PG_PASSWORD` with your actual PostgreSQL password. If you set no password during install, use `postgres://postgres@localhost:5432/taskmanager`.

Then run:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

The server should print `Server running on port 3001`.

### Frontend (Terminal 2)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## How to use it

### Login

Go to http://localhost:5173 to see the login page. Sign in with your email and password. The system redirects you to either the author or solver dashboard depending on your account.

### Author workflow

Your dashboard has a task table showing everything you have created.

- Click **+ New Task** to open the creation form on the left. Fill in the title, pick a solver from the dropdown, set a priority and an optional deadline.
- Click any task row to view its details. A progress bar shows where the task is in the lifecycle (Pending $\rightarrow$ In Progress $\rightarrow$ Completed $\rightarrow$ Approved).
- You can edit tasks or delete them from the detail view.
- When a solver finishes a task, the detail view shows Approve and Reject buttons. Rejecting a task requires a reason, and the task goes back to "In Progress" so the solver can revise.
- Use the dropdown filter above the table to show only tasks with a specific status.

### Solver workflow

You see all tasks assigned to you in a table.

- Click a pending task and use the **Start Working** button to begin.
- When done, click **Mark Complete** and write what you did in the note field.
- Tasks with deadlines show a live countdown. Green text means plenty of time, orange means a deadline is approaching, and red means urgent or overdue.

### Notifications

A bell icon in the top right tracks notifications.

- Solvers get notified when a task gets assigned to them, approved, or rejected.
- Authors get notified when a solver completes a task.

Click the bell to open the dropdown list. Unread notifications show a red badge.

## Task states

```text
PENDING -> STARTED -> COMPLETED -> APPROVED
```

If the author rejects a COMPLETED task, it goes back to STARTED.

The flow works like this: an author creates a task (Pending), the assigned solver starts it (Started), the solver submits it (Completed), and the author reviews it. If approved, the task is done. If rejected, the solver has to try again.

## Test accounts

Password for all accounts is `seed1223`

Authors:
- prof.vondrak@university.edu
- manager.smith@company.com

Solvers:
- tai.huy@student.edu
- anna.novak@student.edu
- pavel.kovar@student.edu
- lucie.horova@student.edu

## Running the tests

The application has Playwright end-to-end tests in `client/tests/e2e/`. Start both servers first:

```bash
# start api
cd api && npm run dev

# start frontend (separate terminal)
cd client && npm run dev

# run tests (another terminal)
cd client
npm run test:e2e
```

To use the Playwright UI instead: `npm run test:e2e:ui`

The tests cover login flows, task creation, detail panel rendering, the notification bell, status filtering, and responsive layout across different screen sizes.
