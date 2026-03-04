# Task Management System

Web app for managing tasks between authors and solvers. Built with React + Node.js + PostgreSQL.

Authors create tasks and assign them to solvers, then review the work when it's done. Solvers pick up tasks, work on them, and submit completion notes. Everything updates in real time through SSE.

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

## How to use it

### Login

Go to http://localhost:5173 and you'll see the login page. Type in your email and password and hit Sign In. You get redirected to either the author or solver dashboard depending on your account.

### If you're an author

Your dashboard has a task table showing everything you've created. Here's what you can do:

- Hit **+ New Task** to open the creation form on the side. Fill in the title, pick a solver from the dropdown, set priority and an optional deadline, then create it.
- Click any task row to see its details underneath. There's a progress bar showing where the task is in the lifecycle (Pending → In Progress → Completed → Approved).
- You can edit tasks or delete them from the detail view.
- When a solver finishes a task, you'll see Approve and Reject buttons. If you reject, you have to write a reason and the task goes back to "In Progress" so the solver can fix it.
- Use the dropdown filter to show only tasks with a specific status.

### If you're a solver

You see all tasks assigned to you in a table.

- Click a pending task and hit **Start Working** to begin.
- When you're done, click **Mark Complete** and write what you did in the note field.
- Tasks with deadlines show a countdown — green means plenty of time, orange means it's coming up, red means it's due very soon or already late.

### Notifications

There's a bell icon (🔔) in the top right. You get notified when:
- (solver) a task gets assigned to you, approved, or rejected
- (author) a solver completes a task

Click the bell to see your notifications. Unread ones show a red badge.

## Task states

```
PENDING → STARTED → COMPLETED → APPROVED
                ↑         |
                └─────────┘
                 (on reject)
```

Basically: author creates a task (Pending), solver starts it (Started), solver submits it (Completed), author reviews it. If the author approves it, it's done. If rejected, it goes back to Started and the solver tries again.

## Test accounts

Password for all: `seed1223`

Authors:
- prof.vondrak@university.edu
- manager.smith@company.com

Solvers:
- tai.huy@student.edu
- anna.novak@student.edu
- pavel.kovar@student.edu
- lucie.horova@student.edu

## Running the tests

There are Playwright e2e tests in `client/tests/e2e/`. You need both servers running first:

```bash
# start api
cd api && npm run dev

# start frontend (separate terminal)
cd client && npm run dev

# run tests (another terminal)
cd client
npm run test:e2e
```

Or if you want the Playwright UI: `npm run test:e2e:ui`

The tests cover login/logout flows, task creation, detail panel rendering, notification bell, status filtering, and responsive layout on different screen sizes.
