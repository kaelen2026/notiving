---
name: tdd
description: 按测试先行方式推进需求实现，遵循 Red → Green → Refactor 循环。适用于新增功能、修复 bug 等需要用测试驱动实现的场景。
metadata:
  priority: 7
  pathPatterns:
    - "apps/api/src/**"
    - "apps/api/src/**/*.test.*"
    - "packages/shared/src/**"
  bashPatterns:
    - "\\bpnpm\\s+test\\b"
    - "\\bvitest\\b"
  promptSignals:
    phrases:
      - "tdd"
      - "测试先行"
      - "先写测试"
      - "test driven"
      - "red green refactor"
    anyOf:
      - "测试"
      - "test"
      - "TDD"
      - "先写"
    minScore: 6
---

# TDD

你是这个仓库的测试先行执行者，按 TDD 方式推进需求实现。

## 输入 / 输出

- **输入**：用户对话中的需求描述或 `docs/tasks/` 下的任务文件；代码库现有测试模式（`apps/api/`）。
- **输出**：测试文件 + 实现代码改动（就地修改代码库）；inline 进展报告（`TDD 进展`）。不产出独立文档。

## 目标

先定义行为，再写失败测试，再实现最小代码让测试通过，最后视需要重构。

## 工作方式

1. 先把需求翻译成可验证行为，再进入测试编写。
2. 遵循最小闭环：`Red -> Green -> Refactor`。
3. 一次只推进一个明确行为。
4. 先写会失败的测试，确认测试真的能捕获问题。
5. 实现阶段只写让当前测试通过所需的最小代码。
6. 重构只在测试通过后进行，且不能改变行为。

## 执行循环

### 1. 澄清行为
- 明确目标行为的输入、输出、边界、异常路径
- 如果需求不清，先补关键澄清问题

### 2. Red（写失败测试）
- 定位最合适的测试层级：unit / integration / e2e
- 编写最小失败测试，准确表达目标行为
- 运行测试，确认因预期原因失败

### 3. Green（最小实现）
- 只修改完成当前行为所需的代码
- 再次运行测试，确认通过

### 4. Refactor（重构）
- 在测试通过后清理实现
- 重构后重新运行测试

### 5. 扩展下一个行为
- 重复同样循环

## 输出结构

```md
# TDD 进展

## 当前行为
## 测试策略
## Red
## Green
## Refactor
## 下一步
```

## 约束

- 优先复用仓库已有测试框架和模式（Vitest + `app.fetch()` 集成测试）。
- 不要先写实现再倒推测试。
- 不要一次写多个尚未实现的大测试集合。
- 受 `.claude/rules/testing.md` 约束。

## 完成标准

每轮 TDD 循环结束后，用户能看到当前行为的测试状态和下一步方向。
