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

# apps/ios (Native iOS)
cd apps/ios/notiving
xcodebuild -project notiving.xcodeproj -scheme notiving -configuration Debug \
  -destination 'generic/platform=iOS' build

# apps/android (Native Android — Kotlin compilation)
cd apps/android
./gradlew compileDebugKotlin        # verify Kotlin compiles
./gradlew assembleDebug             # full debug build (requires JDK toolchain)
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

## Quality Gates

See `.claude/rules/quality-gates.md` for full details. Before pushing:

```bash
pnpm turbo run lint test build  # simulate CI checks
```

**Merge blockers**: TypeScript errors, linter errors, test failures, build failures.

## Native Build Verification

When modifying native code (`apps/ios/`, `apps/android/`), you **must** verify compilation before reporting done.

### iOS

```bash
cd apps/ios/notiving
xcodebuild -project notiving.xcodeproj -scheme notiving -configuration Debug \
  -destination 'generic/platform=iOS' build 2>&1 | grep "error:" | head -20
```

- **Gate**: Zero compilation errors in files you modified.
- Pre-existing errors in unmodified files do not block your changes.
- Swift files using `@Published` / `ObservableObject` must `import Combine`.

### Android

```bash
cd apps/android
./gradlew compileDebugKotlin
```

- **Gate**: `compileDebugKotlin` must succeed (`BUILD SUCCESSFUL`).
- `assembleDebug` may fail due to local JDK toolchain issues — `compileDebugKotlin` is the authoritative check for code correctness.

### Cross-platform Bridge Changes

When modifying bridge interfaces (`packages/bridge-types/`, `apps/*/Shell/Bridge/`):

1. **TypeScript**: `pnpm --filter h5 exec tsc --noEmit && pnpm --filter rn exec tsc --noEmit`
2. **iOS**: `xcodebuild` as above — check that `ShellBridgeModule.swift`, `H5BridgeHandler.swift` compile
3. **Android**: `./gradlew compileDebugKotlin` — check that `ShellBridgeModule.kt`, `H5BridgeInterface.kt` compile
4. **Stub dependencies**: If bridge code calls `ShellRouter` or `SessionManager` methods that don't exist yet, add stub methods to those classes

## Task Decomposition

All work must be organized as **vertical slices** - business features that deliver end-to-end user value.

**Before starting any task:**

1. Copy `.claude/templates/task-template.md` to plan your work
2. Fill out **Input** (requirements, dependencies, constraints)
3. Fill out **Output** (specific deliverables across all layers)
4. Define minimum 3 **acceptance criteria** (specific, testable conditions)
5. Get alignment on scope before coding

**When creating a PR:**

- Use `.github/pull_request_template.md` (auto-populated by GitHub)
- Document how each acceptance criterion was verified
- Include manual test steps for reviewers
- Verify all task-level quality gates pass

**Key principles:**

- One task = one complete user capability (not a technical layer)
- Spans all layers: database → API → frontend → tests → docs
- Independently verifiable (can test end-to-end)
- Reasonable size (1-3 days, 5-15 files)

See `.claude/rules/task-decomposition.md` for detailed guidelines and examples.

## Git

- **Conventional Commits** required (`feat:`, `fix:`, `chore:`, etc.) — enforced by commitlint + Husky pre-commit hook
- Scopes: `api`, `h5`, `web`, `rn`, `android`, `ios`, `harmony`, `flutter`
