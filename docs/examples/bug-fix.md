# Bug 修复

## 场景

用户说：

> 登录接口返回 500，日志显示 token 解析失败

背景：`apps/api/src/modules/auth/` 处理登录和 JWT 签发，线上用户报告登录失败。

## 触发的 Skill

`/bug-fix` — 系统化修复流程：定位 → 分析 → 修复 → 验证 → 审查。

## 完整流程

### Step 1: 定位（researcher）

```
Agent(subagent_type="researcher", prompt="
  定位登录接口 500 错误的相关代码：
  1. apps/api/src/modules/auth/ 的路由和 service
  2. JWT 签发和验证逻辑（jose 库的使用方式）
  3. 错误处理中间件 src/middleware/error-handler.ts
  4. 环境变量中 JWT_SECRET 的加载方式（src/lib/env.ts）
  总结可能的故障点。
")
```

researcher 输出示例：

```
## 调研结果

### 关键文件
- apps/api/src/modules/auth/auth.service.ts — signToken() 函数
- apps/api/src/middleware/auth-guard.ts — verifyToken() 函数
- apps/api/src/lib/env.ts — JWT_SECRET 环境变量

### 发现
- signToken() 使用 new TextEncoder().encode(env.JWT_SECRET) 编码密钥
- verifyToken() 也使用相同方式，但在 Cloudflare Workers 环境下
  env.JWT_SECRET 可能从 wrangler secret 读取，格式与本地 .env 不同
- error-handler.ts 对 JWTVerifyError 没有特殊处理，统一返回 500
```

### Step 2: 分析根因

基于 researcher 的发现，主 agent 分析：

- 根因：`verifyToken()` 在 Workers 环境下读取的 `JWT_SECRET` 包含尾部换行符，导致密钥不匹配
- 影响范围：所有需要 JWT 验证的接口（authGuard 保护的路由）
- 不是表面症状（500 错误），而是密钥编码问题

### Step 3: 修复（implementer）

```
Agent(subagent_type="implementer", prompt="
  修复 JWT token 解析失败的 bug：
  
  根因：JWT_SECRET 环境变量可能包含尾部空白字符。
  
  修复方案：
  1. 在 src/lib/env.ts 中对 JWT_SECRET 做 .trim()
  2. 在 auth-guard.ts 中对 JWTVerifyError 返回 401 而非 500
  
  约束：
  - 最小修复，不重构周边代码
  - 遵守 .claude/rules/security.md
")
```

### Step 4: 验证

```bash
# 运行 auth 相关测试
pnpm --filter @notiving/api test

# 全量质量门禁
pnpm turbo run lint typecheck test
```

### Step 5: 验收闭环

#### 5a. Reviewer 审查

```
Agent(subagent_type="reviewer", prompt="
  审查 JWT token 解析 bug 的修复改动：
  - src/lib/env.ts — JWT_SECRET trim
  - src/middleware/auth-guard.ts — JWTVerifyError 处理
  审查维度：正确性、安全性、完整性。
  确认修复是否充分，是否引入新问题。
")
```

#### 5b. 验收报告

```
## Acceptance
- Quality Gate: ✅ lint / ✅ typecheck / ✅ test (12 passed)
- Review: pass — 0 blocking, 1 suggestion（建议补充 JWT 错误的结构化日志）
- Files Changed: 2 files
- Scope: 修复 JWT_SECRET 尾部空白导致的 token 验证失败
- Known Limitations: 需要在 Workers 环境验证（本地测试使用 .env，无法完全模拟 wrangler secret 行为）
```

## Bug Fix Report 输出

```md
# Bug Fix Report

## Bug
- 描述: 登录接口返回 500，token 解析失败
- 根因: JWT_SECRET 环境变量包含尾部换行符，导致签发和验证使用不同密钥
- 影响范围: 所有 authGuard 保护的接口

## Fix
### Files Changed
- src/lib/env.ts: JWT_SECRET 加载时 trim()
- src/middleware/auth-guard.ts: JWTVerifyError 返回 401

### What Changed
1. 环境变量加载时清除空白字符
2. JWT 验证错误返回 401 而非 500

## Verification
- 回归测试: ✅ 已有 auth 测试覆盖
- 相关测试: ✅ 12 passed
- 质量门禁: ✅

## Review
- Verdict: pass

## Status: fixed
```

## 涉及的 Agent / Skill / Rule

| 类型 | 名称 |
|------|------|
| Skill | `/bug-fix` |
| Agent | researcher, implementer, reviewer |
| Rule | `api.md`, `security.md`, `testing.md`, `quality-gates.md` |
