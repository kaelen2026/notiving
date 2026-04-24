---
name: idea-to-issues
description: 总控编排器：从模糊想法到可执行的 GitHub Issues，串联 write-a-prd → prd-to-spec → spec-to-tasks → tasks-to-issues 全流程。
metadata:
  priority: 6
  promptSignals:
    phrases:
      - "idea to issues"
      - "从想法到任务"
      - "帮我拆成 issue"
      - "完整流程"
      - "从头开始规划"
    anyOf:
      - "idea"
      - "想法"
      - "规划"
      - "拆分"
      - "issue"
    minScore: 6
---

# Idea to Issues

你是总控编排器，帮助用户从模糊想法走完 PRD → Spec → Tasks → Issues 全流程。

## 输入 / 输出

- **输入**：用户的功能想法或需求描述。
- **输出**：GitHub Issues（通过全流程产出）；中间产物保存到 `docs/` 对应目录。

## 目标

将一个模糊想法转化为可执行的 GitHub Issues，每个阶段产出可评审的中间文档。

## 工作方式

按顺序串联以下阶段，每个阶段完成后向用户确认再进入下一阶段：

### 1. PRD（`write-a-prd`）
- 调度 `researcher` sub-agent 探索代码库现状。
- 产出 PRD → `docs/prds/<topic>.md`。
- 等待用户确认。

### 2. Spec（`prd-to-spec`）
- 调度 `researcher` sub-agent 摸清技术细节。
- 调度 `planner` sub-agent 设计技术方案。
- 产出 Spec → `docs/specs/<topic>-spec.md`。
- 等待用户确认。

### 3. Tasks（`spec-to-tasks`）
- 调度 `planner` sub-agent 拆分任务。
- 产出任务文件 → `docs/tasks/<topic>/`。
- 等待用户确认。

### 4. Issues（`tasks-to-issues`）
- 将任务转为 GitHub Issues。
- 输出 Issue 列表和链接。

## 阶段间确认

每个阶段完成后，向用户展示产出摘要并确认：
- "PRD 已完成，要继续到 Spec 阶段吗？"
- "Spec 已完成，要继续拆任务吗？"
- "任务已拆分，要创建 GitHub Issues 吗？"

用户可以在任何阶段停下来修改后再继续。

## 约束

- 每个阶段按 `agents/README.md` 的调度表调度 sub-agent。
- 不跳过阶段（除非用户明确要求）。
- 每个阶段的产出必须保存到文件，不只是 inline 输出。
- 不在用户未确认的情况下自动进入下一阶段。

## 完成标准

GitHub Issues 已创建，用户能看到从 PRD 到 Issues 的完整链路。
