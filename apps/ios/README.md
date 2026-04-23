# Notiving iOS

Native iOS app — the **Shell** host for RN and H5 runtime containers.

## Stack

- **Swift** + **SwiftUI**
- iOS 16+

## Architecture

Shell 模式：原生端拥有导航、会话、生命周期，通过 Bridge Protocol 管理 RN/H5 容器。

```
Shell/
├── ShellRootView.swift         # Tab bar (route-table.json 驱动)
├── Router/                     # URL → runtime 路由解析 + deeplink
├── Session/                    # Token / userId / deviceId 管理
├── Runtime/                    # H5Container (WKWebView) + RNContainer
├── Bridge/
│   ├── RN/ShellBridgeModule    # RN Native Module (17 methods)
│   └── H5/H5BridgeHandler      # WKScriptMessageHandler (17 methods)
└── Screens/                    # Profile, Login, Settings (原生页面)
```

详见 [docs/architecture/native-shell.md](../../../docs/architecture/native-shell.md)。

## Getting Started

Open `apps/ios/notiving/notiving.xcodeproj` in Xcode, select a simulator or device, and run.

## Build Verification

```bash
cd apps/ios/notiving
xcodebuild -project notiving.xcodeproj -scheme notiving -configuration Debug \
  -destination 'generic/platform=iOS' build
```
