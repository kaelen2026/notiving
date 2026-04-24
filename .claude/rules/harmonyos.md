# HarmonyOS Rules

## 语言与框架

- ArkTS（`.ets` 文件），HarmonyOS / OpenHarmony 平台
- ArkUI 声明式 UI 框架
- 构建工具：hvigorw

## 项目结构

```
apps/harmony/entry/src/main/ets/
├── entryability/EntryAbility.ets   # UIAbility 入口
├── pages/Index.ets                  # 页面组件
└── ...
```

## 编码规范

### 组件

- `@Entry @Component struct PageName` 定义页面入口
- `@Component struct ComponentName` 定义可复用组件
- `build()` 方法返回声明式 UI 树
- 状态装饰器：`@State`（组件内）、`@Prop`（父传子）、`@Link`（双向绑定）

### 生命周期

- UIAbility：`onCreate`、`onDestroy`、`onForeground`、`onBackground`、`onWindowStageCreate`
- 页面：`aboutToAppear`、`aboutToDisappear`、`onPageShow`、`onPageHide`

### 导入

- Kit 导入：`import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit'`
- 日志：`import { hilog } from '@kit.PerformanceAnalysisKit'`
- 使用 `@kit.*` 命名空间，不直接导入 `@ohos.*`（除非 kit 不提供）

### 日志

- 使用 `hilog`，不用 `console.log`
- 格式：`hilog.info(0x0000, 'TAG', 'message %{public}s', value)`

## 测试

- 框架：`@ohos/hypium` + `@ohos/hamock`
- 测试文件：`entry/src/test/`（单元测试）、`entry/src/ohosTest/`（设备测试）

## 构建验证

```bash
cd apps/harmony
./hvigorw assembleHap --mode module -p product=default
```
