# Quality Gates

## Pre-commit Checks

All commits must pass these automated checks (enforced via Husky hooks in `.husky/`):

- **Commit message format** — Conventional Commits via commitlint (`feat:`, `fix:`, `chore:`, etc.)
- **Lint + Typecheck** — `pnpm turbo lint typecheck` runs on every commit (turbo caching makes unchanged projects instant)
- **Native builds** — when `apps/android/` or `apps/ios/` files are staged, Gradle `assembleDebug` or `xcodebuild` runs automatically

## Pre-push / CI Checks

Before merging to main, all changes must pass:

### 1. Type Checking

```bash
# Root level - check all workspaces
pnpm turbo typecheck

# Per-app verification
pnpm --filter @notiving/api run typecheck
pnpm --filter h5 run typecheck
pnpm --filter web run typecheck
pnpm --filter rn run typecheck
```

**Gate**: Zero TypeScript errors. No `any`, no `@ts-ignore`.

### 2. Linting

```bash
pnpm turbo run lint
```

**Gate**: Zero linter errors.

- `api`, `web`, `rn`: Biome (`biome check src`)
- `h5`: ESLint (`eslint .`)

Auto-fix allowed in development, but CI must pass without fixes.

### 3. Tests

```bash
pnpm turbo run test
```

**Gate**: All tests pass. Currently only `api` has tests (Vitest).

- Minimum coverage: not enforced yet (TODO: add threshold when coverage is established)
- Test files colocated with source (`*.test.ts` next to `*.ts`)

### 4. Build Verification

```bash
pnpm turbo run build
```

**Gate**: All apps build successfully without warnings.

#### Web/API Apps
- `api`: `tsc` produces `dist/`
- `h5`: `tsc -b && vite build` produces `dist/`
- `web`: `next build` produces `.next/`

#### Native Apps

**iOS** (requires macOS + Xcode):
```bash
cd apps/ios/notiving
xcodebuild -project notiving.xcodeproj -scheme notiving -configuration Debug \
  -destination 'generic/platform=iOS' build
```

**Android** (requires JDK + Android SDK):
```bash
cd apps/android
./gradlew compileDebugKotlin    # Kotlin compilation check (authoritative)
./gradlew assembleDebug         # Full debug build (may need JDK toolchain)
```

**HarmonyOS** (requires DevEco Studio):
```bash
cd apps/harmony
# Build via hvigorw (HarmonyOS build tool)
./hvigorw assembleHap --mode module -p product=default
```

**Gate for native apps**:
- Zero compilation errors
- Zero critical lint warnings (platform-specific linters)
- Successful archive/APK/HAP generation
- CI runs native builds only when files in `apps/{platform}/` are modified

### 5. Code Review

**Required before merge**:

- At least one approval from a team member
- No unresolved comments
- Branch up-to-date with `main`

## Task-Level Quality Gates

These gates ensure each task is properly scoped and independently verifiable.

### Before Starting a Task

- [ ] Task template (`.claude/templates/task-template.md`) filled out completely
- [ ] **Input** section clearly defines requirements, dependencies, and constraints
- [ ] **Output** section explicitly lists all deliverables (backend, frontend, tests, docs)
- [ ] **Acceptance criteria** written with minimum 3 specific, testable conditions
- [ ] Dependencies identified and verified as met (existing features/APIs available)
- [ ] Scope is appropriate (one complete user capability, not too broad or narrow)

### During Development

- [ ] Work stays within defined scope (no scope creep beyond acceptance criteria)
- [ ] Each commit follows Conventional Commits format (`feat:`, `fix:`, etc.)
- [ ] Tests written alongside code (not deferred to end)
- [ ] Code follows project conventions (`.claude/rules/coding.md`)
- [ ] Regular verification that quality gates still pass

### Before Creating PR

- [ ] All acceptance criteria met and verifiable
- [ ] Verification steps completed (automated + manual + edge cases)
- [ ] PR template (`.github/pull_request_template.md`) filled out completely
- [ ] All quality gates pass: `pnpm turbo run lint typecheck test build`
- [ ] Manual test steps documented for reviewers
- [ ] Edge cases identified and tested
- [ ] No decrease in test coverage

### PR Review Checklist

Reviewers must verify:

- [ ] PR matches task template structure (input/output clearly documented)
- [ ] All acceptance criteria verified with clear evidence (test names, manual steps)
- [ ] Manual test steps provided and reproducible
- [ ] Edge cases covered (tests or documented manual verification)
- [ ] No unnecessary changes outside defined scope
- [ ] Code quality meets standards (no `any`, proper error handling, clear naming)
- [ ] Tests are comprehensive (happy path + error cases)
- [ ] Documentation updated where needed

### Task Scope Validation

**Red flags that indicate poor task decomposition:**

❌ **Too broad**: PR changes 20+ files, takes 5+ days, multiple user stories mixed
- Action: Should have been split into smaller vertical slices

❌ **Too narrow**: PR changes 1-2 files, no user-facing value, just technical refactor
- Action: Should be combined with related user-facing feature

❌ **Horizontal slice**: Only one layer changed (e.g., just database schema, no API/frontend)
- Action: Should include all layers to deliver complete user capability

❌ **Vague acceptance criteria**: "Feature works", "Code is clean", "Performance is good"
- Action: Rewrite with specific, testable conditions

✅ **Good vertical slice**: 5-15 files, 1-3 days, one complete user capability, clear acceptance criteria

See `.claude/rules/task-decomposition.md` for detailed guidelines.

## Blocking Issues

The following issues **block merge**:

- TypeScript errors (`tsc --noEmit` fails)
- Linter errors (warnings are allowed but discouraged)
- Test failures
- Build failures (web/API apps + affected native platforms)
- Native compilation errors (iOS/Android/HarmonyOS)
- Merge conflicts
- Uncommitted changes to `pnpm-lock.yaml` (indicates missing `pnpm install`)

## Non-blocking Warnings

These should be addressed but don't block merge:

- Linter warnings
- TODO comments (track in issues instead)
- Console logs in non-debug code (clean up before production)

## Local Development Workflow

Before pushing:

```bash
# Quick check (web/API apps only)
pnpm lint && pnpm typecheck && pnpm test

# Full gate simulation (what CI will run)
pnpm turbo run lint typecheck test build

# Native apps (run only if you modified them — pre-commit hook does this automatically)
cd apps/ios/notiving && xcodebuild -project notiving.xcodeproj -scheme notiving -configuration Debug -destination 'generic/platform=iOS' build
cd apps/android && ./gradlew compileDebugKotlin
cd apps/harmony && ./hvigorw assembleHap --mode module -p product=default
```

## Future Enhancements

- [ ] Add test coverage thresholds (target: 80% for `api`)
- [ ] Add bundle size limits for `h5` and `web`
- [ ] Add performance budgets (Lighthouse CI)
- [ ] Add visual regression tests (Chromatic or Percy)
- [ ] Add security scanning (npm audit, Snyk)
- [x] ~~Add pre-push hook to run tests locally~~ (pre-commit hook runs lint + typecheck)
- [x] ~~Integrate native app builds into CI (conditional on path changes)~~ (pre-commit hook detects android/ios changes)
- [ ] Add unit tests for native apps (XCTest for iOS, JUnit for Android)
- [ ] Add Flutter build verification (`flutter build apk --release`)
