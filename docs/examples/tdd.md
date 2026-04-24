# 测试驱动开发（TDD）

## 场景

用户说：

> 用 TDD 方式给 posts 模块加分页

背景：`apps/api/src/modules/posts/` 已有帖子列表接口 `GET /v1/posts`，当前返回全量数据，需要加分页。

## 触发的 Skill

`/tdd` — 测试先行：Red → Green → Refactor 循环。

## 完整流程

### Step 1: 澄清行为

先明确分页的具体行为：

- 参数：`page`（默认 1）、`limit`（默认 20，最大 100）
- 响应：`paginated(c, posts, { page, limit, total, totalPages })`
- 边界：page < 1 → 400、limit > 100 → 截断为 100、空结果 → 空数组

### Step 2: 规划（planner）

```
Agent(subagent_type="planner", prompt="
  规划 posts 分页的 TDD 步骤：
  1. 需要哪些测试用例（happy path + 边界 + 错误）
  2. 每个 Red-Green-Refactor 循环的范围
  3. 涉及的文件：schema、repository、service、route
  参考现有测试模式：apps/api/src/modules/ 下的 *.test.ts
")
```

### Step 3: Red → Green → Refactor 循环

#### 循环 1: 基本分页

**Red — 写失败测试**

```typescript
// apps/api/src/modules/posts/posts.service.test.ts
describe("listPosts", () => {
  it("returns paginated results with default page and limit", async () => {
    // 插入 25 条测试数据
    const result = await postsService.listPosts({});
    expect(result.data).toHaveLength(20);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(20);
    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(2);
  });
});
```

运行测试，确认失败：

```bash
pnpm --filter @notiving/api test -- posts.service.test.ts
# ❌ FAIL — listPosts 不接受分页参数
```

**Green — 最小实现**

调度 `implementer`：

```
Agent(subagent_type="implementer", prompt="
  实现 posts 分页的最小代码，让当前失败测试通过：
  1. posts.schema.ts — 添加 paginationSchema（page, limit）
  2. posts.repository.ts — listPosts 加 offset/limit 查询
  3. posts.service.ts — listPosts 加分页参数和 meta 计算
  只写让测试通过的最小代码。
")
```

运行测试，确认通过：

```bash
pnpm --filter @notiving/api test -- posts.service.test.ts
# ✅ PASS
```

**Refactor — 清理**

测试通过后，清理实现（如提取分页工具函数）。重新运行测试确认不回归。

#### 循环 2: 边界条件

**Red**

```typescript
it("returns 400 when page is less than 1", async () => {
  const res = await app.fetch(new Request("http://localhost/v1/posts?page=0"));
  expect(res.status).toBe(400);
});

it("caps limit at 100", async () => {
  const result = await postsService.listPosts({ limit: 200 });
  expect(result.meta.limit).toBe(100);
});
```

**Green** → 添加 Zod 校验和 limit 截断逻辑。

**Refactor** → 确认无重复代码。

#### 循环 3: 路由集成

**Red**

```typescript
it("GET /v1/posts returns paginated response envelope", async () => {
  const res = await app.fetch(new Request("http://localhost/v1/posts?page=2&limit=10"));
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data).toBeInstanceOf(Array);
  expect(body.meta.page).toBe(2);
});
```

**Green** → 更新 route 层调用 `paginated()` helper。

### Step 4: 验收闭环

#### 4a. 质量门禁

```bash
pnpm turbo run lint typecheck test
```

#### 4b. Reviewer 审查

```
Agent(subagent_type="reviewer", prompt="
  审查 posts 分页的 TDD 实现：
  - 测试覆盖度（happy path + 边界 + 错误）
  - 分页逻辑正确性（offset 计算、totalPages）
  - Zod schema 校验
  - ApiResponse 信封格式
")
```

#### 4c. 验收报告

```
## Acceptance
- Quality Gate: ✅ lint / ✅ typecheck / ✅ test (8 new, 0 failed)
- Review: pass — 0 blocking, 1 suggestion
- Files Changed: 5 files
- Scope: posts 模块分页（schema + repository + service + route + tests）
- Known Limitations: 无
```

## TDD 进展输出

每轮循环结束后输出：

```md
# TDD 进展

## 当前行为
GET /v1/posts 支持 page/limit 分页参数

## 测试策略
3 轮循环：基本分页 → 边界条件 → 路由集成

## Red
✅ 测试已写，确认因预期原因失败

## Green
✅ 最小实现通过

## Refactor
✅ 提取 buildPaginationMeta 工具函数

## 下一步
循环 2: 边界条件测试
```

## 涉及的 Agent / Skill / Rule

| 类型 | 名称 |
|------|------|
| Skill | `/tdd` |
| Agent | planner, implementer, reviewer |
| Rule | `testing.md`, `api.md`, `quality-gates.md` |
