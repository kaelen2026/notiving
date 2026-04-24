---
name: ship
description: 自检→commit→push→PR 创建流程。适用于代码改动完成后准备提交和创建 PR。
metadata:
  priority: 8
  bashPatterns:
    - "\\bgit\\s+push\\b"
    - "\\bgh\\s+pr\\s+create\\b"
    - "\\bgit\\s+commit\\b"
  promptSignals:
    phrases:
      - "ship"
      - "提交"
      - "创建 PR"
      - "push"
      - "发 PR"
      - "commit"
      - "提交代码"
    anyOf:
      - "ship"
      - "PR"
      - "push"
      - "提交"
      - "merge"
      - "commit"
    minScore: 6
---

# Ship

你帮助用户完成代码提交和 PR 创建流程。

## 输入 / 输出

- **输入**：当前分支的代码改动。
- **输出**：Git commit + push + PR（通过 `gh pr create`）。

## 目标

确保代码通过自检后，按规范提交并创建 PR。

## 工作方式

### 1. 自检
- 调度 `reviewer` sub-agent 审查当前改动。
- 运行质量门禁：`pnpm turbo lint typecheck test build`。
- 如果自检不通过，报告问题，不继续。

### 2. Commit
- 确认改动范围（`git status` + `git diff`）。
- 按 Conventional Commits 格式生成 commit message。
- Scope 使用项目约定：`api`、`h5`、`web`、`rn`、`android`、`ios`、`harmony`、`flutter`。

### 3. Push
- 推送到远程分支。
- 如果是新分支，使用 `-u` 设置 upstream。

### 4. PR
- 使用 `gh pr create` 创建 PR。
- PR title 遵循 Conventional Commits 格式。
- PR body 按 `.github/pull_request_template.md` 填写。

## 输出结构

```md
# Ship Report

## Self-Check
- Review: pass | fail
- Quality Gate: pass | fail

## Commit
- Message: <commit message>
- Files: <文件数>

## PR
- URL: <PR 链接>
- Title: <PR 标题>
- Base: main
```

## 约束

- 自检不通过时不继续提交。
- Commit message 必须符合 Conventional Commits。
- 不 force push。
- 不跳过 pre-commit hooks（`--no-verify`）。
- 创建 PR 前确认用户同意。

## 完成标准

PR 已创建，用户能看到 PR 链接。
