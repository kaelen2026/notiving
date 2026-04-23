# Deeplink 方案

## 1. URL Scheme

| 类型 | 格式 | 用途 |
|------|------|------|
| Custom Scheme | `notiving://` | App 内跳转、OAuth 回调 |
| Universal Link (iOS) | `https://notiving.app/` | 分享链接、SEO、免确认跳转 |
| App Link (Android) | `https://notiving.app/` | 同上 |

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

Universal Link 同理，前缀换成 `https://notiving.app/`。

## 3. 各端实现

### iOS

- `notivingApp.swift` 添加 `onOpenURL` modifier，解析 URL 后调用 `ShellRouter.shared.navigate(path)`
- Info.plist 注册 `CFBundleURLSchemes: ["notiving"]`
- Associated Domains 添加 `applinks:notiving.app`

### Android

- `AndroidManifest.xml` 给 `MainActivity` 添加两组 intent-filter：
  - Custom Scheme: `android:scheme="notiving"`
  - App Link: `android:scheme="https" android:host="notiving.app"` + `autoVerify="true"`
- `MainActivity.onCreate` / `onNewIntent` 解析 intent data 后调用 `ShellRouter.navigate()`

### Web

- Next.js 路由天然匹配，`https://notiving.app/post/123` 直接渲染对应页面
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
用户点击 https://notiving.app/post/123
  ├─ App 已安装 → Universal/App Link 直接打开 App
  └─ App 未安装 → 打开 Web 页面（Next.js 渲染）
       └─ Web 页面顶部 Smart Banner 引导安装
```

## 6. OAuth 回调集成

API 的 OAuth callback 已支持 `redirect_uri`，设为：

- iOS/Android: `notiving://oauth/callback`
- Web: `https://notiving.app/oauth/callback`

## 7. 实现优先级

1. **P0** — Custom Scheme 注册 + DeepLinkHandler + onOpenURL / onNewIntent（基础能力）
2. **P1** — Universal Link / App Link + well-known 文件部署（分享体验）
3. **P2** — Deferred Deeplink（未安装时记住目标页，安装后首次打开跳转）
