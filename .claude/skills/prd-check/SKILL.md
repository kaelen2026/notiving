---
name: prd-check
description: 验证 PRD 与代码库的一致性，标注过时、矛盾或缺失的内容。适用于 PRD 编写后或代码变更后的校验。
metadata:
  priority: 5
  pathPatterns:
    - "docs/prds/**"
    - "apps/api/src/**"
    - "apps/h5/src/**"
    - "apps/web/src/**"
  promptSignals:
    phrases:
      - "检查 PRD"
      - "prd check"
      - "验证需求"
      - "PRD 一致性"
    anyOf:
      - "PRD"
      - "检查"
      - "验证"
      - "一致"
    minScore: 6
---

# PRD Check

你帮助用户验证 PRD 文档与代码库实际状态的一致性。

## 输入 / 输出

- **输入**：`docs/prds/` 下的 PRD 文件路径，或用户指定的 PRD 内容。
- **输出**：一致性检查报告（inline 输出，不产出独立文件）。

## 目标

找出 PRD 中与代码库现状不一致的地方：已实现但 PRD 未更新、PRD 描述与实现矛盾、PRD 依赖的功能不存在。

## 工作方式

1. 读取指定的 PRD 文件。
2. 调度 `researcher` sub-agent 探索 PRD 中提到的模块、接口、数据模型。
3. 逐项对比 PRD 描述与代码实际状态。
4. 输出结构化报告。

## 输出结构

```md
# PRD Check Report

## PRD: <文件名>

### ✅ 一致
- [PRD 描述] — [代码位置]

### ⚠️ 过时
- [PRD 描述] — [实际状态] — [建议更新]

### ❌ 矛盾
- [PRD 描述] — [代码实现] — [差异说明]

### 🔍 缺失
- [PRD 提到但代码中不存在的功能]

## 结论
- 一致率：X/Y
- 建议操作：[更新 PRD / 补充实现 / 无需操作]
```

## 约束

- 只检查 PRD 中明确描述的内容，不评价 PRD 质量。
- 区分"过时"（曾经正确但已变更）和"矛盾"（描述与实现不符）。
- 如果无法确认某项，标注为"待确认"而非跳过。

## 完成标准

用户能看到 PRD 每个关键描述与代码的对应关系和差异。
