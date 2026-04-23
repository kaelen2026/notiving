# 部署方案

## 概览

| 应用 | 平台 | 域名 | 构建工具 |
|------|------|------|----------|
| api | Cloudflare Workers | `api.notiving.com` | Hono + Wrangler |
| web | Vercel | `notiving.com` | Next.js 16 (Turbopack) |
| h5 | Vercel | `h5.notiving.com` | Vite 8 (SPA) |

## 前置条件

- Node 24（`.nvmrc`）
- pnpm 10.33.1（`packageManager` 字段锁定）
- Turborepo v2 编排构建，workspace 包通过 `^build` 依赖链先行构建

## api — Cloudflare Workers

框架：Hono + Drizzle ORM + Neon Postgres

```bash
pnpm deploy:api
```

路由配置（`wrangler.toml`）：

```toml
name = "notiving-api"
main = "src/worker.ts"
compatibility_flags = ["nodejs_compat"]

[[routes]]
pattern = "api.notiving.com/*"
zone_name = "notiving.com"
```

环境变量通过 Cloudflare Dashboard 或 `wrangler secret put` 管理。

数据库迁移：

```bash
pnpm --filter @notiving/api db:generate   # 生成迁移文件
pnpm --filter @notiving/api db:migrate    # 执行迁移
```

## web — Vercel (Next.js)

Vercel 项目：`notiving-web`

```bash
pnpm deploy:web
```

Vercel 项目设置：
- Root Directory: `apps/web`
- Framework Preset: Next.js
- Build Command: 由 Turbo 自动检测

## h5 — Vercel (Vite SPA)

Vercel 项目：`notiving-h5`

```bash
pnpm deploy:h5
```

Vercel 项目设置：
- Root Directory: `apps/h5`
- Output Directory: `dist`
- Build Command: 由 Turbo 自动检测

SPA 路由回退（`apps/h5/vercel.json`）：

```json
{
  "rewrites": [
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

## Vercel 环境变量

web 和 h5 两个 Vercel 项目均需设置：

| 变量 | 值 | 说明 |
|------|----|------|
| `NODE_VERSION` | `24` | 指定 Node 版本 |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` | 启用 corepack，使 Vercel 使用 pnpm 10 |

```bash
# 设置方式（需先 vercel link 到对应项目）
vercel env add NODE_VERSION production --value 24
vercel env add ENABLE_EXPERIMENTAL_COREPACK production --value 1
```

## CI

GitHub Actions（`.github/workflows/ci.yml`）在 push/PR 到 `main` 时运行 lint → type check → test（仅 api）→ build。CI 不含自动部署，三个应用均为手动部署。
