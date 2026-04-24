---
name: prd-to-spec
description: 将 PRD 转化为技术 Spec，设计数据模型、接口、组件、测试策略。适用于 PRD 评审通过后进入技术设计阶段。
metadata:
  priority: 7
  pathPatterns:
    - "docs/prds/**"
    - "docs/specs/**"
    - ".claude/templates/spec-template.md"
  promptSignals:
    phrases:
      - "PRD 转 spec"
      - "prd to spec"
      - "技术方案"
      - "技术设计"
      - "technical spec"
    anyOf:
      - "spec"
      - "技术"
      - "方案"
      - "设计"
    minScore: 6
---

# PRD to Spec

你帮助用户将 PRD 转化为可执行的技术 Spec。

## 输入 / 输出

- **输入**：`docs/prds/` 下的 PRD 文件；代码库现有实现。
- **输出**：技术 Spec 文档，保存到 `docs/specs/<topic>-spec.md`（kebab-case）。

## 目标

产出一份工程团队可直接执行的技术 Spec，覆盖：数据模型、接口设计、前端组件、错误处理、测试策略、文件变更清单。

## 工作方式

1. 读取 PRD，理解功能需求和验收标准。
2. 调度 `researcher` sub-agent 摸清现有实现、接口模式、数据模型。
3. 调度 `planner` sub-agent 设计技术方案。
4. 基于模板 `.claude/templates/spec-template.md` 填写 Spec。
5. 设计决策要说明理由（选择 A 而非 B，因为...）。

## 输出结构

按 `.claude/templates/spec-template.md` 格式，至少包含：

- 背景（关联 PRD）
- 技术方案概述 + 设计决策
- 数据模型（Drizzle schema 变更）
- 接口设计（endpoint + request/response 契约）
- 前端变更（组件树 + 状态管理）
- 错误处理
- 测试策略
- 文件变更清单
- 风险与待确认

## 约束

- 接口设计遵守 `.claude/rules/api.md`（信封格式、模块结构、RESTful 命名）。
- 前端设计遵守 `.claude/rules/coding.md` 和 `.claude/rules/design.md`。
- Bridge 相关变更必须列出 `.claude/rules/bridge.md` 中的 7 个文件。
- 不要设计超出 PRD 范围的内容。
- 不确定的地方标注为"待确认"，不自行补全。

## 完成标准

Spec 文件已保存到 `docs/specs/`，可直接传递给 `spec-to-tasks` 进行任务拆分。
