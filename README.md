# Notiving

Cross-platform monorepo powered by **pnpm workspaces** and **Turborepo**.

## Tech Stack

### Apps

| App | Path | Tech | Deploy |
|-----|------|------|--------|
| API | `apps/api` | Hono · Drizzle ORM · Neon PostgreSQL · Zod · JWT · OAuth | Cloudflare Workers · `api.notiving.com` |
| Web | `apps/web` | Next.js 16 · React 19 · React Compiler · Tailwind CSS v4 | Vercel · `notiving.com` |
| H5 | `apps/h5` | Vite 8 · React 19 · React Router 7 · TanStack Query 5 · Tailwind CSS v4 | Vercel · `h5.notiving.com` |
| React Native | `apps/rn` | React Native 0.85 · React 19 | Bundle runtime |
| iOS | `apps/ios` | Swift · SwiftUI | Native shell |
| Android | `apps/android` | Kotlin · Jetpack Compose | Native shell |
| HarmonyOS | `apps/harmony` | ArkTS · HarmonyOS SDK | — |
| Flutter | `apps/flutter` | Flutter module | — |

### Packages

| Package | Path | Description |
|---------|------|-------------|
| `@notiving/bridge-types` | `packages/bridge-types` | Shell ↔ JS runtime bridge contract (17 methods) |
| `@notiving/design-tokens` | `packages/design-tokens` | Design tokens — CSS variables, Tailwind v4 theme, TypeScript constants |
| `@notiving/shared` | `packages/shared` | Zod schemas, TypeScript types, typed API client |

### Architecture

Native apps (iOS/Android) act as the **Shell** — owning navigation, session, and lifecycle — while hosting RN and H5 content as managed runtime containers via a typed Bridge Protocol. See [docs/architecture/native-shell.md](docs/architecture/native-shell.md).

## Prerequisites

- **Node.js** 24 (see `.nvmrc`)
- **pnpm** 10.x (`corepack enable && corepack prepare pnpm@latest --activate`)
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

### Deploy

```bash
pnpm deploy:api   # Cloudflare Workers (wrangler)
pnpm deploy:web   # Vercel
pnpm deploy:h5    # Vercel
```

See [docs/deploy.md](docs/deploy.md) for details.

## Git Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by **commitlint** + **Husky**.

```
feat(api): add user profile endpoint
fix(h5): resolve routing issue on refresh
chore: update dependencies
```
