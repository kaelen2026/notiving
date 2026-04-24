# Worktree 隔离开发

## 场景

用户说：

> 重构通知系统，涉及 API、H5、iOS 三端，用 worktree 做

背景：通知系统重构预计改动 20+ 文件，跨 `apps/api/`、`apps/h5/`、`apps/ios/` 三个目录。不应在 main 分支直接改动。

## 触发的 Skill

`/worktree` — 大任务隔离开发，内部串联 `/implement` + `/ship`。

## 完整流程

### Step 1: 创建 worktree

主 agent 使用 `EnterWorktree` 创建隔离环境：

```
EnterWorktree(name: "feat/notification-refactor")
```

此时工作目录切换到 `.claude/worktrees/feat/notification-refactor/`，基于 HEAD 创建新分支 `feat/notification-refactor`。

### Step 2: 在 worktree 中执行任务

调用 `/implement` skill，走完整流程：

```
# researcher 调研
Agent(subagent_type="researcher", prompt="
  调研通知系统现状：
  1. apps/api/src/modules/ 中通知相关模块
  2. apps/h5/src/pages/ 中通知页面
  3. apps/ios/notiving/notiving/ 中通知相关 View/ViewModel
  4. 数据库 schema 中 notifications 表
")

# planner 规划
Agent(subagent_type="planner", prompt="
  设计通知系统重构方案：
  - API 端：统一通知 service、支持批量标记已读
  - H5 端：通知列表组件重构、实时更新
  - iOS 端：推送通知集成
")

# implementer 实现
Agent(subagent_type="implementer", prompt="按计划实现...")

# 验收闭环
pnpm turbo run lint typecheck test
# iOS 编译检查
cd apps/ios/notiving && xcodebuild ...

# reviewer 审查
Agent(subagent_type="reviewer", prompt="审查通知系统重构改动...")
```

### Step 3: Ship（commit + push + PR）

验收通过后，在 worktree 中调用 `/ship`：

```bash
git add apps/api/src/modules/notifications/ apps/h5/src/pages/Notifications.tsx apps/ios/...
git commit -m "refactor(api,h5,ios): overhaul notification system"
git push -u origin feat/notification-refactor

gh pr create \
  --title "refactor(api,h5,ios): overhaul notification system" \
  --body "..."
```

### Step 4: 退出 worktree

PR 创建后，保留 worktree 等待合并：

```
ExitWorktree(action: "keep")
```

PR 合并后，清理 worktree：

```
ExitWorktree(action: "remove")
```

## 什么时候该用 worktree

| 条件 | 用 worktree | 直接在当前分支 |
|------|------------|--------------|
| 跨 2+ 个 app/package | ✅ | — |
| 预计 10+ 文件改动 | ✅ | — |
| 用户明确要求 | ✅ | — |
| 单模块小改动 | — | ✅ |
| Bug 修复（1-3 文件） | — | ✅ |

## 验收报告

```
## Acceptance
- Quality Gate: ✅ lint / ✅ typecheck / ✅ test / ✅ build (iOS)
- Review: pass — 0 blocking, 3 suggestions
- Files Changed: 22 files
- Scope: 通知系统重构（API + H5 + iOS）
- Worktree: feat/notification-refactor（保留，等待 PR 合并）
- PR: https://github.com/kaelen/notiving/pull/45
- Known Limitations: iOS 推送通知需真机测试，模拟器无法验证
```

## 涉及的 Agent / Skill / Rule

| 类型 | 名称 |
|------|------|
| Skill | `/worktree`（环境准备）、`/implement`（实现）、`/ship`（提交） |
| Agent | researcher, planner, implementer, reviewer |
| Rule | `quality-gates.md`, `native-build.md`, `api.md`, `coding.md` |
