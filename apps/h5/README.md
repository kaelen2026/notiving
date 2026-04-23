# Notiving H5

Mobile web app deployed at `h5.notiving.com`. Runs standalone or inside native Shell (iOS/Android) via WebView.

Built with **Vite** + **React 19** + **React Router** + **TanStack Query** + **Tailwind CSS v4**.

## Stack

- **Bundler**: [Vite](https://vite.dev) 8
- **Framework**: React 19 + [React Router](https://reactrouter.com) 7
- **Server State**: [@tanstack/react-query](https://tanstack.com/query) 5
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4 (via `@tailwindcss/vite`)
- **Design Tokens**: `@notiving/design-tokens` (semantic CSS variables)
- **Bridge**: `@notiving/bridge-types` (Shell communication, auto-fallback to browser APIs)
- **API Client**: `@notiving/shared` (typed fetch wrapper)
- **Linter**: ESLint
- **Deploy**: Vercel

## Getting Started

```bash
pnpm dev       # Start dev server with HMR
pnpm build     # tsc -b && vite build
pnpm preview   # Preview production build
pnpm lint      # Lint with ESLint
```
