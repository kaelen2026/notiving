# Coding Rules

## Language & Build

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Target ES2023, bundled with Vite
- Package manager: pnpm (workspace monorepo via Turborepo)
- Run `tsc -b` and `vite build` to verify changes before reporting done

## React

- Functional components only, exported as `export default function ComponentName()`
- Colocate hooks, types, and helpers in the same file unless shared
- Prefer `useQuery` / `useMutation` from `@tanstack/react-query` for all server state — no `useEffect` + `useState` for fetching
- Keep component files under 200 lines; extract sub-components when exceeded

## Routing

- Use `react-router-dom` — routes declared in `App.tsx`, page components in `src/pages/`
- One file per route, named after the page (PascalCase)

## Styling

- Tailwind CSS v4 (via `@tailwindcss/vite` plugin) — utility classes only, no custom CSS files
- No inline `style` props unless dynamic values require it
- Keep class lists readable: one concern per logical group (layout, spacing, color, typography)

## File & Folder Conventions

- `src/pages/` — route-level page components
- `src/components/` — shared UI components
- `src/hooks/` — shared custom hooks
- `src/lib/` — utilities, API client, constants
- File names: PascalCase for components (`Button.tsx`), camelCase for non-component modules (`apiClient.ts`)

## Code Style

- Double quotes for strings, trailing commas, semicolons
- Named exports for shared utilities; default exports for pages and route-level components
- Imports ordered: react → third-party → internal (aliased) → relative
- No barrel files (`index.ts` re-exports) — import directly from the source file

## Testing

- Prefer colocated test files (`Component.test.tsx` next to `Component.tsx`)
- Test behavior, not implementation details

## Git

- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- commitlint enforced via Husky pre-commit hook
