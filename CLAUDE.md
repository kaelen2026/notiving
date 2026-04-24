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
| `worktree` | Branch isolation for large tasks (10+ files, cross-module) |

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

## Sub-Agent 调度规范（强制）

收到实现、审查、修复类任务时，**必须**调用对应的 skill 而非自行实现：

| 任务类型 | 必须调用的 skill | 说明 |
|---------|----------------|------|
| 功能实现 / 重构 | `/implement` | 走完 researcher → planner → implementer → reviewer 全流程 |
| Bug 修复 | `/bug-fix` | 走完 researcher → implementer → reviewer 流程 |
| Code review | `/code-review` | 调度 reviewer agent 执行审查 |
| 质量检查 | `/quality-gate` | 运行全套 lint/typecheck/test/build |
| 提交 PR | `/ship` | 自检 → commit → push → PR |
| 大任务隔离 | `/worktree` | 跨模块或 10+ 文件改动时，先创建 worktree 再执行 |

**强制规则：**

1. **禁止跳过 reviewer**：任何代码改动完成后，必须调度 `.claude/agents/reviewer.md` 定义的 reviewer agent 做审查，审查通过后才能报告完成。
2. **优先自定义 agent**：调研用 `.claude/agents/researcher.md`，规划用 `.claude/agents/planner.md`，实现用 `.claude/agents/implementer.md`，审查用 `.claude/agents/reviewer.md`。不要用内置通用 agent 类型替代。
3. **按调度表执行**：`agents/README.md` 中的 command-agent 调度表是唯一真实来源，每个 skill 内部必须按表调度对应的 agent。
4. **质量门禁不可省略**：实现完成后必须运行 `.claude/rules/quality-gates.md` 中定义的检查（至少 lint + typecheck + 涉及端的编译检查）。
5. **提交即 Ship**：用户说"commit"、"提交"时，默认走 `/ship` 流程（含 PR 创建）。仅当用户明确说"只 commit 不推"时才跳过 push 和 PR。

## 验收闭环（强制）

任何代码改动在报告"完成"之前，**必须**按以下三步验收。不可跳过、不可合并、不可用"编译通过"替代。

### Step 1: 质量门禁（自动化）

调度 `/quality-gate` skill，或手动执行以下检查：

```bash
# 必选（所有改动）
pnpm turbo run lint typecheck test

# 条件触发（按改动范围）
# iOS 改动 →
cd apps/ios/notiving && xcodebuild -project notiving.xcodeproj -scheme notiving \
  -configuration Debug -destination 'generic/platform=iOS' build 2>&1 | grep "error:" | head -20
# Android 改动 →
cd apps/android && ./gradlew compileDebugKotlin
# HarmonyOS 改动 →
cd apps/harmony && ./hvigorw assembleHap --mode module -p product=default
```

**通过标准**：零 lint error、零 typecheck error、零 test failure、零编译 error。lint warning 不阻塞但需列出。

### Step 2: Reviewer 审查（结构化）

调度 `.claude/agents/reviewer.md` 定义的 reviewer agent，传入改动范围。reviewer 必须输出以下结构：

```
Verdict: pass | fail
Issues:
  🔴 [阻塞] <问题> — <file:line>
  🟡 [建议] <问题> — <file:line>
Checks: 正确性 / 规范性 / 安全性 / 完整性 / 质量门禁
```

**通过标准**：Verdict 为 pass，零 🔴 阻塞问题。如果 fail，必须修复后重新提交审查。

### Step 3: 验收报告（输出给用户）

审查通过后，输出验收报告作为最终回复的一部分：

```
## Acceptance
- Quality Gate: ✅ lint / ✅ typecheck / ✅ test / ✅ build (iOS)
- Review: pass — 0 blocking, N suggestions
- Files Changed: N files
- Scope: <一句话描述改动范围>
- Known Limitations: <无法自动验证的项，如需要真机测试的 UI 交互>
```

**"Known Limitations" 必须诚实列出**：无法启动模拟器、无法端到端测试 OAuth、无法验证深色模式等。不要用"编译通过"暗示功能正确。

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
