# React Native Rules

## 架构

- 嵌入式 RN（非 Expo），作为 module 嵌入原生 iOS/Android Shell
- React Native 0.85+，React 19
- 导航由原生 Shell 控制，RN 端通过 `bridge.navigate()` 请求跳转
- 无独立导航库（不用 React Navigation）

## Bridge 通信

- Bridge 类型定义：`@notiving/bridge-types`（workspace 包）
- RN 端适配：`src/lib/bridge.ts`，封装 `NativeModules.ShellBridge` + `NativeEventEmitter`
- 调用原生能力统一走 bridge，不直接使用 `NativeModules`
- 事件监听通过 `NativeEventEmitter` 订阅 Shell 推送
- Bridge 变更必须同步 `.claude/rules/bridge.md` 中的 7 个文件

## 状态管理

- 使用 React `useState` / `useEffect`
- 服务端状态如需引入，优先 `@tanstack/react-query`
- 不引入 Redux / MobX / Zustand 等外部状态库

## 编码规范

- TypeScript strict，遵守 `.claude/rules/coding.md` 通用规则
- Linter：Biome
- 组件：函数式组件，`export default function ComponentName()`
- 样式：`StyleSheet.create()` 集中定义，不用 inline style 对象字面量
- 平台差异：优先 `Platform.select()`，避免 `.ios.tsx` / `.android.tsx` 分文件

## 文件结构

```
apps/rn/src/
├── components/    # 共享组件
├── pages/         # 页面级组件
├── hooks/         # 自定义 hooks
├── lib/           # 工具、bridge、常量
└── App.tsx        # 入口
```

## 测试

- 暂无测试框架配置
- 新增测试时使用 Jest + React Native Testing Library
