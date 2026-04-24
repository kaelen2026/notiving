# 使用示例

演示 skill、agent、rule 的组合使用方式。每个示例基于真实场景，展示完整工作流。

## 示例索引

| 示例 | 场景 | 触发 Skill | 涉及 Agent |
|------|------|-----------|-----------|
| [功能实现](implement-feature.md) | "实现帖子点赞功能" | `/implement` | researcher → planner → implementer → reviewer |
| [Bug 修复](bug-fix.md) | "登录接口返回 500" | `/bug-fix` | researcher → implementer → reviewer |
| [从想法到 Issues](idea-to-issues.md) | "我想加一个通知系统" | `/idea-to-issues` | researcher → planner（多阶段串联） |
| [测试驱动开发](tdd.md) | "用 TDD 给 posts 加分页" | `/tdd` | planner → implementer → reviewer |
| [审查 + 提交 PR](code-review-and-ship.md) | "review 一下，没问题就提 PR" | `/code-review` → `/ship` | reviewer |
| [Agent 调度参考](agent-dispatch.md) | 速查表 | — | 全部 |

## 统一结构

每个示例遵循相同结构：场景 → 触发的 Skill → 完整流程（含 agent 调度） → 验收闭环 → 涉及的 Agent / Skill / Rule。

## 相关文档

- [CLAUDE.md](../../CLAUDE.md) — Sub-Agent 调度规范 + 验收闭环
- [agents/README.md](../../.claude/agents/README.md) — command-agent 调度表
- [rules/quality-gates.md](../../.claude/rules/quality-gates.md) — 质量门禁标准
