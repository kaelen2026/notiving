# Flutter Rules

## 架构

- Flutter module 嵌入模式（非独立 app），嵌入原生 iOS/Android Shell
- Dart SDK ^3.11.5
- Material3 主题

## 项目结构

```
apps/flutter/
├── lib/
│   └── main.dart          # 入口：NotivingApp + HomePage
├── pubspec.yaml           # 依赖声明（module 配置）
├── analysis_options.yaml  # flutter_lints
└── test/                  # 测试目录
```

## 编码规范

- Linter：`flutter_lints: ^6.0.0`（`analysis_options.yaml`）
- 命名：类 `UpperCamelCase`，变量/函数 `lowerCamelCase`，文件 `snake_case.dart`
- Widget：优先 `StatelessWidget`，需要状态时用 `StatefulWidget`
- 2-space 缩进
- 尾逗号（trailing commas）保持格式化一致

## 状态管理

- 当前无状态管理库
- 新增时优先考虑 `provider` 或 `riverpod`，需与团队确认

## 主题

- 使用 `ThemeData` + Material3（`useMaterial3: true`）
- 颜色对齐 `@notiving/design-tokens`（Orange 500 品牌色）

## Module 配置

```yaml
module:
  androidX: true
  androidPackage: com.notiving.notiving
  iosBundleIdentifier: com.notiving.notiving
```

## 测试

- 暂无测试
- 新增时使用 `flutter_test`

## 构建验证

```bash
cd apps/flutter
flutter build apk --release   # Android
flutter build ios --release    # iOS
```
