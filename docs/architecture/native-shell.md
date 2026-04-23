# Native Shell 统一宿主架构设计

> Native Shell 是唯一宿主，RN 和 H5 是被管理的运行时容器。

## 1. 设计原则

| 原则 | 含义 |
|------|------|
| **Shell 即操作系统** | 所有跨运行时关注点（导航、登录态、埋点、权限）都由 Shell 持有，运行时只能通过 Bridge 申请 |
| **运行时是进程** | RN / H5 容器等同于 Shell 的子进程，Shell 负责创建、挂起、恢复、销毁 |
| **统一不等于统治** | 运行时内部的 UI 和业务逻辑自治，Shell 不关心运行时内部路由或状态 |
| **离线优先** | Shell 层面的路由表、登录态、容器配置可离线工作，不依赖网络 |

## 2. 整体分层

```
┌─────────────────────────────────────────────────┐
│                    App Process                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │              Native Shell Layer              │ │
│  │                                              │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │ │
│  │  │ Lifecycle │ │  Router  │ │   Session    │ │ │
│  │  │ Manager  │ │          │ │   Manager    │ │ │
│  │  └──────────┘ └──────────┘ └──────────────┘ │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │ │
│  │  │ Runtime  │ │Analytics │ │  Permission  │ │ │
│  │  │Scheduler │ │ Tracker  │ │   Manager    │ │ │
│  │  └──────────┘ └──────────┘ └──────────────┘ │ │
│  └──────────────────┬──────────────────────────┘ │
│                     │ Bridge Protocol              │
│          ┌──────────┴──────────┐                  │
│          │                     │                  │
│  ┌───────▼───────┐   ┌────────▼──────┐          │
│  │  RN Runtime   │   │  H5 Runtime   │          │
│  │  (Container)  │   │  (Container)  │          │
│  │               │   │               │          │
│  │  RN Bundle    │   │  WebView      │          │
│  │  JS Thread    │   │  H5 Pages     │          │
│  └───────────────┘   └───────────────┘          │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 3. Shell 职责详解

### 3.1 App 生命周期

Shell 是唯一感知系统生命周期事件的层，运行时通过 Bridge 订阅。

```
App 启动 → Shell Init → 路由表加载 → 登录态恢复 → 首屏容器创建
App 前台 → Shell.onForeground → 通知各活跃容器 resume
App 后台 → Shell.onBackground → 通知各活跃容器 pause → 释放低优先级容器
App 终止 → Shell.onTerminate → 容器状态持久化 → 清理
```

**iOS 映射：**

```swift
// Shell 持有生命周期，不暴露给运行时
@main
struct NotivingApp: App {
    @UIApplicationDelegateAdaptor(ShellAppDelegate.self) var delegate

    var body: some Scene {
        WindowGroup {
            ShellRootView()
                .environmentObject(ShellContext.shared)
        }
    }
}

class ShellAppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions ...) -> Bool {
        ShellBootstrap.run()  // 路由表 → 登录态 → 容器预热
        return true
    }
}
```

**Android 映射：**

```kotlin
class ShellApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        ShellBootstrap.run(this)  // 路由表 → 登录态 → 容器预热
    }
}

class ShellActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { ShellRootScreen() }
    }

    override fun onResume() {
        super.onResume()
        RuntimeScheduler.notifyAll(LifecycleEvent.RESUME)
    }
}
```

### 3.2 主导航 / Tab / 系统级路由

Shell 持有全局路由表，决定每个 URL 由哪个运行时承载。

**路由表结构（本地 JSON，支持远程热更新）：**

```json
{
  "version": 1,
  "routes": [
    {
      "pattern": "/",
      "runtime": "native",
      "screen": "HomeTab"
    },
    {
      "pattern": "/post/:id",
      "runtime": "rn",
      "module": "PostDetail",
      "preload": true
    },
    {
      "pattern": "/settings",
      "runtime": "rn",
      "module": "Settings"
    },
    {
      "pattern": "/about",
      "runtime": "h5",
      "url": "/about",
      "cache": "session"
    },
    {
      "pattern": "/help/*",
      "runtime": "h5",
      "url": "/help/{path}",
      "cache": "persistent"
    }
  ],
  "tabs": [
    { "key": "home",    "route": "/",         "icon": "home" },
    { "key": "explore", "route": "/explore",  "icon": "compass" },
    { "key": "inbox",   "route": "/inbox",    "icon": "bell" },
    { "key": "profile", "route": "/profile",  "icon": "user" }
  ]
}
```

**路由解析流程：**

```
URL 输入（deeplink / 内部跳转 / Tab 切换）
  │
  ├─ Shell Router 匹配路由表
  │    ├─ runtime == "native"  → SwiftUI/Compose 直接渲染
  │    ├─ runtime == "rn"      → RuntimeScheduler 获取/创建 RN 容器
  │    └─ runtime == "h5"      → RuntimeScheduler 获取/创建 WebView 容器
  │
  ├─ 导航动画由 Shell 控制（push / present / tab switch）
  │
  └─ Back 手势 / 物理返回键由 Shell 拦截
       ├─ 容器内部有历史 → 转发给容器
       └─ 容器内部无历史 → Shell pop
```

**关键设计：Shell 控制导航栈，不是容器。** Tab 切换、push/pop、modal present 都是 Shell 的导航动画。容器只是 Shell 导航栈中的一个"视图"。

### 3.3 登录态与设备态

```
┌─────────────────────────────────┐
│         SessionManager          │
│                                 │
│  accessToken   (内存)           │
│  refreshToken  (Keychain)       │
│  userId        (内存)           │
│  deviceId      (Keychain)       │
│  deviceFingerprint (计算值)      │
│                                 │
│  onSessionChange → 广播给所有容器  │
│  onTokenRefresh  → 自动刷新      │
│  onLogout        → 销毁所有容器   │
└─────────────────────────────────┘
```

**运行时获取登录态的唯一方式：**

```
RN:   NativeModules.ShellSession.getToken()     → Promise<string>
H5:   window.NotivingBridge.getToken()           → Promise<string>
      (注入到 WebView 的 JS Bridge)
```

**运行时不持久化 token，不发起 refresh，不处理 401。** 所有 token 管理由 Shell 完成。运行时收到 401 时通知 Shell，Shell 决定刷新还是踢到登录页。

### 3.4 启动流程

```
Cold Start
  │
  ├─ 1. Shell Init                          (~50ms)
  │    ├─ 读取本地路由表
  │    ├─ 从 Keychain 恢复 Session
  │    └─ 初始化 Analytics / Permission Manager
  │
  ├─ 2. 首屏决策                             (~0ms)
  │    ├─ 有登录态 → 主 Tab 页
  │    └─ 无登录态 → 登录/注册页（Native）
  │
  ├─ 3. 首屏容器创建                          (~100ms)
  │    ├─ Tab 0 对应的运行时容器
  │    └─ 后台预热高频容器（异步）
  │
  ├─ 4. 路由表热更新检查（异步，不阻塞）         (~网络)
  │    └─ 有新版本 → 下次启动生效 / 或 silent reload
  │
  └─ 5. Splash 消失，用户可交互
```

### 3.5 权限管理

Shell 统一管理系统权限（相机、定位、通知、相册等）。运行时不直接调用系统 API。

```
RN/H5 需要权限
  │
  ├─ Bridge.requestPermission("camera")
  │
  ├─ Shell PermissionManager 检查状态
  │    ├─ 已授权 → 返回 granted
  │    ├─ 未请求 → 弹出系统弹窗 → 返回结果
  │    └─ 已拒绝 → 弹出引导弹窗（Native UI）→ 跳设置
  │
  └─ 返回 { status: "granted" | "denied" | "blocked" }
```

### 3.6 全局埋点

```
┌──────────────────────────┐
│     AnalyticsTracker     │
│                          │
│  自动采集:               │
│   • 页面曝光（Shell 路由级）│
│   • 容器生命周期           │
│   • 性能指标              │
│   • 崩溃 & ANR            │
│                          │
│  手动上报（通过 Bridge）:   │
│   • 业务事件              │
│   • 用户行为              │
│                          │
│  全局属性自动注入:         │
│   • userId / deviceId    │
│   • runtime（native/rn/h5）│
│   • containerVersion     │
│   • route pattern        │
└──────────────────────────┘
```

运行时上报事件时只传业务参数，Shell 自动注入全局属性：

```
Bridge.track("post_liked", { postId: "123" })

// Shell 实际发送：
{
  event: "post_liked",
  postId: "123",
  // ↓ Shell 自动注入
  userId: "u_456",
  deviceId: "d_789",
  runtime: "rn",
  route: "/post/123",
  timestamp: 1745337600,
  appVersion: "1.0.0",
  os: "ios 18.4"
}
```

### 3.7 运行时调度 (RuntimeScheduler)

Shell 中最核心的模块。负责容器的创建、复用、挂起、销毁。

**容器生命周期状态机：**

```
                 create
    ┌──────────────────────────┐
    │                          ▼
  [IDLE] ──preload──▶ [READY] ──attach──▶ [ACTIVE]
                        │                    │
                        │                    │ detach
                        │                    ▼
                        │              [SUSPENDED]
                        │                    │
                        │         resume ◄───┤
                        │                    │ timeout / memory pressure
                        ▼                    ▼
                    [DESTROYED] ◄────────[DESTROYED]
```

**容器池策略：**

| 策略 | RN 容器 | H5 容器 |
|------|---------|---------|
| 最大活跃数 | 3 | 5 |
| 预热 | 启动时预创建 1 个空容器 | 启动时预创建 1 个空 WebView |
| 挂起 | 保留 JS 线程，释放 View 树 | WebView 进入 `pauseTimers` |
| 销毁优先级 | LRU，最久未使用优先销毁 | LRU |
| 内存警告 | 保留当前活跃 + 1 | 仅保留当前活跃 |

**RN 容器方案：**

```
方案 A: 多 Bridge 实例（推荐）
  每个 RN 容器 = 独立的 RCTBridge / ReactHost
  优点：容器间完全隔离，崩溃不互相影响
  缺点：内存占用高，启动慢

方案 B: 单 Bridge + 多 RootView
  共享一个 JS 引擎，通过不同 rootTag 区分
  优点：内存低，切换快
  缺点：一个 JS 崩溃全部挂
  适合：业务模块间信任度高的场景

推荐：方案 A（多 Bridge），通过容器预热和复用缓解启动成本。
```

### 3.8 容器创建/销毁/缓存

```swift
// iOS 伪代码
protocol RuntimeContainer {
    var id: String { get }
    var runtime: RuntimeType { get }   // .rn | .h5
    var state: ContainerState { get }

    func attach(to parent: UIViewController, params: RouteParams)
    func detach()
    func suspend()
    func resume()
    func destroy()

    func sendEvent(_ name: String, payload: [String: Any])
    func onEvent(_ handler: (String, [String: Any]) -> Void)
}

class RuntimeScheduler {
    private var activeContainers: [String: RuntimeContainer] = [:]
    private var suspendedPool: LRUCache<String, RuntimeContainer>
    private var prewarmedRN: RNContainer?
    private var prewarmedWebView: H5Container?

    func resolve(route: Route) -> RuntimeContainer {
        // 1. 命中活跃容器 → 直接返回
        if let active = activeContainers[route.cacheKey] {
            return active
        }
        // 2. 命中挂起池 → resume
        if let suspended = suspendedPool.remove(route.cacheKey) {
            suspended.resume()
            activeContainers[route.cacheKey] = suspended
            return suspended
        }
        // 3. 使用预热容器
        let container: RuntimeContainer
        switch route.runtime {
        case .rn:
            container = prewarmedRN.take() ?? RNContainer()
            prewarmedRN = RNContainer()  // 异步预热下一个
        case .h5:
            container = prewarmedWebView.take() ?? H5Container()
            prewarmedWebView = H5Container()
        }
        activeContainers[route.cacheKey] = container
        return container
    }

    func onMemoryWarning() {
        suspendedPool.evictAll()
        prewarmedRN?.destroy()
        prewarmedWebView?.destroy()
    }
}
```

### 3.9 性能与稳定性兜底

**性能监控：**

| 指标 | 采集方式 | 阈值 |
|------|---------|------|
| 容器创建耗时 | Shell 计时 | RN < 500ms, H5 < 300ms |
| 首屏渲染 | 运行时通过 Bridge 上报 FCP | < 1s |
| JS 异常 | 运行时 Bridge 上报 | 自动采集，不阻断 |
| 内存占用 | Shell 定时采样 | 单容器 > 150MB 触发警告 |
| ANR / 卡顿 | Shell watchdog 线程 | 主线程 > 3s 无响应 |

**稳定性兜底策略：**

```
容器内 JS 崩溃
  ├─ Shell 捕获异常（RN: ExceptionHandler / H5: window.onerror）
  ├─ 上报 crash 信息
  ├─ 尝试 1 次自动重载容器
  └─ 仍然失败 → 展示 Native 降级页（重试 / 返回首页）

容器白屏检测
  ├─ Shell 定时检测容器渲染状态
  ├─ 超过 5s 无内容 → 标记为白屏
  └─ 展示 Native loading → 重建容器

内存溢出
  ├─ Shell 收到 memory warning
  ├─ 按优先级销毁挂起容器
  ├─ 仍然不够 → 销毁非当前活跃容器
  └─ 最坏情况 → 只保留当前页面
```

## 4. Bridge Protocol

Shell 与运行时之间的通信契约。所有通信都通过这层，运行时不直接访问任何 Native API。

### 4.1 接口定义

> **Status: ✅ 已实现** — 完整类型定义见 `packages/bridge-types/src/index.ts`，双端（RN + H5）共享。

```typescript
// packages/bridge-types/src/index.ts

export interface NavigateOpts {
  animated?: boolean;
  present?: boolean;
}

export interface DeviceInfo {
  platform: "ios" | "android";
  osVersion: string;
  appVersion: string;
  deviceId: string;
}

export interface Session {
  token: string;
  userId: string;
}

export type PermissionType = "camera" | "location" | "notification" | "photo";

export interface PermissionResult {
  status: "granted" | "denied" | "blocked";
}

export type Unsubscribe = () => void;

export interface ShellBridge {
  // --- Session ---
  getToken(): Promise<string | null>;
  getUserId(): Promise<string | null>;
  onSessionChange(cb: (session: Session | null) => void): Unsubscribe;

  // --- Navigation ---
  navigate(url: string, opts?: NavigateOpts): void;
  back(): void;
  setTitle(title: string): void;
  setNavBarHidden(hidden: boolean): void;

  // --- Analytics ---
  track(event: string, params?: Record<string, unknown>): void;
  pageView(pageName: string): void;

  // --- Permission ---
  requestPermission(type: PermissionType): Promise<PermissionResult>;
  checkPermission(type: PermissionType): Promise<PermissionResult>;

  // --- Lifecycle ---
  onResume(cb: () => void): Unsubscribe;
  onPause(cb: () => void): Unsubscribe;
  ready(): void;  // 容器通知 Shell 首屏渲染完成

  // --- Device ---
  getDeviceInfo(): Promise<DeviceInfo>;
  getAppVersion(): Promise<string>;
}
```

#### 接口实现状态

| 方法 | 类型 | RN (JS) | H5 (JS) | Android RN | Android H5 | iOS RN | iOS H5 | Native 业务逻辑 |
|------|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `getToken` | async | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ SessionManager |
| `getUserId` | async | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ SessionManager |
| `onSessionChange` | event | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ Phase 4 |
| `navigate` | call | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ ShellRouter |
| `back` | call | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ ShellRouter |
| `setTitle` | call | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ ShellRouter |
| `setNavBarHidden` | call | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ ShellRouter |
| `track` | fire | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ Phase 4 AnalyticsTracker |
| `pageView` | fire | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ Phase 4 AnalyticsTracker |
| `requestPermission` | async | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ Phase 4 PermissionManager |
| `checkPermission` | async | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ Phase 4 PermissionManager |
| `onResume` | event | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ Phase 4 |
| `onPause` | event | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ Phase 4 |
| `ready` | call | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ Phase 4 性能埋点 |
| `getDeviceInfo` | async | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 系统 API |
| `getAppVersion` | async | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Bundle/PackageInfo |

> **✅** = 已实现并接入真实 Native 逻辑 | **⏳** = Bridge 管道已通，Native 业务逻辑待 Phase 4 接入

### 4.2 RN 实现

> **Status: ✅ 已实现** — 统一为单个 `ShellBridge` Native Module，通过 `NativeEventEmitter` 支持事件订阅。

```
Native Module (iOS: Swift + ObjC, Android: Kotlin)
  │
  └─ ShellBridgeModule → NativeModules.ShellBridge (统一模块)
       │
       ├─ Promise 方法 (JS → Native):
       │    getToken / getUserId / requestPermission / checkPermission
       │    getDeviceInfo / getAppVersion
       │
       ├─ 调用方法 (JS → Native, 无返回值):
       │    navigate / back / setTitle / setNavBarHidden
       │    track / pageView / ready
       │
       └─ 事件推送 (Native → JS, 通过 NativeEventEmitter):
            onSessionChange / onResume / onPause
```

**JS 侧封装** (`apps/rn/src/lib/bridge.ts`):

```typescript
import { NativeModules, NativeEventEmitter } from "react-native";
const { ShellBridge: NativeBridge } = NativeModules;
const emitter = NativeBridge ? new NativeEventEmitter(NativeBridge) : null;

// 事件订阅示例：
onSessionChange: (cb) => {
  const subscription = emitter?.addListener("onSessionChange", cb);
  return () => subscription?.remove();  // 返回 Unsubscribe
}
```

**文件位置：**

| 平台 | 文件 |
|------|------|
| Android | `apps/android/.../shell/bridge/rn/ShellBridgeModule.kt` |
| Android | `apps/android/.../shell/bridge/rn/ShellBridgePackage.kt` |
| iOS | `apps/ios/.../Shell/Bridge/RN/ShellBridgeModule.swift` |
| iOS | `apps/ios/.../Shell/Bridge/RN/ShellBridgeModule.m` (ObjC 桥接) |

### 4.3 H5 实现

> **Status: ✅ 已实现** — 通过注入 bridge JS 实现 Promise 回调 + 事件订阅双通道。

```
WebView JS 注入
  │
  ├─ window.NotivingBridge = { ... }     (全部方法)
  │    ├─ call(method, params) → Promise  (异步请求-响应)
  │    └─ on(eventName, cb) → Unsubscribe (事件订阅)
  │
  ├─ 回调通道:
  │    window.__notivingBridgeCallback(id, result)   ← Native 响应
  │
  ├─ 事件通道:
  │    window.__notivingBridgeEmit(eventName, data)   ← Native 推送
  │
  └─ Native 通信方式:
       iOS:     window.webkit.messageHandlers.shellBridge.postMessage(...)
       Android: window.__shellBridge.call(method, callbackId, paramsJson)

注入时机：WebView didStartNavigation / onPageStarted 时注入 bridge JS
注入方式：WKUserScript (iOS) / evaluateJavascript (Android)
```

**文件位置：**

| 平台 | 文件 | 职责 |
|------|------|------|
| Android | `apps/android/.../shell/bridge/h5/H5BridgeInterface.kt` | `@JavascriptInterface` 方法分发 + 事件推送 |
| Android | `apps/android/.../shell/runtime/H5Container.kt` | Bridge JS 注入脚本 |
| iOS | `apps/ios/.../Shell/Bridge/H5/H5BridgeHandler.swift` | `WKScriptMessageHandler` 方法分发 + 事件推送 |
| iOS | `apps/ios/.../Shell/Runtime/H5Container.swift` | Bridge JS 注入脚本 |

**H5 standalone 降级** (`apps/h5/src/lib/bridge.ts`):
当不在 Shell 内运行时，自动降级到浏览器 API（`localStorage` / `document.title` / `history.back()` 等）。

## 5. 目录结构规划

```
apps/
├── ios/notiving/
│   └── Shell/
│       ├── ShellApp.swift              # App 入口
│       ├── ShellRootView.swift         # 主 Tab + 导航容器
│       ├── ShellContext.swift           # 共享上下文 (DI)
│       ├── Router/
│       │   ├── ShellRouter.swift       # URL → 运行时路由
│       │   ├── RouteTable.swift        # 路由表解析
│       │   └── DeepLinkHandler.swift
│       ├── Session/
│       │   ├── SessionManager.swift
│       │   └── KeychainStore.swift
│       ├── Runtime/
│       │   ├── RuntimeScheduler.swift  # 容器调度
│       │   ├── RuntimeContainer.swift  # 协议定义
│       │   ├── RNContainer.swift       # RN 容器实现
│       │   ├── RNManager.swift         # RN 引擎管理
│       │   ├── RNBridging.h            # ObjC 桥接头文件
│       │   └── H5Container.swift       # WebView 容器 + bridge JS 注入 ✅
│       ├── Bridge/
│       │   ├── RN/
│       │   │   ├── ShellBridgeModule.swift   # RN Native Module (17 methods) ✅
│       │   │   └── ShellBridgeModule.m       # ObjC 方法声明 ✅
│       │   └── H5/
│       │       └── H5BridgeHandler.swift     # WKScriptMessageHandler (17 methods) ✅
│       ├── Analytics/
│       │   └── AnalyticsTracker.swift
│       ├── Permission/
│       │   └── PermissionManager.swift
│       └── Stability/
│           ├── CrashGuard.swift
│           └── MemoryWatcher.swift
│
├── android/app/src/main/java/com/notiving/notiving/
│   └── shell/                          # 同构目录结构
│       ├── ShellActivity.kt
│       ├── router/
│       │   └── ShellRouter.kt
│       ├── session/
│       │   └── SessionManager.kt
│       ├── runtime/
│       │   └── H5Container.kt          # WebView 容器 + bridge JS 注入 ✅
│       ├── bridge/
│       │   ├── rn/
│       │   │   ├── ShellBridgeModule.kt      # RN Native Module (17 methods) ✅
│       │   │   └── ShellBridgePackage.kt     # ReactPackage 注册 ✅
│       │   └── h5/
│       │       └── H5BridgeInterface.kt      # @JavascriptInterface (17 methods) ✅
│       ├── analytics/
│       ├── permission/
│       └── stability/
│
├── rn/                                 # RN 业务代码（不感知 Shell）
│   ├── App.tsx
│   └── src/
│       └── lib/
│           └── bridge.ts              # ShellBridge 封装 + NativeEventEmitter ✅
│
├── h5/                                 # H5 业务代码（不感知 Shell）
│   ├── src/
│   │   └── lib/
│   │       └── bridge.ts             # ShellBridge 封装 + standalone 降级 ✅
│   └── ...
│
└── packages/
    └── bridge-types/                   # 共享 Bridge 类型定义 ✅
        ├── package.json
        └── src/
            └── index.ts               # ShellBridge 接口 (17 methods)
```

## 6. 实施路径

分 4 个阶段，每阶段可独立交付验证。

### Phase 1: 骨架 — Shell 能跑起来

**交付物：**
- Shell 入口替换现有 App 入口（iOS + Android）
- ShellRouter 能解析本地路由表
- Tab 栏由 Shell 渲染（Native UI）
- 首页 Tab 展示一个静态 Native 页面

**验证：** App 启动 → 看到 Native Tab 栏 → 能切换 Tab

### Phase 2: 容器 — RN 和 H5 能嵌进来

**交付物：**
- RNContainer：能加载 RN bundle 并展示在 Shell 导航栈中
- H5Container：能加载 H5 URL 并展示在 Shell 导航栈中
- RuntimeScheduler：基础的创建/销毁
- 路由表中配置 1 个 RN 页面 + 1 个 H5 页面

**验证：** Tab 切换 → RN 页面展示 → 点链接 → H5 页面展示 → 返回 → 回到 RN

### Phase 3: Bridge — 运行时能和 Shell 通信 ✅

**交付物：**
- ✅ Bridge Protocol 完整类型定义（`packages/bridge-types`，17 个方法）
- ✅ RN 侧 JS 封装（`apps/rn/src/lib/bridge.ts`，含 `NativeEventEmitter` 事件订阅）
- ✅ H5 侧 JS 封装（`apps/h5/src/lib/bridge.ts`，含 standalone 降级）
- ✅ Android RN Native Module（`ShellBridgeModule.kt`，含事件推送）
- ✅ Android H5 Bridge（`H5BridgeInterface.kt` + `H5Container.kt` 注入脚本）
- ✅ iOS RN Native Module（`ShellBridgeModule.swift/m`，含事件推送）
- ✅ iOS H5 Bridge（`H5BridgeHandler.swift` + `H5Container.swift` 注入脚本）
- ✅ Session + Navigation 接入真实 Native 逻辑（SessionManager / ShellRouter）
- ✅ Device 信息接入系统 API（`Build.VERSION` / `UIDevice` / `Bundle.main`）
- ⏳ Analytics / Permission / Lifecycle 事件 — Bridge 管道已通，Native 业务逻辑待 Phase 4

**验证：** RN/H5 页面调用 Bridge 获取 token → 发 API 请求 → 成功渲染数据 → 调用 getDeviceInfo 获取设备信息

### Phase 4: 打磨 — 生产可用

**交付物：**
- 容器预热和复用池
- 内存管理和降级策略
- 白屏检测和自动恢复
- AnalyticsTracker 接入 `track()` / `pageView()` 真实上报
- PermissionManager 接入 `requestPermission()` / `checkPermission()` 系统权限
- SessionManager 广播 `onSessionChange` 事件（token 刷新 / 登出）
- RuntimeScheduler 广播 `onResume` / `onPause` 生命周期事件
- `ready()` 接入性能埋点（FCP 计时）
- 路由表热更新

**验证：** 反复切换页面无白屏 → 内存警告后自动回收 → 性能数据可观测

## 7. 风险与决策点

| 决策点 | 选项 | 建议 | 原因 |
|--------|------|------|------|
| RN 容器隔离 | 多 Bridge vs 单 Bridge | 多 Bridge | 稳定性优先，崩溃隔离 |
| H5 离线包 | 远程加载 vs 离线包 | 先远程，Phase 4 加离线包 | 降低初期复杂度 |
| 路由表下发 | 纯本地 vs 远程热更新 | 本地为主 + 异步远程更新 | 保证离线可用 |
| Tab 栏实现 | Native vs RN | Native | Shell 层必须用 Native，保证稳定性 |
| Bridge 通信 | 同步 vs 异步 | 全异步 Promise | 跨线程安全 |
