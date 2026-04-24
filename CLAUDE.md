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

## Skills (`.claude/skills/`)

### Planning

| Skill | Description |
|-------|-------------|
| `write-a-prd` | Generate structured PRD from requirements |
| `prd-check` | Validate PRD against codebase |
| `prd-to-spec` | Convert PRD to technical spec |
| `api-design` | Design API contracts and interface docs |
| `component-design` | Design component trees, props, and state flow |
| `spec-to-tasks` | Split spec into vertical-slice tasks |
| `tasks-to-issues` | Convert task files to GitHub Issues |
| `idea-to-issues` | End-to-end orchestrator: PRD → Spec → Tasks → Issues |

### Implementation

| Skill | Description |
|-------|-------------|
| `implement` | Full flow: research → plan → implement → review |
| `tdd` | Test-driven: Red → Green → Refactor loop |
| `bug-fix` | Systematic: locate → analyze → fix → verify → review |

### Quality & Shipping

| Skill | Description |
|-------|-------------|
| `code-review` | Structured review of current branch diff |
| `quality-gate` | Run full lint/typecheck/test/build checks |
| `ship` | Self-check → commit → push → create PR |
| `deploy` | Deploy to Vercel (web/h5) and Cloudflare Workers (api) |

## Agents (`.claude/agents/`)

| Agent | Role | Modifies Code |
|-------|------|---------------|
| `researcher` | Explore codebase, gather context, summarize findings | No |
| `planner` | Turn requirements into executable technical plans | No |
| `implementer` | Execute code changes according to a given plan | Yes |
| `reviewer` | Review changes for correctness, security, standards | No |

See `agents/README.md` for the dispatch table mapping skills to agents.

## Templates (`.claude/templates/`)

| Template | Usage |
|----------|-------|
| `prd-template.md` | PRD structure: background, goals, user stories, requirements |
| `spec-template.md` | Tech spec: schema, API endpoints, components, test strategy |
| `task-template.md` | Task format: input, output, acceptance criteria, verification |

## Git

- **Conventional Commits** required (`feat:`, `fix:`, `chore:`, etc.) — enforced by commitlint
- **Pre-commit hook** runs `pnpm turbo lint typecheck` + native builds when relevant files change
- Scopes: `api`, `h5`, `web`, `rn`, `android`, `ios`, `harmony`, `flutter`
