# Agents Directory

执行角色定义。每个 agent 有明确的职责边界和工作方式。

## 角色

| agent | 职责 | 典型场景 |
|-------|------|---------|
| `planner` | 梳理需求、拆解步骤、输出方案 | 方案设计、任务拆分 |
| `researcher` | 调研代码库、收集信息、总结现状 | 实现前调研、风险评估 |
| `implementer` | 按计划执行代码改动 | 方案已定后的落地实现 |
| `reviewer` | 审查变更、识别问题、输出结论 | code review、质量检查 |

## 协作模式

```
researcher -> planner -> implementer -> reviewer
```

可以从任意角色开始，按需组合。但主 agent **必须**主动调度这些 sub-agent，而不是自己包揽所有工作。详见 `CLAUDE.md` 中的 "Sub-Agent 协作规范"。

### 各 command 应该调度哪些 agent

此表是 command-agent 调度的唯一真实来源。`CLAUDE.md` 只定义调度原则。

| command | 调研 (researcher) | 规划 (planner) | 实现 (implementer) | 审查 (reviewer) |
|---------|-------------------|----------------|-------------------|-----------------|
| `write-a-prd` | **必须** — 探索代码库现状 | **推荐** — 梳理模块边界 | — | — |
| `prd-check` | **必须** — 验证 PRD 与代码一致性 | — | — | — |
| `prd-to-spec` | **必须** — 摸清现有实现 | **必须** — 设计技术方案 | — | — |
| `api-design` | **必须** — 调研现有接口模式 | **必须** — 设计接口契约 | — | — |
| `component-design` | **必须** — 摸清现有组件模式 | **必须** — 设计组件树和 props 契约 | — | — |
| `spec-to-tasks` | **推荐** — 确认复用点和约束 | **必须** — 拆分任务 | — | — |
| `tasks-to-issues` | — | **推荐** — 确认依赖顺序 | — | — |
| `tdd` | **推荐** — 了解现有测试模式 | **必须** — 规划测试和实现步骤 | **必须** — 执行代码 | **必须** — 审查实现 |
| `code-review` | — | — | — | **必须** — 执行审查 |
| `quality-gate` | **推荐** — 收集检查依据 | — | — | **必须** — 执行检查 |
| `implement` | **必须** — 调研相关代码 | **推荐** — 非平凡任务确认方案 | **必须** — 执行代码改动 | **必须** — 审查实现 |
| `ship` | — | — | — | **必须** — 自检 checklist |
| `bug-fix` | **必须** — 定位相关代码 | — | **必须** — 实现修复 | **必须** — 审查修复 |

### idea-to-issues 与 sub-agent 调度

`idea-to-issues` 是总控编排器，内部串联多个 skill。执行时**仍需按上表调度 sub-agent**：每进入一个阶段（如 `prd-to-spec`），按该 command 对应的行来决定调度哪些 agent。`idea-to-issues` 本身不替代 agent 调度。

### 调度示例

**完整的 PRD → 实现流程**：

```
# 1. 写 PRD 前，先调研
Agent(subagent_type="researcher", prompt="探索代码库，总结与 X 功能相关的现状...")

# 2. 基于调研结果写 PRD（主 agent 或 planner）
/write-a-prd

# 3. PRD → Spec 前，再次调研技术细节
Agent(subagent_type="researcher", prompt="确认 X 模块的接口、数据流和约束...")
Agent(subagent_type="planner", prompt="基于调研结果设计技术方案...")

# 4. Spec → Tasks
Agent(subagent_type="planner", prompt="将 Spec 拆分为垂直切片任务...")

# 5. 实现每个任务
Agent(subagent_type="implementer", prompt="按以下计划实现 T1: ...")

# 6. 每个任务完成后审查
Agent(subagent_type="reviewer", prompt="审查 T1 的改动...")
```

**简单的 Bug 修复**：

```
# 调研 + 实现可以合并，但审查不能跳过
Agent(subagent_type="researcher", prompt="定位 bug 相关代码...")
Agent(subagent_type="implementer", prompt="修复 bug: ...")
Agent(subagent_type="reviewer", prompt="审查修复改动...")
```

## 与 skills / commands / rules 的关系

- agent 可以调用任意 skill 来完成工作
- agent 的行为受 `rules/` 约束
- `commands/` 中会建议把工作交给合适的 agent
- 主 agent 的调度规范定义在 `CLAUDE.md`

## 维护约定

- 每个 agent 只维护一个角色职责。
- agent 不重复定义 skill 的产出结构。
- agent 不重复定义 rules 中的约束。
- 新增 agent 时，同步更新本 README 和 `CLAUDE.md` 中的调度规范。
