# Coding Rules

## Language & Build

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Target ES2023, bundled with Vite
- Package manager: pnpm (workspace monorepo via Turborepo)
- API app uses Biome with tabs; all other apps use 2-space indentation
- Run `tsc -b` and `vite build` to verify changes before reporting done

## React

- Functional components only, exported as `export default function ComponentName()`
- Colocate hooks, types, and helpers in the same file unless shared
- Prefer `useQuery` / `useMutation` from `@tanstack/react-query` for all server state — no `useEffect` + `useState` for fetching
- Keep component files under 200 lines; extract sub-components when exceeded

## Routing

- h5: `react-router-dom` v7 — routes declared in `App.tsx`, page components in `src/pages/`
- web: Next.js App Router — pages in `src/app/`, interactive pages use `"use client"` directive
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
- No barrel files (`index.ts` re-exports) in app code — shared packages (`packages/*`) may use barrel exports

## Testing

- Prefer colocated test files (`Component.test.tsx` next to `Component.tsx`)
- Test behavior, not implementation details

## Swift (iOS)

- SwiftUI + MVVM: View (`struct: View`) + ViewModel (`@MainActor final class: ObservableObject`)
- 4-space indentation
- `final class` on all non-inheritable classes; `struct` for data models and views
- Singletons: `static let shared` + `private init()`
- Caseless `enum` for namespacing static-only utilities (e.g., `enum RouteTableLoader`)
- Async: Swift concurrency (`async/await`, `@MainActor`), no Combine for async work
- `@ViewBuilder` on helper methods returning conditional views; `// MARK: -` to section views
- `.task { }` for async loading on appear; `.refreshable { }` for pull-to-refresh
- Boolean properties use `is`/`has`/`show` prefix
- Error handling: custom `APIError` enum + `do/catch` + `guard/else` early return
- No SwiftLint configured

## Kotlin (Android)

- Jetpack Compose: `@Composable` top-level functions in UpperCamelCase
- 4-space indentation
- `object` for singletons; `data class` for models; `enum class` for enumerations
- Constants: `UPPER_SNAKE_CASE` in `companion object`
- Private backing fields: `_selectedTab` (MutableStateFlow) / `selectedTab` (StateFlow)
- `collectAsState()` to bridge StateFlow into Compose
- Null safety: `?: return` for early exit, `orEmpty()`, `?.ifEmpty { }`
- Manual JSON parsing via `org.json.JSONObject`（暂未引入序列化库）
- Trailing commas on multi-line parameters
- No ktlint/detekt configured

## Git

- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- commitlint enforced via Husky pre-commit hook
