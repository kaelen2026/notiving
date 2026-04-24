# Native Build Verification

When modifying native code (`apps/ios/`, `apps/android/`), you **must** verify compilation before reporting done.

The pre-commit hook (`.husky/pre-commit`) automatically triggers native builds when relevant files are staged, but you should also verify manually during development.

## iOS

```bash
cd apps/ios/notiving
xcodebuild -project notiving.xcodeproj -scheme notiving -configuration Debug \
  -destination 'generic/platform=iOS' build 2>&1 | grep "error:" | head -20
```

- **Gate**: Zero compilation errors in files you modified.
- Pre-existing errors in unmodified files do not block your changes.
- Swift files using `@Published` / `ObservableObject` must `import Combine`.

## Android

```bash
cd apps/android
./gradlew compileDebugKotlin
```

- **Gate**: `compileDebugKotlin` must succeed (`BUILD SUCCESSFUL`).
- `assembleDebug` may fail due to local JDK toolchain issues — `compileDebugKotlin` is the authoritative check for code correctness.

## Cross-platform Bridge Changes

When modifying bridge interfaces (`packages/bridge-types/`, `apps/*/Shell/Bridge/`):

1. **TypeScript**: `pnpm --filter h5 exec tsc --noEmit && pnpm --filter rn exec tsc --noEmit`
2. **iOS**: `xcodebuild` as above — check that `ShellBridgeModule.swift`, `H5BridgeHandler.swift` compile
3. **Android**: `./gradlew compileDebugKotlin` — check that `ShellBridgeModule.kt`, `H5BridgeInterface.kt` compile
4. **Stub dependencies**: If bridge code calls `ShellRouter` or `SessionManager` methods that don't exist yet, add stub methods to those classes
