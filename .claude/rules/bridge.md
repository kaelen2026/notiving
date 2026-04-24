# Bridge 协议修改规范

## ShellBridge 接口

`packages/bridge-types/src/index.ts` 定义了 Shell 与 Runtime（H5/RN）之间的通信契约。方法分 6 类：Session / Navigation / Analytics / Permission / Lifecycle / Device。

## 修改清单

新增或修改 `ShellBridge` 方法时，必须同步更新以下 7 个文件：

1. `packages/bridge-types/src/index.ts` — 类型定义（先改这个）
2. `apps/h5/src/lib/bridge.ts` — H5 JS 适配 + 浏览器 fallback
3. `apps/rn/src/lib/bridge.ts` — RN JS 适配
4. `apps/ios/notiving/notiving/Shell/Bridge/RN/ShellBridgeModule.swift` — iOS RN 原生模块
5. `apps/ios/notiving/notiving/Shell/Bridge/H5/H5BridgeHandler.swift` — iOS H5 WebView 处理
6. `apps/android/app/src/main/java/com/notiving/notiving/shell/bridge/rn/ShellBridgeModule.kt` — Android RN 原生模块
7. `apps/android/app/src/main/java/com/notiving/notiving/shell/bridge/h5/H5BridgeInterface.kt` — Android H5 WebView 接口

## 约束

- 类型定义先改，其他文件跟进，确保 TypeScript 编译通过
- H5 fallback 必须提供浏览器降级实现（不依赖 Shell 也能运行）
- H5 bridge 通过 `window.__notivingBridgeCallback(callbackId, result)` 回调结果
- H5 bridge 通过 `window.__notivingBridgeEmit(eventName, data)` 推送事件
- RN bridge 通过 `RCTDeviceEventEmitter`（Android）/ `sendEvent`（iOS）推送事件
- iOS 的 Navigation 调用必须 dispatch 到主线程（`DispatchQueue.main.async`）
- 不要只改部分文件——漏改任何一端会导致运行时崩溃
