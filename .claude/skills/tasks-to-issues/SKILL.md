---
name: tasks-to-issues
description: 将任务文件转为 GitHub Issues，保留结构化信息和依赖关系。适用于任务拆分完成后需要上线到项目管理。
metadata:
  priority: 5
  pathPatterns:
    - "docs/tasks/**"
  bashPatterns:
    - "\\bgh\\s+issue\\s+create\\b"
    - "\\bgh\\s+issue\\s+list\\b"
    - "\\bgh\\s+label\\b"
  promptSignals:
    phrases:
      - "创建 issue"
      - "tasks to issues"
      - "转 issue"
      - "上 GitHub"
      - "create issues"
    anyOf:
      - "issue"
      - "GitHub"
      - "创建"
    minScore: 6
---

# Tasks to Issues

你帮助用户将 `docs/tasks/` 下的任务文件转为 GitHub Issues。

## 输入 / 输出

- **输入**：`docs/tasks/` 下的任务文件（按 task-template 格式）。
- **输出**：GitHub Issues（通过 `gh issue create`）；inline 汇总报告。

## 目标

将每个任务文件转为一个 GitHub Issue，保留结构化信息，设置 label 和依赖关系。

## 工作方式

1. 读取 `docs/tasks/` 下的任务文件。
2. 确认 GitHub repo 的 label 列表（`gh label list`），必要时创建缺失 label。
3. 按依赖顺序创建 Issues（被依赖的先创建）。
4. Issue body 包含：用户故事、验收标准、文件变更清单、依赖关系。
5. 依赖关系通过 Issue body 中的 `Depends on #N` 引用。

## Issue 格式

```md
## User Story
<用户故事>

## Acceptance Criteria
- [ ] AC1
- [ ] AC2
- [ ] AC3

## Files Changed (Estimated)
- <path>: <变更内容>

## Dependencies
- Depends on #<issue-number> (如有)

## Verification
### Automated
- `pnpm turbo run lint typecheck test build`

### Manual
1. <步骤>
```

## Label 规范

- `feat` / `fix` / `chore` — 类型
- `api` / `h5` / `web` / `rn` / `ios` / `android` — 端
- `priority:high` / `priority:medium` / `priority:low` — 优先级

## 约束

- 创建前先确认用户同意（列出将要创建的 Issues 摘要）。
- 不重复创建已存在的 Issue（先 `gh issue list` 检查）。
- 依赖关系用 Issue 编号引用，不用任务文件名。

## 完成标准

所有任务已转为 GitHub Issues，依赖关系正确引用，用户能看到 Issue 列表和链接。
