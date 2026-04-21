# @notiving/api

REST API server built with **Hono** + **Drizzle ORM** + **PostgreSQL**.

## Stack

- **Runtime**: Node.js + [Hono](https://hono.dev) (served via `@hono/node-server`)
- **Database**: PostgreSQL 16 (local Docker) + [Drizzle ORM](https://orm.drizzle.team)
- **Validation**: [Zod](https://zod.dev) + `@hono/zod-validator`
- **Auth**: JWT (access + refresh tokens) with bcrypt password hashing
- **Linter**: [Biome](https://biomejs.dev)

## Getting Started

```bash
# Start PostgreSQL
docker compose up -d

# Copy env and adjust if needed
cp .env.example .env

# Push schema to database
pnpm db:push

# Start dev server (hot-reload)
pnpm dev
```

Server runs at `http://localhost:3001` by default.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot-reload (`tsx watch`) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled output (`node dist/index.js`) |
| `pnpm lint` | Lint with Biome |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:push` | Push schema directly to database |
| `pnpm db:studio` | Open Drizzle Studio GUI |

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `POST` | `/api/v1/auth/register` | — | Register |
| `POST` | `/api/v1/auth/login` | — | Login |
| `POST` | `/api/v1/auth/refresh` | — | Refresh tokens |
| `GET` | `/api/v1/auth/me` | ✓ | Current user |
| `GET` | `/api/v1/users` | — | List users |
| `GET` | `/api/v1/users/:id` | — | Get user |
| `PUT` | `/api/v1/users/:id` | ✓ | Update own profile |
| `DELETE` | `/api/v1/users/:id` | ✓ | Delete own account |
| `GET` | `/api/v1/posts` | — | List published posts |
| `GET` | `/api/v1/posts/:id` | — | Get post |
| `POST` | `/api/v1/posts` | ✓ | Create post |
| `PUT` | `/api/v1/posts/:id` | ✓ | Update own post |
| `DELETE` | `/api/v1/posts/:id` | ✓ | Delete own post |
| `GET` | `/api/v1/comments` | — | List comments |
| `GET` | `/api/v1/comments/:id` | — | Get comment |
| `POST` | `/api/v1/comments` | ✓ | Create comment |
| `PUT` | `/api/v1/comments/:id` | ✓ | Update own comment |
| `DELETE` | `/api/v1/comments/:id` | ✓ | Delete own comment |

All list endpoints support cursor-based pagination via `?cursor=&limit=` query params.

## Project Structure

```
src/
├── index.ts              # Server entry point
├── app.ts                # Hono app, middleware, route mounting
├── db/
│   ├── index.ts          # Drizzle client
│   └── schema.ts         # Table definitions (users, posts, comments)
├── lib/
│   ├── api-response.ts   # Standardized JSON response helpers
│   ├── jwt.ts            # Token sign/verify
│   └── pagination.ts     # Cursor-based pagination utilities
├── middleware/
│   ├── auth.ts           # JWT bearer guard
│   └── error-handler.ts  # Global error & 404 handlers
└── modules/
    ├── auth/             # Register, login, refresh, me
    ├── comments/         # CRUD + nested comments
    ├── health/           # Health check
    ├── posts/            # CRUD + publish workflow
    └── users/            # Profile CRUD
```

Each module contains `*.route.ts`, `*.handler.ts`, and `*.schema.ts`.
