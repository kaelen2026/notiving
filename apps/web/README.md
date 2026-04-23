# Notiving Web

Desktop web app deployed at `notiving.com`.

Built with **Next.js 16** + **React 19** + **Tailwind CSS v4**.

## Stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4 (via PostCSS)
- **Design Tokens**: `@notiving/design-tokens` (semantic CSS variables)
- **Linter**: [Biome](https://biomejs.dev)
- **React Compiler** enabled
- **Deploy**: Vercel

Auth uses httpOnly cookie-based refresh tokens (access token in memory).

Hosts Universal Link / App Link verification files at `/.well-known/`.

## Getting Started

```bash
pnpm dev      # Start dev server at http://localhost:3000
pnpm build    # Production build
pnpm start    # Serve production build
pnpm lint     # Lint with Biome
```
