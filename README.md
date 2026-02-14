# TasksGen — Mini Planning Tool

A web application that generates user stories, engineering tasks, and risk
assessments from a simple project spec form.

## Tech Stack

- **Frontend:** Vite + React + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle
- **Infrastructure:** Docker + Docker Compose
- **Package Manager:** pnpm

## Features

- Fill a spec form (goal, users, constraints, template type)
- Deterministic task generation (no AI/LLM)
- Edit tasks inline
- Drag & drop reorder
- Group tasks by category
- Export to Markdown or plain text
- View last 5 generated specs
- System status page (backend + database health)

## Prerequisites

- Docker & Docker Compose
- A Supabase account (free tier works)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yashng7/task-gen.git
cd task-gen
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

Get the connection string from:
**Supabase Dashboard → Settings → Database → Connection string → URI → Transaction mode**

### 3. Start the application

```bash
docker compose up --build
```

### 4. Run database migration (first time only)

```bash
docker exec tasks-generator-backend pnpm db:migrate
```

### 5. Open the app

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health check:** http://localhost:3001/health

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/status | Backend + DB status |
| POST | /api/specs | Create spec + generate tasks |
| GET | /api/specs | List recent specs (last 5) |
| GET | /api/specs/:id | Get spec with all tasks |
| PUT | /api/tasks/:id | Edit a task |
| PUT | /api/specs/:id/tasks/reorder | Reorder tasks |
| PUT | /api/specs/:id/tasks/group | Group tasks |
| GET | /api/specs/:id/export?format=markdown | Export as Markdown |
| GET | /api/specs/:id/export?format=text | Export as plain text |
