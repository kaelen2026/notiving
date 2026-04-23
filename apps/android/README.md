# Notiving Android

Native Android app — the **Shell** host for RN and H5 runtime containers.

## Stack

- **Kotlin** + **Jetpack Compose**
- Android SDK 36 (minSdk 28)

## Architecture

Shell 模式：与 iOS 对称的宿主架构，通过 Bridge Protocol 管理 RN/H5 容器。

```
shell/
├── ShellRootScreen.kt          # Tab bar (route-table.json 驱动)
├── router/                     # URL → runtime 路由解析 + deeplink
├── session/                    # Token / userId / deviceId 管理
├── runtime/                    # H5Container (WebView) + RNContainer
├── bridge/
│   ├── rn/ShellBridgeModule    # RN Native Module (17 methods)
│   └── h5/H5BridgeInterface    # @JavascriptInterface (17 methods)
└── screens/                    # Placeholder screens
```

详见 [docs/architecture/native-shell.md](../../docs/architecture/native-shell.md)。

## Getting Started

Open the `apps/android` directory in Android Studio, sync Gradle, and run on a device or emulator.

```bash
./gradlew compileDebugKotlin   # Kotlin 编译检查
./gradlew assembleDebug        # 完整 debug APK
```

Package: `com.notiving.notiving`
