# Tech Spec: [功能名称]

## 背景

[关联 PRD 链接或简述需求。]

## 技术方案

### 方案概述

[一段话描述整体技术方案。]

### 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| [决策点 1] | [选择 A] | [为什么选 A 而非 B] |

## 数据模型

### 新增 / 修改表

```sql
-- 示例
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  post_id UUID NOT NULL REFERENCES posts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);
```

### Drizzle Schema 变更

```typescript
// src/db/schema.ts 中的变更
```

## 接口设计

### 新增 / 修改 Endpoint

| Method | Path | 描述 | Auth |
|--------|------|------|------|
| POST | `/api/v1/resource` | 创建资源 | Required |

### Request / Response 契约

```typescript
// Request
const createResourceSchema = z.object({
  // ...
});

// Response
interface ResourceResponse {
  // ...
}
```

## 前端变更

### 组件树

```
PageComponent
├── SubComponentA
│   └── SubComponentB
└── SubComponentC
```

### 状态管理

[useQuery / useState / 其他状态方案]

## 错误处理

| 场景 | HTTP Status | Error Message |
|------|-------------|---------------|
| [场景 1] | 400 | [message] |
| [场景 2] | 404 | [message] |

## 测试策略

### 单元测试

- [测试点 1]
- [测试点 2]

### 集成测试

- [测试点 1]

### 手动测试步骤

1. [步骤 1]
2. [步骤 2]

## 文件变更清单

| 文件 | 变更类型 | 内容 |
|------|---------|------|
| `path/to/file` | 新增 / 修改 | [描述] |

## 风险与待确认

- [ ] [风险 / 待确认 1]
- [ ] [风险 / 待确认 2]

## 里程碑

| 阶段 | 内容 | 预估 |
|------|------|------|
| Phase 1 | [内容] | [时间] |
