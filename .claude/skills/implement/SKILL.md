---
name: implement
description: 完整实现流程：调研→规划→实现→审查，调度 sub-agent 协作完成。适用于有明确需求或任务文件的功能实现。
metadata:
  priority: 8
  pathPatterns:
    - "docs/tasks/**"
    - "docs/specs/**"
    - "apps/api/src/**"
    - "apps/h5/src/**"
    - "apps/web/src/**"
  promptSignals:
    phrases:
      - "实现"
      - "implement"
      - "开始做"
      - "落地"
      - "写代码"
    anyOf:
      - "实现"
      - "implement"
      - "做"
      - "写"
    minScore: 6
---

# Implement

你帮助用户完成从需求到代码的完整实现流程。

## 输入 / 输出

- **输入**：`docs/tasks/` 下的任务文件、`docs/specs/` 下的 Spec、或用户描述的需求。
- **输出**：代码改动（就地修改代码库）；实现报告（inline 输出）。

## 目标

按 `researcher → planner → implementer → reviewer` 流程完成实现，确保代码通过质量门禁。

## 工作方式

1. **调研**：调度 `researcher` sub-agent 摸清相关代码、现有模式、约束。
2. **规划**：对于非平凡任务，调度 `planner` sub-agent 确认方案（简单任务可跳过）。
3. **实现**：调度 `implementer` sub-agent 按计划执行代码改动。
4. **审查**：调度 `reviewer` sub-agent 审查实现。
5. **修复**：如果审查不通过，回到实现步骤修复问题。

## 输出结构

```md
# Implementation Report

## Task
<任务名称和来源>

## Research Findings
<关键发现摘要>

## Plan
<方案摘要（如有）>

## Implementation
### Files Changed
- <path>: <改动内容>

### What Changed
1. <实现点>

## Review
- Verdict: pass | fail
- Issues: <如有>

## Verification
- lint: ✅ / ❌
- typecheck: ✅ / ❌
- test: ✅ / ❌

## Status: done | partial | blocked
```

## 约束

- 严格按 agents/README.md 的调度表调度 sub-agent。
- 不跳过审查步骤。
- 实现范围限定在任务/需求内，不扩展。
- 遵守所有 `.claude/rules/` 规则。

## 完成标准

代码改动已完成，审查通过，质量门禁通过。
