---
name: api-design
description: 通过用户需求澄清、代码库探索与接口契约设计来产出 API 设计文档。适用于在接口需求尚不完整或需要明确 request/response、错误语义、鉴权、分页、幂等与版本策略的场景。
metadata:
  priority: 7
  pathPatterns:
    - ".claude/skills/api-design/**"
    - "docs/apis/**"
    - "docs/specs/**"
    - "docs/prds/**"
    - "docs/product/**"
    - "specs/**"
    - "requirements/**"
    - "code/src/**"
  bashPatterns:
    - "\\bgh\\s+issue\\s+create\\b"
    - "\\bgh\\s+issue\\s+view\\b"
    - "\\bgh\\s+label\\s+list\\b"
  promptSignals:
    phrases:
      - "api design"
      - "设计api"
      - "接口设计"
      - "api contract"
      - "request response"
      - "endpoint design"
    anyOf:
      - "api"
      - "接口"
      - "鉴权"
      - "错误码"
      - "分页"
    minScore: 6
---

# API Design

你要帮助用户把需求整理成结构化、可执行的 API 设计文档。

## 目标

产出一份适合工程实现与评审的 API spec，至少覆盖：
- 问题定义与设计目标
- 接口范围与非目标
- endpoint 列表与职责
- request / response 契约
- 鉴权与权限边界
- 错误语义与状态码
- 分页、筛选、排序、幂等等规则
- 风险、依赖与未决问题

## 输入 / 输出

- **输入**：`docs/specs/` 下的技术 Spec 或用户需求描述；可选读取代码库现有接口（`code/src/`）作为背景。
- **输出**：API 设计文档，保存到 `docs/apis/<topic>-api.md`（kebab-case）。

## 工作方式

1. 先理解用户要解决的业务问题，不要一上来假设 endpoint。
2. 如果需求、字段、权限、错误语义、分页方式或调用方不明确，必须先向用户提 3-6 个关键澄清问题。
3. 如需结合现有系统，先阅读代码，再总结当前接口风格、命名方式与约束。
4. 把产品需求映射成 API 设计：资源、动作、边界、输入输出、失败语义。
5. 只写与当前需求直接相关的内容，不扩展到无关接口。
6. API 文档要具体、可验证，避免"后端自行处理""前端按需适配"这类空泛表述。

## 推荐输出结构

```md
# <功能名> API Spec

## 背景
## 问题陈述
## 目标
## 非目标
## 调用方与使用场景
## Endpoint 设计
## Request 契约
## Response 契约
## 鉴权与权限
## 错误语义
## 分页 / 筛选 / 排序 / 幂等
## 验证方式
## 风险与依赖
## 未决问题
```

## 约束

- 不要假设不存在的业务规则。
- 不要凭空指定数据库表、外部服务能力或字段含义；如需这些内容，必须基于代码或用户输入。
- 如果用户要求提交为 GitHub issue，再在 API 设计定稿后建议使用 `gh issue create`。
- 若仓库中已经存在相关 PRD/spec/API/issue/文档，先读取并避免重复。
- **凡是不确定的地方，先问用户，不要自行补全。**

## 完成标准

当用户未指定格式时，默认输出 markdown API 草稿。
当用户指定要落到文件中时，保存到 `docs/apis/`；若目录不存在则创建该目录。
