---
name: component-design
description: 设计前端组件树、props 契约和状态流。适用于新增页面或复杂交互组件前的设计阶段。
metadata:
  priority: 6
  pathPatterns:
    - "apps/h5/src/components/**"
    - "apps/h5/src/pages/**"
    - "apps/web/src/components/**"
    - "apps/web/src/app/**"
    - "apps/rn/src/components/**"
  promptSignals:
    phrases:
      - "组件设计"
      - "component design"
      - "设计组件"
      - "组件树"
      - "props 设计"
    anyOf:
      - "组件"
      - "component"
      - "props"
      - "UI"
    minScore: 6
---

# Component Design

你帮助用户设计前端组件树、props 契约和状态流。

## 输入 / 输出

- **输入**：`docs/specs/` 下的技术 Spec 中的前端部分，或用户描述的 UI 需求。
- **输出**：组件设计文档，保存到 `docs/specs/<topic>-components.md`（kebab-case）。

## 目标

产出一份前端工程师可直接实现的组件设计，覆盖：组件树、props 类型、状态管理、数据流、交互行为。

## 工作方式

1. 理解 UI 需求和交互行为。
2. 调度 `researcher` sub-agent 摸清现有组件模式和复用机会。
3. 设计组件树，从页面级拆到原子组件。
4. 定义每个组件的 props 类型（TypeScript interface）。
5. 设计状态管理方案（useQuery / useState / context）。

## 输出结构

```md
# 组件设计: <功能名>

## 组件树
<ASCII 树形图>

## 组件清单

### <ComponentName>
- 职责：
- Props：
  ```typescript
  interface ComponentNameProps { ... }
  ```
- 状态：
- 数据源：
- 交互行为：

## 状态流
<数据流向说明>

## 复用分析
- 可复用现有组件：[列表]
- 需新建组件：[列表]

## 样式规范
- 遵守 `.claude/rules/design.md` 语义色
- 响应式断点：[如适用]
```

## 约束

- 遵守 `.claude/rules/coding.md`（组件 < 200 行、函数式组件、Tailwind 语义类）。
- 遵守 `.claude/rules/design.md`（语义色、间距、圆角）。
- 优先复用现有组件，不重复造轮子。
- 不设计超出需求范围的组件。

## 完成标准

组件设计文档已保存，可直接用于实现阶段。
