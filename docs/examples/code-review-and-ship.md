# 审查 + 提交 PR

## 场景

用户说：

> 帮我 review 一下，没问题就提 PR

背景：用户在 `feat/post-likes` 分支上完成了帖子点赞功能的开发，想先审查再提交。

## 触发的 Skill

`/code-review` → `/ship`，两个 skill 串联。

## 完整流程

### Step 1: Code Review（`/code-review`）

#### 1a. 获取 diff

```bash
git diff main...HEAD
```

#### 1b. 调度 reviewer

```
Agent(subagent_type="reviewer", prompt="
  审查 feat/post-likes 分支相对于 main 的所有改动。
  
  审查维度：
  1. 正确性 — 逻辑、类型安全、边界条件
  2. 规范性 — coding.md、api.md、design.md
  3. 安全性 — OWASP Top 10、security.md
  4. 完整性 — 前后端覆盖、测试覆盖、Bridge 同步
  5. 质量门禁 — lint/typecheck/test 结果
  
  只审查 diff 中的变更。区分 🔴 阻塞和 🟡 建议。
")
```

#### 1c. 审查输出

```md
# Code Review

## Verdict: fail

## Issues
- 🔴 [阻塞] likes.route.ts:15 — DELETE 路由缺少 authGuard 中间件
- 🟡 [建议] likes.service.ts:28 — toggleLike 可以用 upsert 替代 select+insert
- 🟡 [建议] LikeButton.tsx:12 — 缺少 loading 状态的 disabled 处理

## Checks
- [x] 正确性
- [x] 规范性
- [ ] 安全性 — DELETE 路由未鉴权
- [x] 完整性
- [x] 质量门禁

## Summary
DELETE /v1/posts/:id/like 缺少 authGuard，任何人可以取消他人的点赞。修复后可通过。
```

### Step 2: 修复阻塞问题

Verdict 为 fail，必须修复后重新审查：

```
Agent(subagent_type="implementer", prompt="
  修复 code review 发现的阻塞问题：
  - likes.route.ts:15 — DELETE 路由添加 authGuard 中间件
")
```

修复后重新调度 reviewer 确认：

```
Agent(subagent_type="reviewer", prompt="
  重新审查修复后的改动，确认 DELETE 路由已添加 authGuard。
")
```

```
Verdict: pass — 0 blocking, 2 suggestions
```

### Step 3: Ship（`/ship`）

审查通过后，进入 `/ship` 流程。

#### 3a. 自检

```bash
# 质量门禁
pnpm turbo run lint typecheck test build
```

#### 3b. Commit

```bash
git add apps/api/src/modules/likes/ apps/h5/src/components/LikeButton.tsx
git commit -m "feat(api,h5): add post like feature"
```

#### 3c. Push + PR

```bash
git push -u origin feat/post-likes

gh pr create \
  --title "feat(api,h5): add post like feature" \
  --body "## Summary
- 新增 likes 模块（API CRUD + 前端 LikeButton）
- 支持点赞/取消点赞，一个用户对同一帖子只能点赞一次

## Test Plan
- [x] likes.service.test.ts — 点赞/取消/重复点赞
- [x] 集成测试 — API 端点 200/401/409
- [ ] 手动验证 — 前端 LikeButton 交互"
```

#### 3d. Ship Report

```md
# Ship Report

## Self-Check
- Review: pass
- Quality Gate: pass

## Commit
- Message: feat(api,h5): add post like feature
- Files: 8

## PR
- URL: https://github.com/kaelen/notiving/pull/42
- Title: feat(api,h5): add post like feature
- Base: main
```

## 关键点

- `/code-review` 的 Verdict 为 fail 时，**不能跳到 `/ship`**，必须先修复再重新审查
- `/ship` 内部也会调度 reviewer 做自检，这是双重保障
- Commit message 遵循 Conventional Commits，scope 使用项目约定（`api`, `h5`）
- 不使用 `--no-verify` 跳过 pre-commit hooks

## 涉及的 Agent / Skill / Rule

| 类型 | 名称 |
|------|------|
| Skill | `/code-review`, `/ship` |
| Agent | reviewer, implementer（修复阻塞时） |
| Rule | `quality-gates.md`, `coding.md`, `security.md` |
