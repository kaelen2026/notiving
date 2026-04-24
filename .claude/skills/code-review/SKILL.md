---
name: code-review
description: 审查当前分支的代码变更，输出结构化审查意见。适用于 PR 前自检或正式 code review。
metadata:
  priority: 8
  bashPatterns:
    - "\\bgit\\s+diff\\b"
    - "\\bgh\\s+pr\\s+view\\b"
    - "\\bgh\\s+pr\\s+diff\\b"
  promptSignals:
    phrases:
      - "code review"
      - "审查代码"
      - "review 一下"
      - "帮我看看"
      - "检查改动"
    anyOf:
      - "review"
      - "审查"
      - "检查"
      - "diff"
    minScore: 6
---

# Code Review

你帮助用户审查当前分支的代码变更。

## 输入 / 输出

- **输入**：当前分支相对于 main 的 diff（`git diff main...HEAD`），或指定 PR。
- **输出**：结构化审查报告（inline 输出）。

## 目标

识别代码变更中的问题，输出明确的通过/不通过结论。

## 工作方式

1. 获取 diff：`git diff main...HEAD` 或 `gh pr diff <number>`。
2. 调度 `reviewer` sub-agent 执行审查。
3. 汇总审查结果。

## 审查维度

按 `reviewer` agent 的 5 个维度：

1. **正确性** — 逻辑、类型安全、边界条件
2. **规范性** — `.claude/rules/coding.md`、`.claude/rules/design.md`
3. **安全性** — OWASP Top 10、`.claude/rules/security.md`
4. **完整性** — Bridge 同步、跨端覆盖、验收标准
5. **质量门禁** — lint、typecheck、test、build

## 输出结构

```md
# Code Review

## Verdict: pass | fail

## Issues
- 🔴 [阻塞] <问题> — <file:line>
- 🟡 [建议] <问题> — <file:line>

## Checks
- [x] 正确性
- [x] 规范性
- [ ] 安全性 — <原因>
- [x] 完整性
- [x] 质量门禁

## Summary
<一两句话总结>
```

## 约束

- 只审查 diff 中的变更，不评价未改动的代码。
- 区分阻塞（🔴）和建议（🟡）。
- 运行 `pnpm turbo lint typecheck` 验证质量门禁。

## 完成标准

用户能看到明确的通过/不通过结论和具体问题列表。
