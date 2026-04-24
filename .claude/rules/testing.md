# Testing Rules

## 框架

- API 测试使用 Vitest（`vitest.config.ts` 在 `apps/api/`）
- 运行环境：Node.js，`pool: "forks"`，`singleFork: true`
- 覆盖率：V8 provider
- 其他端暂无测试框架（RN、Flutter、HarmonyOS 待补充）

## 文件组织

- 测试文件与源文件同目录，命名 `*.test.ts`
- Setup 文件：`src/test/setup.ts`，在 `beforeAll` 中初始化环境变量并调用 `initEnv()`
- 不使用独立的 `__tests__/` 目录

## 测试模式

### Service 测试

- 直接 import service 函数，使用真实数据库（Neon Postgres）
- `beforeEach` 中清表：`await db.delete(schema.tableName)`
- 按依赖顺序清表（先子表后父表）

### 集成测试

- 通过 `createApp()` 创建 Hono 实例
- 使用 `app.fetch(new Request(url, options))` 发请求，不依赖 supertest
- 验证 `ApiResponse` 信封结构：`{ success, data?, error? }`

### 断言

- 正向：`expect(result).toEqual(...)` / `expect(response.status).toBe(200)`
- 异常：`expect(() => fn()).rejects.toThrow()`
- 使用 `describe` 按功能分组，覆盖 happy path + error cases

## 规范

- 测试行为，不测试实现细节
- 不 mock 数据库 — 使用真实 DB 连接
- 不 mock 内部 service — 只在外部依赖边界 mock（如第三方 API）
- 每个测试独立，不依赖其他测试的执行顺序或副作用
- 测试命名描述行为：`"returns 401 when token is missing"`，不用 `"test1"`

## 运行

```bash
# API 测试
pnpm --filter @notiving/api test

# 全量（turbo 会跳过无测试的包）
pnpm turbo run test
```
