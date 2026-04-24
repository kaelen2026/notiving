---
name: deploy
description: 部署 Notiving 应用。支持 web（Vercel）、h5（Vercel）、api（Cloudflare Workers）三端部署，CI 通过后自动并行部署。
metadata:
  priority: 8
  pathPatterns:
    - ".github/workflows/ci.yml"
    - "apps/api/wrangler.toml"
    - "apps/h5/vercel.json"
  bashPatterns:
    - "\\bpnpm\\s+deploy"
    - "\\bwrangler\\s+deploy\\b"
    - "\\bvercel\\s+deploy\\b"
    - "\\bwrangler\\s+secret\\b"
  promptSignals:
    phrases:
      - "deploy"
      - "部署"
      - "上线"
      - "发布"
    anyOf:
      - "deploy"
      - "部署"
      - "vercel"
      - "cloudflare"
      - "workers"
    minScore: 6
---

# Deploy

帮助用户部署 Notiving 的 web、h5、api 应用。

## 部署目标

| App | 平台 | 域名 | 命令 |
|-----|------|------|------|
| web | Vercel | notiving.com | `pnpm deploy:web` |
| h5 | Vercel | h5.notiving.com | `pnpm deploy:h5` |
| api | Cloudflare Workers | api.notiving.com | `pnpm deploy:api` |

## 手动部署

```bash
# 单独部署
pnpm deploy:web
pnpm deploy:h5
pnpm deploy:api

# API 也可以在 apps/api 下直接运行
cd apps/api && pnpm run deploy
```

## CI 自动部署

工作流：`.github/workflows/ci.yml`

1. `lint-and-test` — lint、type check、test、build
2. `deploy` — 仅 main 分支 push 时触发，并行部署 web / h5 / api

### GitHub Actions Secrets

Vercel:
- `VERCEL_TOKEN` — Vercel API token
- `VERCEL_ORG_ID` — Vercel team/org ID
- `VERCEL_PROJECT_ID_WEB` — notiving-web 项目 ID
- `VERCEL_PROJECT_ID_H5` — notiving-h5 项目 ID

Cloudflare:
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token（需要 Workers 编辑权限）

### API Worker Secrets（通过 wrangler 管理）

```bash
cd apps/api
echo "<value>" | npx wrangler secret put DATABASE_URL
echo "<value>" | npx wrangler secret put JWT_SECRET
echo "<value>" | npx wrangler secret put JWT_REFRESH_SECRET
echo "<value>" | npx wrangler secret put RESEND_API_KEY
echo "<value>" | npx wrangler secret put RESEND_FROM_EMAIL
```

## 工作方式

1. 确认用户要部署哪个应用（web / h5 / api / 全部）。
2. 如果是手动部署，直接执行对应的 deploy 命令。
3. 如果是 CI 相关问题，引导用户配置 GitHub Secrets。
4. 如果需要更新 Worker secrets，使用 `wrangler secret put` 通过管道传值。

## 约束

- 每个应用只执行一次部署命令，部署成功后不要重复执行。
- 优先使用根目录的 `pnpm deploy:<app>` 命令，不要混用根目录和子目录的部署方式。
- 不要在日志或输出中暴露 secret 值。
- `wrangler secret put` 不支持直接传参，必须通过 `echo "<value>" | wrangler secret put <KEY>` 管道传入。
- Vercel 部署依赖 `VERCEL_TOKEN` 环境变量，本地部署需先 `vercel login`。
