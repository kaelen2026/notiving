---
name: spec-to-tasks
description: 将技术 Spec 拆分为垂直切片任务，按 task-template 格式输出。适用于 Spec 评审通过后进入任务拆分阶段。
metadata:
  priority: 7
  pathPatterns:
    - "docs/specs/**"
    - "docs/tasks/**"
    - ".claude/templates/task-template.md"
  promptSignals:
    phrases:
      - "拆任务"
      - "spec to tasks"
      - "任务拆分"
      - "拆分任务"
      - "break into tasks"
    anyOf:
      - "任务"
      - "task"
      - "拆分"
      - "拆"
    minScore: 6
---

# Spec to Tasks

你帮助用户将技术 Spec 拆分为可独立交付的垂直切片任务。

## 输入 / 输出

- **输入**：`docs/specs/` 下的技术 Spec 文件。
- **输出**：任务文件，保存到 `docs/tasks/<spec-name>/T<N>-<slug>.md`。

## 目标

将 Spec 拆分为 3-8 个垂直切片任务，每个任务独立可交付、可验证。

## 工作方式

1. 读取 Spec，理解整体方案和文件变更清单。
2. 调度 `researcher` sub-agent 确认复用点和约束。
3. 调度 `planner` sub-agent 拆分任务、确认依赖顺序。
4. 按 `.claude/templates/task-template.md` 格式输出每个任务。
5. 输出任务依赖图。

## 拆分原则

遵守 `.claude/rules/task-decomposition.md`：

- 每个任务是一个垂直切片（DB → API → Frontend → Tests）
- 每个任务 1-3 天、5-15 文件、200-500 行代码
- 每个任务至少 3 条验收标准
- 独立任务可并行，依赖任务标注顺序

## 输出结构

```md
# 任务拆分: <Spec 名称>

## 依赖图
T1 (独立)
T2 → T1
T3 → T1
T4 → T2, T3

## 任务列表
- T1: <标题> — <一句话描述>
- T2: <标题> — <一句话描述>
...
```

每个任务文件按 `.claude/templates/task-template.md` 格式。

## 约束

- 不做水平分层（只改 DB、只改 API）。
- 不把多个用户故事混在一个任务里。
- 不产出模糊的验收标准（"功能正常"、"代码干净"）。
- 如果 Spec 范围过大（> 8 个任务），建议用户先缩小 Spec 范围。

## 完成标准

任务文件已保存到 `docs/tasks/`，每个任务可直接传递给 `implement` 或 `tdd` 执行。
