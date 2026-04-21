# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
# Root-level (Turborepo)
pnpm install          # install all workspace deps
pnpm build            # turbo run build across all apps
pnpm dev              # turbo run dev (starts all dev servers)
pnpm lint             # turbo run lint
pnpm test             # turbo run test

# apps/api (Hono + Drizzle)
pnpm --filter @notiving/api dev          # tsx watch src/index.ts
pnpm --filter @notiving/api build        # tsc
pnpm --filter @notiving/api lint         # biome check src
pnpm --filter @notiving/api lint:fix     # biome check --fix src
pnpm --filter @notiving/api db:generate  # drizzle-kit generate
pnpm --filter @notiving/api db:migrate   # drizzle-kit migrate
pnpm --filter @notiving/api db:push      # drizzle-kit push
pnpm --filter @notiving/api db:studio    # drizzle-kit studio

# apps/h5 (Vite + React)
pnpm --filter h5 dev
pnpm --filter h5 build    # tsc -b && vite build
pnpm --filter h5 lint     # eslint

# apps/web (Next.js)
pnpm --filter web dev
pnpm --filter web build   # next build
pnpm --filter web lint    # biome check

# apps/rn (React Native)
pnpm --filter rn dev      # react-native start
pnpm --filter rn build    # bundle ios + android
```

Verify changes before reporting done: run `tsc --noEmit` and the relevant build command in the affected app.

## Architecture

**Monorepo** managed by pnpm workspaces + Turborepo. Workspaces: `apps/*` and `packages/*`.

### Apps

| App | Tech | Port/Notes |
|-----|------|------------|
| `api` | Hono, Drizzle ORM, PostgreSQL, Zod, JWT (bcrypt) | `:3001`, Biome linter |
| `h5` | Vite, React 19, React Router, TanStack Query, Tailwind v4 | ESLint |
| `web` | Next.js 16, React 19, Tailwind v4, React Compiler | Biome linter |
| `rn` | React Native 0.85 | Biome linter |
| `android` | Native Android (Gradle/Kotlin) | |
| `ios` | Native iOS (Xcode/Swift) | |
| `harmony` | HarmonyOS (ArkTS) | |
| `flutter` | Flutter/Dart | |

### API (`apps/api`) Structure

- `src/modules/{resource}/` — each resource has `*.route.ts` (Hono routes), `*.handler.ts` (business logic + DB queries), `*.schema.ts` (Zod schemas + types)
- `src/middleware/` — `auth.ts` (JWT bearer guard sets `userId` on context), `error-handler.ts`
- `src/lib/` — `api-response.ts` (standard JSON envelope), `jwt.ts` (sign/verify), `pagination.ts` (cursor-based)
- `src/db/` — Drizzle client (`index.ts`) and schema (`schema.ts` with `users`, `posts`, `comments` tables)
- Local PostgreSQL via `docker-compose.yml`; env vars in `.env` (see `.env.example`)

### Packages

`packages/` is currently empty — intended for shared types/utilities across apps.

## Code Style Rules

These are enforced via `.claude/rules/coding.md`:

- **TypeScript strict mode** — no `any`, no `@ts-ignore`
- **Double quotes**, trailing commas, semicolons
- **Functional components only**, exported as `export default function ComponentName()`
- **`@tanstack/react-query`** for all server state — no `useEffect` + `useState` for fetching
- **Tailwind CSS v4** utility classes only — no custom CSS files, no inline `style` props
- **File naming**: PascalCase for components (`Button.tsx`), camelCase for non-component modules (`apiClient.ts`)
- **No barrel files** (`index.ts` re-exports) — import directly from source
- **Import order**: react → third-party → internal (aliased `@/`) → relative
- **Component files under 200 lines**; extract sub-components when exceeded
- **Colocated test files** (`Component.test.tsx` next to `Component.tsx`)

## Git

- **Conventional Commits** required (`feat:`, `fix:`, `chore:`, etc.) — enforced by commitlint + Husky pre-commit hook
- Scopes: `api`, `h5`, `web`, `rn`, `android`, `ios`, `harmony`, `flutter`
