# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Verify changes before reporting done: run `tsc --noEmit` and the relevant build command in the affected app. See `README.md` for all build/dev commands.

## Rules (`.claude/rules/`)

| File | Scope |
|------|-------|
| `coding.md` | TypeScript, React, Tailwind, file naming, import order |
| `quality-gates.md` | Pre-commit hooks, CI checks, PR review checklist |
| `native-build.md` | iOS/Android/bridge compilation verification |
| `task-decomposition.md` | Vertical slices, acceptance criteria, scope guidelines |
| `design.md` | Design system, color tokens, typography, spacing |
| `bridge.md` | Native ↔ web bridge conventions |
| `api.md` | Hono, Drizzle, module structure, response envelope, middleware |
| `testing.md` | Vitest, test patterns, service/integration tests |
| `security.md` | Auth, input validation, OWASP, secret management |
| `react-native.md` | Embedded RN, ShellBridge, no-navigation pattern |
| `harmonyos.md` | ArkTS, ArkUI, hilog, hypium testing |
| `flutter.md` | Dart, Flutter module embed, Material3 |

## Git

- **Conventional Commits** required (`feat:`, `fix:`, `chore:`, etc.) — enforced by commitlint
- **Pre-commit hook** runs `pnpm turbo lint typecheck` + native builds when relevant files change
- Scopes: `api`, `h5`, `web`, `rn`, `android`, `ios`, `harmony`, `flutter`
