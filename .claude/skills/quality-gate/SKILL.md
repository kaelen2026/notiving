---
name: quality-gate
description: 运行全套质量门禁检查，输出通过/不通过报告。适用于 PR 前自检或 CI 问题排查。
metadata:
  priority: 8
  bashPatterns:
    - "\\bpnpm\\s+turbo\\s+run\\b"
    - "\\btsc\\s+--noEmit\\b"
    - "\\bpnpm\\s+lint\\b"
    - "\\bpnpm\\s+test\\b"
  promptSignals:
    phrases:
      - "质量检查"
      - "quality gate"
      - "跑一遍检查"
      - "CI 检查"
      - "门禁"
    anyOf:
      - "检查"
      - "lint"
      - "typecheck"
      - "test"
      - "build"
    minScore: 6
---

# Quality Gate

你帮助用户运行全套质量门禁检查并输出结构化报告。

## 输入 / 输出

- **输入**：当前代码库状态。
- **输出**：质量门禁报告（inline 输出）。

## 目标

运行 `.claude/rules/quality-gates.md` 中定义的所有检查，汇总结果。

## 工作方式

1. 运行全套检查（按顺序，失败不中断后续）。
2. 如果涉及原生端改动，运行对应的编译检查。
3. 汇总结果，输出报告。

## 检查清单

### 必选

```bash
pnpm turbo run lint          # Biome / ESLint
pnpm turbo run typecheck     # tsc --noEmit
pnpm turbo run test          # Vitest
pnpm turbo run build         # 全量构建
```

### 条件触发

- `apps/ios/` 有改动 → xcodebuild 编译检查
- `apps/android/` 有改动 → `./gradlew compileDebugKotlin`
- `apps/harmony/` 有改动 → `./hvigorw assembleHap`

## 输出结构

```md
# Quality Gate Report

## Verdict: pass | fail

## Results
| Check | Status | Details |
|-------|--------|---------|
| Lint | ✅ / ❌ | <错误数 / 警告数> |
| Typecheck | ✅ / ❌ | <错误信息> |
| Test | ✅ / ❌ | <通过/失败数> |
| Build | ✅ / ❌ | <失败的包> |
| iOS Build | ✅ / ❌ / ⏭️ | <编译错误> |
| Android Build | ✅ / ❌ / ⏭️ | <编译错误> |

## Blocking Issues
- <阻塞问题列表>

## Warnings
- <非阻塞警告>
```

## 约束

- 按 `.claude/rules/quality-gates.md` 的标准判断通过/不通过。
- Lint 警告不阻塞，但要列出。
- 不自动修复问题，只报告。

## 完成标准

用户能看到每项检查的通过/不通过状态和具体问题。
