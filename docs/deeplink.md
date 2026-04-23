# Deeplink 方案

## 1. URL Scheme

| 类型 | 格式 | 用途 |
|------|------|------|
| Custom Scheme | `notiving://` | App 内跳转、OAuth 回调 |
| Universal Link (iOS) | `https://notiving.com/` | 分享链接、SEO、免确认跳转 |
| App Link (Android) | `https://notiving.com/` | 同上 |

两套并行：Custom Scheme 保证 app 已安装时 100% 唤起；Universal/App Link 支持未安装时 fallback 到 Web。

## 2. 路由表

```
notiving://home                → HomeTab
notiving://explore             → H5 Explore
notiving://inbox               → InboxTab
notiving://profile             → ProfileTab
notiving://post/:id            → 帖子详情
notiving://user/:id            → 用户主页
notiving://settings            → 设置页
notiving://about               → 关于页（H5）
notiving://login               → 登录页
notiving://oauth/callback?...  → OAuth 回调
```

Universal Link 同理，前缀换成 `https://notiving.com/`。

## 3. 各端实现

### iOS

- `notivingApp.swift` 添加 `onOpenURL` modifier，解析 URL 后调用 `ShellRouter.shared.navigate(path)`
- Info.plist 注册 `CFBundleURLSchemes: ["notiving"]`
- Associated Domains 添加 `applinks:notiving.com`

### Android

- `AndroidManifest.xml` 给 `MainActivity` 添加两组 intent-filter：
  - Custom Scheme: `android:scheme="notiving"`
  - App Link: `android:scheme="https" android:host="notiving.com"` + `autoVerify="true"`
- `MainActivity.onCreate` / `onNewIntent` 解析 intent data 后调用 `ShellRouter.navigate()`

### Web

- Next.js 路由天然匹配，`https://notiving.com/post/123` 直接渲染对应页面
- 部署 `/.well-known/apple-app-site-association` 和 `/.well-known/assetlinks.json`

### H5

- Shell 内通过 bridge 跳转
- 独立运行时 `window.location.href` 跳转到 Web 端

## 4. 参数传递

```
notiving://post/abc123                    → postId = "abc123"
notiving://oauth/callback?token=xxx       → OAuth token
notiving://explore?tab=trending&q=music   → query params 透传给 H5
```

路径参数用于资源定位，query params 用于状态/过滤条件。

## 5. Fallback 策略

```
用户点击 https://notiving.com/post/123
  ├─ App 已安装 → Universal/App Link 直接打开 App
  └─ App 未安装 → 打开 Web 页面（Next.js 渲染）
       └─ Web 页面顶部 Smart Banner 引导安装
```

## 6. OAuth 回调集成

API 的 OAuth callback 已支持 `redirect_uri`，设为：

- iOS/Android: `notiving://oauth/callback`
- Web: `https://notiving.com/oauth/callback`

## 7. 验证方法

### iOS 模拟器

```bash
# Custom Scheme — 跳转到 home tab
xcrun simctl openurl booted "notiving://home"

# 跳转到 profile tab
xcrun simctl openurl booted "notiving://profile"

# OAuth 回调（token 写入 SessionManager，跳转 profile）
xcrun simctl openurl booted "notiving://oauth/callback?token=test_token_123"

# Universal Link
xcrun simctl openurl booted "https://notiving.com/explore"
```

### Android 模拟器 / 真机

```bash
# Custom Scheme — 跳转到 home tab
adb shell am start -a android.intent.action.VIEW -d "notiving://home"

# 跳转到 profile tab
adb shell am start -a android.intent.action.VIEW -d "notiving://profile"

# OAuth 回调
adb shell am start -a android.intent.action.VIEW -d "notiving://oauth/callback?token=test_token_123"

# App Link
adb shell am start -a android.intent.action.VIEW -d "https://notiving.com/explore"
```

### 验证清单

| 场景 | 预期行为 | iOS | Android |
|------|----------|-----|---------|
| `notiving://home` | 切换到 HomeTab | ☐ | ☐ |
| `notiving://explore` | 切换到 Explore | ☐ | ☐ |
| `notiving://profile` | 切换到 ProfileTab | ☐ | ☐ |
| `notiving://oauth/callback?token=xxx` | token 存入 Session，跳转 profile | ☐ | ☐ |
| `https://notiving.com/home` | 同 custom scheme 行为 | ☐ | ☐ |
| 冷启动 deeplink | App 未运行时点击链接，启动后直达目标页 | ☐ | ☐ |
| 热启动 deeplink | App 在后台时点击链接，回到前台并跳转 | ☐ | ☐ |
| 无效路径 `notiving://unknown` | 不崩溃，静默忽略 | ☐ | ☐ |

### 调试技巧

- iOS: `DeepLinkHandler.handle` 入口加 `print("deeplink: \(url)")` 查看 Xcode Console
- Android: `adb logcat | grep -i "deeplink\|intent"` 查看 intent 分发
- Android App Link 验证状态: `adb shell pm get-app-links com.notiving.notiving`

## 8. 实现状态

### P0 — 已完成 ✅

- [x] iOS: `Info.plist` 注册 `notiving://` scheme
- [x] iOS: `DeepLinkHandler.swift` 解析 URL 并路由
- [x] iOS: `notivingApp.swift` 添加 `.onOpenURL` modifier
- [x] Android: `AndroidManifest.xml` 添加 custom scheme + App Link intent-filter
- [x] Android: `DeepLinkHandler.kt` 解析 URI 并路由
- [x] Android: `MainActivity.kt` 添加 `onNewIntent` 处理

### P1 — 已完成 ✅

- [x] 部署 `/.well-known/apple-app-site-association`（iOS Universal Link）
- [x] 部署 `/.well-known/assetlinks.json`（Android App Link，debug 指纹，上线前替换 release）
- [x] iOS: 添加 Associated Domains entitlement (`applinks:notiving.com`)
- [x] `next.config.ts` 添加 AASA Content-Type header

### P2 — 待实现

- [ ] Deferred Deeplink（未安装时记住目标页，安装后首次打开跳转）
