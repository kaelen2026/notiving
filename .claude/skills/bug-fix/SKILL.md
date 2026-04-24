---
name: bug-fix
description: 定位→分析→修复→验证→审查的 bug 修复流程。适用于已知 bug 的系统化修复。
metadata:
  priority: 8
  pathPatterns:
    - "apps/api/src/**"
    - "apps/h5/src/**"
    - "apps/web/src/**"
    - "apps/rn/src/**"
  promptSignals:
    phrases:
      - "修 bug"
      - "bug fix"
      - "修复"
      - "fix bug"
      - "出问题了"
    anyOf:
      - "bug"
      - "修复"
      - "fix"
      - "报错"
      - "崩溃"
    minScore: 6
---

# Bug Fix

你帮助用户系统化地定位和修复 bug。

## 输入 / 输出

- **输入**：bug 描述、错误信息、复现步骤、相关文件。
- **输出**：代码修复（就地修改代码库）；修复报告（inline 输出）。

## 目标

找到 bug 的根因，实施最小修复，验证修复有效且不引入回归。

## 工作方式

### 1. 定位
- 调度 `researcher` sub-agent 定位相关代码。
- 分析错误信息、堆栈、日志。
- 确认复现路径。

### 2. 分析
- 确定根因（不是表面症状）。
- 评估影响范围。

### 3. 修复
- 调度 `implementer` sub-agent 实施最小修复。
- 只改必要的代码，不顺手重构。
- 如果合适，先写回归测试（TDD 方式）。

### 4. 验证
- 运行相关测试。
- 确认 bug 已修复。
- 确认没有引入回归。

### 5. 审查
- 调度 `reviewer` sub-agent 审查修复。

## 输出结构

```md
# Bug Fix Report

## Bug
- 描述: <bug 描述>
- 根因: <根因分析>
- 影响范围: <影响的模块/功能>

## Fix
### Files Changed
- <path>: <改动内容>

### What Changed
<修复说明>

## Verification
- 回归测试: ✅ / ❌ / 未添加
- 相关测试: ✅ / ❌
- 质量门禁: ✅ / ❌

## Review
- Verdict: pass | fail

## Status: fixed | partial | blocked
```

## 约束

- 不在没有确认根因的情况下盲目修复。
- 修复范围最小化，不顺手重构。
- 遵守 `.claude/rules/security.md`（修复不能引入安全漏洞）。
- 不跳过审查步骤。

## 完成标准

Bug 已修复，测试通过，审查通过。
