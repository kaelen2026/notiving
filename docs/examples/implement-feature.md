# 功能实现（完整流程）

## 场景

用户说：

> 实现帖子点赞功能

背景：`apps/api/src/modules/posts/` 已有帖子 CRUD，需要新增点赞能力。

## 触发的 Skill

`/implement` — 完整实现流程：调研 → 规划 → 实现 → 审查。

## 完整流程

### Step 1: 调研（researcher）

主 agent 调度 `researcher` sub-agent：

```
Agent(subagent_type="researcher", prompt="
  探索与帖子点赞相关的代码现状：
  1. apps/api/src/modules/posts/ 的路由、service、repository、schema 结构
  2. apps/api/src/db/schema.ts 中 posts 表的定义
  3. 是否已有 likes 相关的表或接口
  4. apps/h5/src/ 中帖子展示组件的位置和结构
  5. 现有的认证中间件（authGuard）使用方式
  总结发现，列出关键文件路径和约束。
")
```

researcher 输出示例：

```
## 调研结果

### 现有结构
- posts 模块：route / service / repository / schema 四文件结构
- posts 表：id, userId, title, content, createdAt
- 无 likes 表或相关接口
- authGuard 中间件注入 userId 到 context

### 关键文件
- apps/api/src/modules/posts/posts.route.ts
- apps/api/src/modules/posts/posts.service.ts
- apps/api/src/db/schema.ts
- apps/h5/src/pages/PostDetail.tsx

### 约束
- 一个用户对同一帖子只能点赞一次
- 需要 authGuard 保护
- 响应格式遵循 ApiResponse 信封
```

### Step 2: 规划（planner）

主 agent 调度 `planner` sub-agent：

```
Agent(subagent_type="planner", prompt="
  基于调研结果，设计帖子点赞功能的技术方案：
  - 数据库：likes 表设计（userId + postId 联合唯一）
  - API：POST /v1/posts/:id/like、DELETE /v1/posts/:id/like
  - 前端：LikeButton 组件
  - 测试策略
  输出可执行的实现计划。
")
```

planner 输出示例：

```
## 实现计划

### 1. 数据库
- 新增 likes 表：id, userId, postId, createdAt
- userId + postId 联合唯一约束
- 外键关联 users 和 posts

### 2. API（apps/api/src/modules/likes/）
- likes.schema.ts — Zod 校验
- likes.repository.ts — 查询/插入/删除
- likes.service.ts — 业务逻辑（toggle like）
- likes.route.ts — POST /:id/like + DELETE /:id/like

### 3. 前端（apps/h5/src/）
- components/LikeButton.tsx — 点赞按钮组件
- 集成到 PostDetail 页面

### 4. 测试
- likes.service.test.ts — 点赞/取消/重复点赞
```

### Step 3: 实现（implementer）

主 agent 调度 `implementer` sub-agent：

```
Agent(subagent_type="implementer", prompt="
  按以下计划实现帖子点赞功能：
  [附上 planner 输出的完整计划]
  
  遵守规则：
  - apps/api/ 遵循 .claude/rules/api.md（模块结构、ApiResponse 信封、HTTPException）
  - apps/h5/ 遵循 .claude/rules/coding.md（Tailwind 语义色、函数式组件）
  - 测试遵循 .claude/rules/testing.md（真实 DB、app.fetch 集成测试）
")
```

implementer 执行代码改动，产出文件列表。

### Step 4: 验收闭环

#### 4a. 质量门禁

```bash
pnpm turbo run lint typecheck test
```

#### 4b. Reviewer 审查

```
Agent(subagent_type="reviewer", prompt="
  审查帖子点赞功能的实现改动。审查维度：
  1. 正确性 — 逻辑、类型安全、边界条件
  2. 规范性 — coding.md、api.md、design.md
  3. 安全性 — authGuard、输入校验、SQL 注入
  4. 完整性 — 前后端覆盖、测试覆盖
  5. 质量门禁 — lint/typecheck/test 结果
  输出 Verdict + Issues + Checks。
")
```

#### 4c. 验收报告

```
## Acceptance
- Quality Gate: ✅ lint / ✅ typecheck / ✅ test
- Review: pass — 0 blocking, 2 suggestions
- Files Changed: 8 files
- Scope: 新增 likes 模块（API + 前端 LikeButton）
- Known Limitations: 未验证前端 UI 交互（需浏览器测试）
```

## 涉及的 Agent / Skill / Rule

| 类型 | 名称 |
|------|------|
| Skill | `/implement` |
| Agent | researcher, planner, implementer, reviewer |
| Rule | `api.md`, `coding.md`, `design.md`, `testing.md`, `security.md`, `quality-gates.md` |
| Template | `task-template.md` |
