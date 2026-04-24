# API Coding Rules

## 框架与运行时

- Hono 框架，双运行时：Node.js（`@hono/node-server`）+ Cloudflare Workers
- ORM：Drizzle + `@neondatabase/serverless`（Neon Postgres）
- 校验：Zod schemas + `@hono/zod-validator`
- 认证：JWT（`jose`）+ bcryptjs + OAuth（`arctic`）
- 邮件：Resend
- Linter：Biome（tabs 缩进）

## 模块结构

每个业务域一个目录，内含四个文件：

```
src/modules/{domain}/
├── {domain}.route.ts       # 路由定义 + 请求校验
├── {domain}.service.ts     # 业务逻辑
├── {domain}.repository.ts  # 数据库操作
└── {domain}.schema.ts      # Zod schemas
```

- Route 只做路由绑定、参数校验、调用 service、返回响应
- Service 包含业务逻辑，调用 repository
- Repository 封装 Drizzle 查询，不含业务逻辑
- Schema 定义请求/响应的 Zod 类型，可共享到 `@notiving/shared/schemas`

## 响应格式

统一使用 `ApiResponse<T>` 信封，通过 `src/lib/api-response.ts` 的 helper：

- `ok(c, data)` — 200
- `created(c, data)` — 201
- `paginated(c, data, meta)` — 200 + 分页
- `fail(c, message, status)` — 4xx/5xx
- `notFound(c, message)` — 404
- `forbidden(c)` — 403
- `conflict(c, message)` — 409

禁止直接 `c.json()` 返回非信封格式。

## 错误处理

- 业务错误抛 Hono `HTTPException`，由全局 `errorHandler` 捕获
- `errorHandler`（`src/middleware/error-handler.ts`）统一返回信封格式，500 错误记录结构化日志
- 不要在 route 中 try/catch 后手动返回错误 — 让 `HTTPException` 冒泡

## 中间件

中间件位于 `src/middleware/`：

- `authGuard` — Bearer JWT 验证，注入 `userId`
- `registeredGuard` — 验证用户已完成注册
- `tryExtractUserId` — 可选提取，不强制
- `rateLimiter` — IP 级别限流
- `requestId` / `requestLogger` / `deviceType` — 请求追踪

新增中间件放在 `src/middleware/`，通过 `createMiddleware` 创建。

## 路由

- API 版本前缀：`/api/v1/`
- RESTful 命名：名词复数（`/posts`、`/users`）
- 路由参数用 `:id` 格式

## 数据库

- Schema 定义在 `src/db/schema.ts`
- 迁移通过 `drizzle-kit`
- 查询使用 Drizzle query builder，不写原始 SQL
- 时间字段统一 `timestamp` with timezone，默认 `now()`
