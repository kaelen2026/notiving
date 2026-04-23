# Design System

## 设计理念

**干净极简**风格（Linear / Notion 风），搭配**橙色暖色系**品牌色。强调大量留白、低饱和度中性色、清晰的信息层级。

## 品牌色

主色为 **Orange 500 (`#f97316`)**，用于按钮、链接、强调等交互元素。禁止在大面积背景上直接使用主色。

## 色彩规范

所有语义色定义在 `packages/design-tokens/tokens.json`，CSS 变量以 `--nv-` 为前缀。

### 使用规则

- **前端代码中禁止硬编码颜色值**（如 `bg-gray-200`、`text-zinc-600`、`#f97316`）
- 必须使用语义化 Tailwind 工具类：`bg-background`、`text-foreground`、`bg-primary`、`border-border` 等
- 原始色阶（`--nv-orange-500`、`--nv-gray-200`）仅在 `theme.css` 内部引用，业务代码中使用语义变量
- 新增语义色时，必须同时定义 light 和 dark 两套值

### 语义色映射（常用）

| Tailwind 类 | 用途 |
|---|---|
| `bg-background` | 页面主背景 |
| `bg-surface` | 卡片 / 面板背景 |
| `text-foreground` | 主要文字 |
| `text-foreground-secondary` | 次要文字 |
| `text-foreground-tertiary` | 占位符 / 禁用文字 |
| `border-border` | 默认边框 |
| `bg-primary` / `text-primary` | 品牌主色 |
| `bg-primary-muted` | 主色浅底（Tag、Badge 背景） |
| `text-primary-foreground` | 主色上的文字（白色） |
| `bg-destructive` | 危险操作 |
| `bg-success` | 成功状态 |
| `bg-warning` | 警告状态 |

## 深色模式

- 跟随系统偏好自动切换（`prefers-color-scheme: dark`）
- 深色模式下语义变量自动映射到暗色值，业务代码无需额外处理
- 禁止使用 `dark:` Tailwind 前缀手动覆盖颜色 — 所有暗色适配通过 CSS 变量完成

## 字体

纯系统字体栈，不加载任何自定义字体：

```
sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif
mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace
```

## 间距 & 圆角

沿用 Tailwind 默认间距系统（4px 基准）。圆角使用设计系统定义：

| Token | 值 | 用途 |
|---|---|---|
| `rounded-sm` | 4px | 小元素（Badge、Tag） |
| `rounded-md` | 8px | 默认（Input、Card） |
| `rounded-lg` | 12px | 大卡片、模态框 |
| `rounded-xl` | 16px | 特殊容器 |
| `rounded-full` | 9999px | 头像、圆形按钮 |

## 阴影

极简风格下阴影应克制使用，仅用于浮层和卡片提升：

| Token | 用途 |
|---|---|
| `shadow-sm` | 微弱提升（卡片默认） |
| `shadow-md` | 下拉菜单、Popover |
| `shadow-lg` | 模态框 |
| `shadow-xl` | 极少使用 |

## 动效

- 过渡时长：快速交互 `100ms`，常规 `200ms`，复杂动画 `300ms`
- 缓动函数：统一使用 `cubic-bezier(0.4, 0, 0.2, 1)`
- 所有交互元素必须有 `transition` 过渡（hover、focus、active）

## 设计系统包结构

```
packages/design-tokens/
├── tokens.json          # 平台无关的 token 源（JSON）
├── css/
│   ├── theme.css        # CSS 变量定义（light + dark）
│   └── tailwind.css     # Tailwind v4 @theme 绑定
├── src/
│   ├── tokens.ts        # TypeScript 常量导出（供 RN / 原生端消费）
│   └── index.ts         # 入口
├── package.json
└── tsconfig.json
```

## 各端接入方式

### Web 端（h5 / web）

在 CSS 入口文件中导入：

```css
@import "tailwindcss";
@import "@notiving/design-tokens/theme.css";
@import "@notiving/design-tokens/tailwind.css";
```

然后直接使用语义化 Tailwind 类：`bg-background`、`text-primary` 等。

### React Native

从 TypeScript 导入：

```ts
import { semanticColors, radius, fontFamily } from "@notiving/design-tokens";
```

### 原生端（iOS / Android / HarmonyOS / Flutter）

读取 `tokens.json` 或参照 TypeScript 常量，在各平台实现对应的主题系统。

## 新增 Token 流程

1. 在 `tokens.json` 中添加源定义
2. 在 `src/tokens.ts` 中同步 TypeScript 常量
3. 在 `css/theme.css` 中添加 CSS 变量（light + dark）
4. 如果 Tailwind 需要消费，在 `css/tailwind.css` 的 `@theme` 中添加映射
5. 更新本文档
