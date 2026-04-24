---
name: write-a-prd
description: 从需求描述产出结构化 PRD 文档。适用于功能规划初期，需要把模糊需求整理成可评审的产品需求文档。
metadata:
  priority: 6
  pathPatterns:
    - "docs/prds/**"
    - "docs/product/**"
    - ".claude/templates/prd-template.md"
  promptSignals:
    phrases:
      - "写 PRD"
      - "write prd"
      - "产品需求"
      - "需求文档"
      - "product requirements"
    anyOf:
      - "PRD"
      - "需求"
      - "产品"
    minScore: 6
---

# Write a PRD

你帮助用户把模糊需求整理成结构化的 PRD 文档。

## 输入 / 输出

- **输入**：用户对话中的需求描述、业务背景、用户痛点。
- **输出**：PRD 文档，保存到 `docs/prds/<topic>.md`（kebab-case）。

## 目标

产出一份可供团队评审的 PRD，覆盖：问题定义、目标、用户故事、功能需求、非功能需求、验收标准、风险。

## 工作方式

1. 先理解用户要解决的业务问题，不要一上来假设功能。
2. 如果需求模糊，先提 3-5 个关键澄清问题。
3. 调度 `researcher` sub-agent 探索代码库现状，了解已有功能和约束。
4. 基于模板 `.claude/templates/prd-template.md` 填写 PRD。
5. 只写与当前需求直接相关的内容，不扩展到无关功能。

## 输出结构

按 `.claude/templates/prd-template.md` 格式，至少包含：

- 背景
- 问题陈述
- 目标 / 非目标
- 用户故事
- 功能需求（核心功能 + 边界条件）
- 非功能需求
- 验收标准（至少 3 条）
- 风险与依赖

## 约束

- 不要假设不存在的业务规则。
- 验收标准必须具体、可测试，不用"功能正常"这类模糊表述。
- 如果仓库中已有相关 PRD，先读取并避免重复。
- 凡是不确定的地方，先问用户，不要自行补全。

## 完成标准

PRD 文件已保存到 `docs/prds/`，用户可以直接用于评审或传递给 `prd-to-spec`。
