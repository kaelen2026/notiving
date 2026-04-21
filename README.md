# Notiving

Cross-platform monorepo powered by **pnpm workspaces** and **Turborepo**.

## Tech Stack

| App | Path | Tech |
|-----|------|------|
| API | `apps/api` | Hono · Drizzle ORM · PostgreSQL · Zod · JWT |
| Web | `apps/web` | Next.js 16 · React 19 · Tailwind CSS v4 |
| H5 | `apps/h5` | Vite · React 19 · React Router · TanStack Query · Tailwind CSS v4 |
| React Native | `apps/rn` | React Native 0.85 |
| Android | `apps/android` | Kotlin · Jetpack Compose |
| iOS | `apps/ios` | Swift · SwiftUI |
| HarmonyOS | `apps/harmony` | ArkTS · HarmonyOS SDK |
| Flutter | `apps/flutter` | Flutter module (cross-platform embedding) |

Shared packages live in `packages/`.

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** 9.x (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)
- **Docker** (for local PostgreSQL)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the database
docker compose -f apps/api/docker-compose.yml up -d

# Push schema to the database
pnpm --filter @notiving/api db:push

# Run all dev servers
pnpm dev
```

## Commands

```bash
pnpm build       # Build all apps
pnpm dev         # Start all dev servers
pnpm lint        # Lint all apps
pnpm test        # Run all tests
```

Target a single app with `--filter`:

```bash
pnpm --filter @notiving/api dev
pnpm --filter h5 build
pnpm --filter web dev
```

## Git Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by **commitlint** + **Husky**.

```
feat(api): add user profile endpoint
fix(h5): resolve routing issue on refresh
chore: update dependencies
```
