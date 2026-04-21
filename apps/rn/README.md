# Notiving React Native

React Native bundle runtime for embedding into native iOS and Android host apps.

## Stack

- **React Native** 0.85 + React 19
- **Linter**: [Biome](https://biomejs.dev)

## Getting Started

```bash
pnpm dev             # Start Metro bundler
pnpm build           # Bundle for both iOS and Android
pnpm lint            # Lint with Biome
pnpm format          # Auto-format with Biome
```

## Bundle Outputs

```bash
pnpm bundle:ios      # → dist/main.ios.jsbundle
pnpm bundle:android  # → dist/index.android.bundle
```

Bundles and source maps are written to `dist/`.
