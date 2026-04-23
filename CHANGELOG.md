# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - Deploy & Infrastructure (2026-04-22)

#### Deployment
- API deployed to Cloudflare Workers (`api.notiving.com`) with dual Node/Workers entry points
- Web (Next.js) deployed to Vercel (`notiving.com`)
- H5 (Vite SPA) deployed to Vercel (`h5.notiving.com`)
- Deploy scripts: `pnpm deploy:api`, `pnpm deploy:web`, `pnpm deploy:h5`

#### Universal Link / App Link
- iOS: Associated Domains entitlement + `apple-app-site-association` at `notiving.com`
- Android: `assetlinks.json` + intent-filter with `autoVerify`
- `next.config.ts` serves AASA with correct Content-Type header

### Added - Cross-Platform Features (2026-04-21 ~ 2026-04-22)

#### Email OTP Login
- API: 6-digit email verification code with rate limiting (3 sends/10min) and attempt tracking (max 5)
- `email_verification_codes` table with expiry and usage tracking
- Login pages with OTP + password dual mode across h5, web, and iOS (native)
- 6-digit code input with individual boxes and paste support, countdown timer

#### OAuth & Anonymous Auth
- Google + Apple OAuth via `arctic` library
- Anonymous user creation with upgrade path to registered account
- Password linking for OAuth-only accounts
- Device-aware auth: web gets httpOnly cookies, native gets tokens in body
- `accounts` table for linked OAuth providers, `oauth_states` table for CSRF protection

#### Native Shell Architecture (iOS + Android)
- "Shell as OS" pattern: native apps own navigation, session, lifecycle
- Route-table-driven tab bar (`route-table.json`) with 4 tabs (home, explore, inbox, profile)
- `ShellRouter` resolves URLs to native/rn/h5 runtime
- `SessionManager` for token/userId/deviceId storage
- H5 container (WKWebView / Android WebView) with injected bridge JavaScript
- RN container wrapping React Native rootView

#### Bridge Protocol (17 methods)
- `@notiving/bridge-types` package: typed `ShellBridge` interface shared across all platforms
- Session: `getToken`, `getUserId`, `onSessionChange`
- Navigation: `navigate`, `back`, `setTitle`, `setNavBarHidden`
- Analytics: `track`, `pageView`
- Permission: `requestPermission`, `checkPermission`
- Lifecycle: `onResume`, `onPause`, `ready`
- Device: `getDeviceInfo`, `getAppVersion`
- iOS: `ShellBridgeModule.swift` (RN) + `H5BridgeHandler.swift` (H5)
- Android: `ShellBridgeModule.kt` (RN) + `H5BridgeInterface.kt` (H5)
- H5 standalone fallback to browser APIs when not in shell

#### iOS Native Screens
- Profile screen with avatar, user info, menu sections, guest state
- Login screen (OTP + password modes) with native UI
- Settings screen with appearance mode (light/dark/system)
- `APIClient.swift` — async/await HTTP client with auth header injection

#### Design System
- `@notiving/design-tokens` package with CSS variables (`--nv-*`), Tailwind v4 `@theme`, TypeScript constants
- Orange-500 (`#f97316`) primary brand color, clean minimal aesthetic
- Light + dark mode via `prefers-color-scheme`, semantic color tokens
- System font stack, 4px spacing grid, consistent radius/shadow tokens

#### Deeplink
- Custom scheme `notiving://` for in-app navigation and OAuth callback
- iOS `DeepLinkHandler.swift` + `onOpenURL` modifier
- Android `DeepLinkHandler.kt` + intent-filter in manifest

### Added - API Foundation (2026-04-21)

#### Security Hardening
- JWT secrets enforced in production (no fallback to dev defaults)
- CORS whitelist via `CORS_ORIGIN` environment variable
- Rate limiting on auth endpoints (10 req/60s)
- Refresh token rotation with database-backed token versioning
- Fixed TOCTOU race condition in user registration
- Removed email from public user API responses
- Self-referencing FK constraint on `comments.parentId`

#### API Architecture
- Modular structure: `modules/{resource}/` with `route.ts`, `service.ts`, `repository.ts`, `schema.ts`
- Middleware stack: requestId, requestLogger, CORS, deviceDetect, authGuard, rateLimiter, errorHandler
- Cursor-based pagination helper
- Standard API response envelope (`{ success, data, error }`)
- Structured logging with child loggers per request
- `X-Request-ID` header for request tracing
- `X-Device-Type` header detection (web/ios/android/harmony/flutter)

#### Infrastructure
- Centralized env validation with Zod (`src/config/env.ts`)
- `@notiving/shared` package with types, schemas, and API client
- GitHub Actions CI (lint, type-check, test, build)
- Vitest testing framework
- Drizzle Kit migrations
- Health check endpoint with DB connectivity status

#### Documentation
- API docs with Scalar UI at `/docs`
- OpenAPI 3.1 spec at `/docs/openapi.json`
- Architecture doc: `docs/architecture/native-shell.md`
- Deeplink spec: `docs/deeplink.md`
- Deploy guide: `docs/deploy.md`
- Vertical slice task decomposition rules

### Changed
- API refactored from handler layer to repository + service layers
- TypeScript target ES2022 → ES2023
- `console.log/error` replaced with structured logger
- Domain switched to `notiving.com`

### Fixed
- Registration endpoint handles concurrent requests correctly
- Error handler uses proper `ContentfulStatusCode` type
- Drizzle config uses runtime validation instead of non-null assertion
- h5/shared tsc errors in `bridge.ts` and `client.ts`

## Database Schema

6 tables: `users`, `posts`, `comments`, `accounts`, `oauth_states`, `email_verification_codes`

Migration:

```bash
pnpm --filter @notiving/api db:generate
pnpm --filter @notiving/api db:migrate
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-min-16-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-16-chars

# Optional
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
NODE_ENV=development
PORT=3001

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...
OAUTH_REDIRECT_BASE_URL=...
```
