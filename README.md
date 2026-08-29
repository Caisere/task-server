# Task Server API

A production-style REST API built with **Node.js**, **Express**, and **TypeScript**. It powers a support-task management system where users can create and manage their own tasks, admins can view and update task statuses across all users, and admins can manage promotional banners with Cloudinary image storage.

The API uses **cookie-based JWT authentication**, **Redis caching**, **Redis-backed rate limiting**, and **BullMQ background jobs** for async Cloudinary cleanup.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Authentication & CSRF](#authentication--csrf)
- [API Reference](#api-reference)
- [Caching Strategy](#caching-strategy)
- [Rate Limiting](#rate-limiting)
- [Background Jobs](#background-jobs)
- [Scripts](#scripts)
- [Error Handling](#error-handling)

---

## Features

- **User authentication** — email/password registration and login
- **Google OAuth** — sign in with Google; links to existing accounts by email
- **Role-based access** — `USER` and `ADMIN` roles with middleware guards
- **Support tasks** — users CRUD their own tasks; admins list, filter, and update task status
- **Admin banners** — upload, list, and delete banner images via Cloudinary
- **Redis caching** — cache-aside pattern for task lists, individual tasks, and banners
- **Rate limiting** — IP-based limits on auth routes; user-based limits on task routes
- **CSRF protection** — double-submit cookie pattern on mutating task/banner routes
- **Background workers** — BullMQ worker deletes Cloudinary assets when banners are removed

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express 5 |
| Database | PostgreSQL 16 |
| Cache / Queues | Redis 7 (ioredis + BullMQ) |
| Auth | JWT (httpOnly cookies) + Google OAuth |
| File storage | Cloudinary |
| Logging | Pino |

---

## Architecture

The codebase follows a layered structure:

```
HTTP Request
    ↓
Routes          →  Define endpoints, parse input, send responses
    ↓
Middleware      →  Auth, admin guard, CSRF, rate limits, file upload
    ↓
Services        →  Business logic, validation, cache orchestration
    ↓
Repositories    →  Raw SQL queries via pg pool
    ↓
PostgreSQL / Redis / Cloudinary
```

---

## Project Structure

```
task-server/
├── migrations/                  # SQL migration files (run in order)
├── src/
│   ├── app.ts                   # Express app setup (CORS, middleware, routes)
│   ├── server.ts                # Entry point, graceful shutdown
│   ├── config/
│   │   └── env.ts               # Environment variable validation
│   ├── constants/
│   │   └── auth.constant.ts     # Password length, bcrypt salt rounds
│   ├── db/
│   │   └── migrate.ts           # Migration runner
│   ├── lib/                     # Shared utilities
│   │   ├── appError.ts          # Custom HTTP error class
│   │   ├── bcrypt.ts            # Password hashing
│   │   ├── cache-helper.ts      # Redis cache key helpers & invalidation
│   │   ├── cloudinary.ts        # Image upload/delete
│   │   ├── cookie.ts            # Auth cookie management
│   │   ├── db.ts                # PostgreSQL connection pool
│   │   ├── google.ts            # Google OAuth helpers
│   │   ├── jwt.ts               # Token generation & verification
│   │   └── logger.ts            # Pino logger
│   ├── middleware/
│   │   ├── admin.middleware.ts  # requireAdmin guard
│   │   ├── auth.middleware.ts   # authenticate + requireCsrf
│   │   ├── banner.middleware.ts # Multer image upload
│   │   ├── error-handler.ts     # Global error handler
│   │   ├── not-found.ts         # 404 handler
│   │   └── rateLimit.middleware.ts
│   ├── queues/                  # BullMQ queue definitions
│   ├── redis/
│   │   └── redis.ts             # Redis client & setDataToRedis helper
│   ├── repositories/            # Database access layer
│   ├── routes/                  # Express routers
│   ├── services/                # Business logic
│   ├── workers/                 # BullMQ workers
│   └── types.ts                 # Shared TypeScript types
├── docker-compose.yml           # PostgreSQL + Redis containers
├── .env.example                 # Environment variable template
└── package.json
```

---

## Prerequisites

- **Node.js** 18+ (ES2022 target)
- **npm**
- **Docker** (recommended for PostgreSQL and Redis)
- **Cloudinary account** (for banner uploads)
- **Google Cloud OAuth credentials** (for Google login)

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd task-server
npm install
```

### 2. Start infrastructure

```bash
npm run docker:up
```

This starts:

| Service | Container | Host port |
|---------|-----------|-----------|
| PostgreSQL 16 | `task-server` | `5435` |
| Redis 7 | `task-server-cache` | `6379` |

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your secrets. See [Environment Variables](#environment-variables) for the full list.

> **Note:** `.env.example` uses `AUTH_RATE_LIMIT_MAX_REQUEST` but the app expects `AUTH_RATE_LIMIT_MAX_REQUESTS`. Also add `TASKS_RATE_LIMIT_MAX_REQUESTS` — both are required by `src/config/env.ts`.

### 4. Run migrations

```bash
npm run migrate
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:4000/api`.

### 6. Production build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `4000`) |
| `NODE_ENV` | No | `development` or `production` |
| `LOG_LEVEL` | No | Pino log level (e.g. `info`) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ACCESS_TOKEN_SECRET_KEY` | Yes | JWT access token secret |
| `ACCESS_TOKEN_EXPIRY_PERIOD` | Yes | Access token TTL (e.g. `15m`) |
| `REFRESH_TOKEN_SECRET_KEY` | Yes | JWT refresh token secret |
| `REFRESH_TOKEN_EXPIRY_PERIOD` | Yes | Refresh token TTL (e.g. `7d`) |
| `COOKIE_SECURE` | No | Set cookies `Secure` flag (`true`/`false`) |
| `COOKIE_SAME_SITE` | Yes | Cookie SameSite policy (`lax`, `strict`, `none`) |
| `REDIS_URL` | Yes | Redis connection URL |
| `GET_ALL_CACHED_TASK_EXPIRY` | Yes | Cache TTL in seconds |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Yes | Max auth requests per window (per IP) |
| `TASKS_RATE_LIMIT_MAX_REQUESTS` | Yes | Max task requests per window (per user) |
| `RATE_LIMIT_WINDOW_SECONDS` | Yes | Rate limit window for auth/tasks |
| `REFRESH_COOKIE_RATE_LIMIT_MAX_REQUESTS` | Yes | Max refresh requests per window |
| `REFRESH_COOKIE_RATE_LIMIT_WINDOW_SECONDS` | Yes | Refresh rate limit window |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_CLOUD_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_CLOUD_API_SECRET` | Yes | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Yes | Google OAuth redirect URI |

---

## Database Migrations

Migrations live in `migrations/` and run in alphabetical order. A `migrations` tracking table prevents re-running completed files.

| File | Description |
|------|-------------|
| `001_enable_pgcrypto.sql` | Enables `pgcrypto` for UUID generation |
| `002_create_users_table.sql` | Users table (`USER` / `ADMIN` roles, Google ID support) |
| `003_create_support_tasks_table.sql` | Support tasks table with status enum |
| `004_banners_table.sql` | Banners table for Cloudinary image references |

### Schema overview

**users**
- `id` (UUID), `email`, `password_hash`, `google_id`, `role`, timestamps

**support_tasks**
- `id`, `title`, `status` (`PENDING` | `IN_PROGRESS` | `RESOLVED`), `user_id` (FK), timestamps

**banners**
- `id`, `image_url`, `cloudinary_public_id`, timestamps

---

## Authentication & CSRF

### Cookie-based JWT

On login (email/password or Google), the server sets three cookies:

| Cookie | Purpose | httpOnly |
|--------|---------|----------|
| `access_cookie` | Short-lived JWT for API auth | Yes |
| `refresh_cookie` | Long-lived JWT for token refresh | Yes |
| `csrf_token` | CSRF double-submit token | No |

Protected routes read the access token from `access_cookie` via the `authenticate` middleware.

### Refresh flow

```
POST /api/auth/refresh
```

Uses the `refresh_cookie` to issue new access, refresh, and CSRF cookies. Rate-limited per refresh token.

### CSRF protection

Mutating requests to `/api/tasks`, `/api/admin/tasks`, and `/api/admin/banner` require:

1. `csrf_token` cookie (set at login)
2. Matching `x-csrf-token` request header

Safe methods (`GET`, `HEAD`, `OPTIONS`) bypass CSRF checks.

### Google OAuth flow

1. `GET /api/auth/google` — redirects to Google consent screen
2. Google redirects to `GET /api/auth/callback/google?code=...`
3. Server exchanges the code, creates or links the user, and sets auth cookies

### Frontend requirements

- Send requests with `credentials: 'include'` (CORS is configured with `credentials: true`)
- Include `x-csrf-token` header on `POST`, `PATCH`, `PUT`, `DELETE` requests

---

## API Reference

Base URL: `/api`

All responses follow a consistent shape:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { }
}
```

Errors return:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |

---

### Auth (`/auth`)

| Method | Path | Auth | Rate limit | Description |
|--------|------|------|------------|-------------|
| `POST` | `/register` | No | IP | Register with email and password |
| `POST` | `/login` | No | IP | Login; sets auth cookies |
| `POST` | `/refresh` | No | Refresh token | Refresh auth cookies |
| `GET` | `/me` | Yes | — | Get current user from JWT |
| `GET` | `/google` | No | — | Start Google OAuth flow |
| `GET` | `/callback/google` | No | — | Google OAuth callback |
| `POST` | `/logout` | No | — | Clear auth cookies |

**Register / Login body:**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Password must be at least 6 characters.

---

### User Tasks (`/tasks`)

All routes require authentication, CSRF (on mutations), and are rate-limited per user.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List current user's tasks |
| `GET` | `/:id` | Get a single task (ownership enforced) |
| `POST` | `/` | Create a task |
| `PATCH` | `/:id` | Update task title |
| `DELETE` | `/:id` | Delete a task |

**Create / Update body:**

```json
{
  "title": "My support request"
}
```

Title is trimmed and limited to 100 characters. Users can only access tasks where `user_id` matches their own ID.

---

### Admin Tasks (`/admin/tasks`)

Requires `ADMIN` role.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List all tasks (supports query filters) |
| `GET` | `/:taskId` | Get any task by ID |
| `PATCH` | `/:taskId/status` | Update task status |

**List query parameters:**

| Param | Description |
|-------|-------------|
| `search` | Filter by title (case-insensitive partial match) |
| `status` | Filter by status (`PENDING`, `IN_PROGRESS`, `RESOLVED`) |

**Update status body:**

```json
{
  "status": "IN_PROGRESS"
}
```

Valid statuses: `PENDING`, `IN_PROGRESS`, `RESOLVED`.

---

### Admin Banners (`/admin/banner`)

Requires `ADMIN` role. CSRF required on mutations.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List all banners |
| `GET` | `/:bannerId` | Get banner by ID |
| `POST` | `/` | Upload a banner image |
| `DELETE` | `/:bannerId` | Delete banner (DB + async Cloudinary cleanup) |

**Upload:** `multipart/form-data` with field name `image`. Max file size: 5 MB. Images only.

---

## Caching Strategy

The API uses a **cache-aside** pattern with Redis. TTL is controlled by `GET_ALL_CACHED_TASK_EXPIRY`.

### Cache keys

| Key pattern | Used for |
|-------------|----------|
| `admin:tasks:all` | Admin unfiltered task list |
| `admin:task:{taskId}` | Admin single task |
| `user:{userId}:tasks:lists` | User's task list |
| `task:user:{userId}:task:{taskId}` | User single task (ownership-scoped key) |
| `admin:banner:all` | Admin banner list |
| `admin:banner:{bannerId}` | Admin single banner |

### Invalidation rules

| Action | Invalidated keys |
|--------|------------------|
| User creates task | `admin:tasks:all`, `user:{userId}:tasks:lists` |
| User updates/deletes task | Admin list, user list, user task key, admin task key |
| Admin updates task status | Same as above (uses `task.user_id`) |
| Admin creates/deletes banner | `admin:banner:all` |

Filtered admin queries (`?search=` or `?status=`) bypass the cache and always hit the database.

---

## Rate Limiting

Rate limits are enforced via Redis counters. Response headers are included on limited routes:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`

| Limiter | Scope | Identifier |
|---------|-------|------------|
| Auth (`/auth/register`, `/auth/login`) | Per IP | Client IP |
| Tasks (user + admin task routes) | Per user | Authenticated user ID |
| Refresh (`/auth/refresh`) | Per session | Refresh token subject |

When the limit is exceeded, the API returns `429 Too Many Requests`. On Redis errors, rate limiters fail open (request proceeds).

---

## Background Jobs

Banner deletion uses **BullMQ** backed by Redis:

1. Admin deletes a banner via `DELETE /api/admin/banner/:bannerId`
2. The banner row is removed from PostgreSQL
3. A job is enqueued to delete the image from Cloudinary
4. The worker in `src/workers/deleteCloudinaryImage.worker.ts` processes the job with 3 retry attempts (exponential backoff)

The worker starts automatically when the server boots (`server.ts` imports it).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run migrate` | Run pending database migrations |
| `npm run docker:up` | Start PostgreSQL and Redis containers |
| `npm run docker:down` | Stop containers |

---

## Error Handling

Custom errors use the `AppError` class with an HTTP status code and message. The global `errorHandler` middleware catches all errors and returns:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Common status codes:

| Code | Meaning |
|------|---------|
| `400` | Validation error |
| `401` | Missing or invalid authentication |
| `403` | Forbidden (CSRF failure, non-admin access) |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate email) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Author

Built with 💚💚 by Omoshola

## License

ISC
