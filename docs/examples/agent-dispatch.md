# Agent 调度参考

速查表，不是场景示例。汇总 agent 职责、调度规则和验收闭环。

## 4 个 Agent

| Agent | 职责 | 修改代码 | 调用方式 |
|-------|------|---------|---------|
| `researcher` | 探索代码库、收集信息、总结现状 | 否 | `Agent(subagent_type="researcher", prompt="...")` |
| `planner` | 梳理需求、设计方案、拆解步骤 | 否 | `Agent(subagent_type="planner", prompt="...")` |
| `implementer` | 按计划执行代码改动 | 是 | `Agent(subagent_type="implementer", prompt="...")` |
| `reviewer` | 审查变更、识别问题、输出结论 | 否 | `Agent(subagent_type="reviewer", prompt="...")` |

## Skill → Agent 调度表

来源：`agents/README.md`，这是唯一真实来源。

| Skill | researcher | planner | implementer | reviewer |
|-------|-----------|---------|-------------|---------|
| `/write-a-prd` | **必须** | 推荐 | — | — |
| `/prd-check` | **必须** | — | — | — |
| `/prd-to-spec` | **必须** | **必须** | — | — |
| `/api-design` | **必须** | **必须** | — | — |
| `/component-design` | **必须** | **必须** | — | — |
| `/spec-to-tasks` | 推荐 | **必须** | — | — |
| `/tasks-to-issues` | — | 推荐 | — | — |
| `/tdd` | 推荐 | **必须** | **必须** | **必须** |
| `/code-review` | — | — | — | **必须** |
| `/quality-gate` | 推荐 | — | — | **必须** |
| `/implement` | **必须** | 推荐 | **必须** | **必须** |
| `/ship` | — | — | — | **必须** |
| `/bug-fix` | **必须** | — | **必须** | **必须** |

**必须** = 不可跳过，推荐 = 视复杂度决定，— = 不涉及。

## 正确 vs 错误的调度

### ❌ 错误：主 agent 包揽所有工作

```
用户: 实现帖子点赞功能

主 agent 直接开始写代码...
主 agent 自己 review 自己的代码...
主 agent: "完成了"
```

问题：
- 没有调度 researcher 调研现状
- 没有调度 planner 确认方案
- 没有调度 reviewer 独立审查
- 没有验收闭环

### ✅ 正确：按调度表调度 sub-agent

```
用户: 实现帖子点赞功能

→ 触发 /implement skill
→ 调度 researcher: 调研 posts 模块现状
→ 调度 planner: 设计 likes 方案
→ 调度 implementer: 执行代码改动
→ 运行 quality-gate
→ 调度 reviewer: 审查改动
→ 输出验收报告
```

### ❌ 错误：用内置通用 agent 替代自定义 agent

```
Agent(subagent_type="Explore", prompt="调研代码...")     # ❌ 应该用 researcher
Agent(subagent_type="Plan", prompt="设计方案...")         # ❌ 应该用 planner
Agent(subagent_type="general-purpose", prompt="写代码...") # ❌ 应该用 implementer
```

### ✅ 正确：使用项目自定义 agent

```
Agent(subagent_type="researcher", prompt="调研代码...")
Agent(subagent_type="planner", prompt="设计方案...")
Agent(subagent_type="implementer", prompt="按计划实现...")
Agent(subagent_type="reviewer", prompt="审查改动...")
```

## 验收闭环（3 步）

所有包含 reviewer **必须** 的 skill，完成后必须走验收闭环：

```
implementer 完成
    ↓
Step 1: 质量门禁（自动化）
    pnpm turbo run lint typecheck test
    + 条件触发原生编译检查
    ↓
Step 2: Reviewer 审查（结构化）
    Verdict: pass | fail
    Issues: 🔴 阻塞 / 🟡 建议
    Checks: 正确性 / 规范性 / 安全性 / 完整性 / 质量门禁
    ↓
    如果 fail → 回到 implementer 修复 → 重新审查
    ↓
Step 3: 验收报告（输出给用户）
    Quality Gate: ✅/❌
    Review: pass/fail
    Files Changed: N
    Scope: 一句话
    Known Limitations: 诚实列出
```

**关键约束**：
- 3 步不可跳过、不可合并
- "编译通过" ≠ "验收通过"
- reviewer 输出 fail 时，必须回到 implementer 修复后重新审查
- Known Limitations 必须诚实（如：无法启动模拟器、无法端到端测试 OAuth）

## 相关文档

- `CLAUDE.md` — Sub-Agent 调度规范 + 验收闭环定义
- `.claude/agents/README.md` — 调度表唯一真实来源
- `.claude/rules/quality-gates.md` — 质量门禁标准
