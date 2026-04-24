# 从想法到 GitHub Issues（端到端编排）

## 场景

用户说：

> 我想加一个通知系统

背景：项目目前没有通知功能，用户希望从零开始规划并拆分为可执行的 GitHub Issues。

## 触发的 Skill

`/idea-to-issues` — 总控编排器，串联 4 个阶段：PRD → Spec → Tasks → Issues。

每个阶段完成后等待用户确认，再进入下一阶段。

## 完整流程

### Stage 1: PRD（`/write-a-prd`）

#### 1a. 调研（researcher）

```
Agent(subagent_type="researcher", prompt="
  探索代码库现状，为通知系统 PRD 收集背景信息：
  1. 现有用户系统（apps/api/src/modules/users/）
  2. 现有帖子/评论模块（apps/api/src/modules/posts/, comments/）
  3. 前端页面结构（apps/h5/src/pages/）
  4. 是否有推送相关的基础设施
  5. 数据库 schema 中与通知相关的表
  总结现状和可能的通知触发场景。
")
```

#### 1b. 输出 PRD

基于调研结果，按 `.claude/templates/prd-template.md` 输出 PRD：

```
→ 保存到 docs/prds/notification-system.md
```

PRD 包含：背景、目标、用户故事、功能需求、非功能需求、范围边界。

#### 1c. 用户确认

> "PRD 已完成，要继续到 Spec 阶段吗？"

用户确认后进入下一阶段。

### Stage 2: Spec（`/prd-to-spec`）

#### 2a. 调研（researcher）

```
Agent(subagent_type="researcher", prompt="
  为通知系统 Spec 调研技术细节：
  1. 现有 API 中间件和路由注册方式
  2. 数据库迁移流程（drizzle-kit）
  3. 前端状态管理模式（@tanstack/react-query）
  4. WebSocket / SSE 是否已有基础设施
  5. 邮件发送能力（Resend）
")
```

#### 2b. 规划（planner）

```
Agent(subagent_type="planner", prompt="
  基于 PRD 和调研结果，设计通知系统的技术方案：
  - 数据库 schema（notifications 表）
  - API 端点设计（CRUD + 标记已读）
  - 实时推送方案（SSE vs WebSocket vs 轮询）
  - 前端组件设计（通知列表、未读角标）
  - 测试策略
  按 .claude/templates/spec-template.md 输出。
")
```

#### 2c. 输出 Spec

```
→ 保存到 docs/specs/notification-system-spec.md
```

#### 2d. 用户确认

> "Spec 已完成，要继续拆任务吗？"

### Stage 3: Tasks（`/spec-to-tasks`）

#### 3a. 规划（planner）

```
Agent(subagent_type="planner", prompt="
  将通知系统 Spec 拆分为垂直切片任务：
  - 每个任务是一个完整的用户能力（非水平切片）
  - 按 .claude/templates/task-template.md 格式
  - 标注依赖关系
  - 每个任务 1-3 天工作量
  遵守 .claude/rules/task-decomposition.md。
")
```

#### 3b. 输出任务文件

```
→ docs/tasks/notification-system/
  ├── T1-notification-table-and-crud-api.md
  ├── T2-trigger-notification-on-comment.md
  ├── T3-notification-list-page.md
  ├── T4-unread-badge.md
  └── T5-mark-as-read.md
```

#### 3c. 用户确认

> "任务已拆分为 5 个垂直切片，要创建 GitHub Issues 吗？"

### Stage 4: Issues（`/tasks-to-issues`）

将任务文件转为 GitHub Issues：

```bash
gh issue create --title "feat(api): notification table and CRUD API" --body "..."
gh issue create --title "feat(api,h5): trigger notification on comment" --body "..."
# ...
```

输出 Issue 列表和链接。

## 阶段间的 Agent 调度总结

| 阶段 | researcher | planner | implementer | reviewer |
|------|-----------|---------|-------------|---------|
| PRD（write-a-prd） | **必须** | 推荐 | — | — |
| Spec（prd-to-spec） | **必须** | **必须** | — | — |
| Tasks（spec-to-tasks） | 推荐 | **必须** | — | — |
| Issues（tasks-to-issues） | — | 推荐 | — | — |

此表来自 `agents/README.md` 的 command-agent 调度表。

## 涉及的 Agent / Skill / Rule

| 类型 | 名称 |
|------|------|
| Skill | `/idea-to-issues`（编排）、`/write-a-prd`、`/prd-to-spec`、`/spec-to-tasks`、`/tasks-to-issues` |
| Agent | researcher, planner |
| Rule | `task-decomposition.md`, `api.md`, `coding.md` |
| Template | `prd-template.md`, `spec-template.md`, `task-template.md` |
