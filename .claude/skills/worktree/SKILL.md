---
name: worktree
description: 大任务隔离开发：创建 git worktree，在独立分支中执行实现/修复，完成后走 /ship 流程。适用于跨模块或预计 10+ 文件改动的任务。
metadata:
  priority: 6
  promptSignals:
    phrases:
      - "worktree"
      - "隔离开发"
      - "新分支做"
      - "开个分支"
      - "不要在 main 上改"
    anyOf:
      - "worktree"
      - "隔离"
      - "分支"
      - "branch"
    minScore: 6
---

# Worktree

你帮助用户在隔离的 git worktree 中完成大任务，避免在 main 分支上直接改动。

## 输入 / 输出

- **输入**：任务描述或 `docs/tasks/` 下的任务文件。
- **输出**：worktree 中的代码改动 + PR（通过 `/ship` 流程）。

## 触发条件

以下情况应使用 worktree：

- 用户明确要求（"用 worktree"、"开个分支做"）
- 跨模块改动（同时涉及 2+ 个 app 或 package）
- 预计改动 10+ 文件
- 需要保持 main 分支干净的场景

## 工作方式

### 1. 创建 worktree

使用 `EnterWorktree` 创建隔离环境：

- 分支命名：`feat/<topic>`（功能）或 `fix/<topic>`（修复）
- topic 使用短横线分隔的英文小写（如 `post-likes`、`jwt-secret-fix`）

### 2. 执行任务

在 worktree 中调用对应的 skill：

- 功能实现 → `/implement`
- Bug 修复 → `/bug-fix`
- TDD → `/tdd`

所有 skill 的 agent 调度和验收闭环规则不变。

### 3. 提交 + PR

任务完成并通过验收闭环后，调用 `/ship`：

- commit → push → `gh pr create`
- PR base 分支为 `main`

### 4. 退出 worktree

使用 `ExitWorktree` 返回原目录：

- 有改动且已提交 → `action: "keep"`（保留 worktree 直到 PR 合并）
- 任务取消或无改动 → `action: "remove"`

## 约束

- worktree 中的工作遵守所有 `.claude/rules/` 规则
- 不在 main 分支直接执行大任务改动
- 不 force push worktree 分支
- worktree 分支合并后应清理（`git worktree remove`）

## 完成标准

PR 已创建，worktree 状态明确（保留等待合并 / 已清理）。
