# Security Rules

## 认证

- JWT access + refresh token（`jose` 库）
- Access token 短期有效，refresh token 长期有效
- Token 存储：客户端 secure storage，不存 localStorage
- 密码哈希：`bcryptjs`，不使用 MD5/SHA 系列
- OAuth：Google / Apple 通过 `arctic` 库

## 输入校验

- 所有外部输入（请求参数、body、query）必须经过 Zod schema 校验
- 校验在系统边界（route 层）执行，使用 `@hono/zod-validator`
- 内部函数间调用不需要重复校验
- 禁止将未校验的用户输入拼接到 SQL、命令、HTML 中

## OWASP Top 10 检查项

- **注入**：使用 Drizzle ORM 参数化查询，禁止原始 SQL 拼接
- **XSS**：前端框架（React）自动转义，禁止 `dangerouslySetInnerHTML`（除非内容已净化）
- **CSRF**：API 使用 Bearer token 认证，不依赖 cookie session
- **SSRF**：不将用户输入直接作为 URL 发起服务端请求
- **路径遍历**：不将用户输入拼接到文件路径中

## 限流

- IP 级别限流通过 `src/middleware/rate-limit.ts`
- 敏感接口（登录、注册、OTP）应有更严格的限流

## Secret 管理

- 环境变量通过 `.env`（本地）或 `wrangler secret`（生产）管理
- 禁止在代码中硬编码 secret、API key、密码
- `.env` 文件已在 `.gitignore` 中
- CI secret 通过 GitHub Actions Secrets 注入

## CORS

- CORS 配置在 API 入口，白名单指定允许的 origin
- 不使用 `Access-Control-Allow-Origin: *`（生产环境）

## 依赖安全

- 定期 `pnpm audit` 检查已知漏洞
- 不引入不活跃或未维护的依赖
- 锁文件（`pnpm-lock.yaml`）必须提交
