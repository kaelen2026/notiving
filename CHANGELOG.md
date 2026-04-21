# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - Security & Infrastructure (2026-04-21)

#### Security Hardening
- JWT secrets now enforced in production environment (no fallback to dev defaults)
- CORS whitelist configuration via `CORS_ORIGIN` environment variable
- Rate limiting on authentication endpoints (10 requests per 60 seconds)
- Refresh token rotation mechanism with database-backed token versioning
- Fixed TOCTOU race condition in user registration
- Removed email addresses from public user API responses
- Added self-referencing foreign key constraint on `comments.parentId`

#### Infrastructure
- Centralized environment variable validation using Zod (`src/config/env.ts`)
- Structured logging with Pino (JSON in production, pretty-print in development)
- Shared package `@notiving/shared` with types, schemas, and API client
- GitHub Actions CI/CD pipeline (lint, type-check, test, build)
- Vitest testing framework with 6+ test cases
- Database migrations with Drizzle Kit
- Enhanced health check endpoint with database connection status

#### Documentation
- Modern API documentation with Scalar UI at `/docs`
- OpenAPI 3.1 specification at `/docs/openapi.json`
- Comprehensive API README with quick start guide
- All endpoints documented (auth, users, posts, comments, health)

#### Developer Experience
- Frontend API client integration example (h5 app)
- Type-safe API client exported from shared package
- Improved code formatting and import/export ordering
- Better error messages and validation feedback

### Changed
- Moved `dotenv/config` import to entry point (`index.ts`)
- Updated TypeScript target from ES2022 to ES2023
- Replaced `console.log/error` with structured logger
- Authorization checks now use explicit `return` statements

### Fixed
- Registration endpoint now handles concurrent requests correctly
- Error handler now uses proper `ContentfulStatusCode` type
- Drizzle config uses runtime validation instead of non-null assertion
- Web app metadata updated from default template values

## Commits

1. `bb5cdda` - Security hardening, bug fixes, and config cleanup
2. `46855d6` - Centralize env validation with Zod
3. `40175b2` - Add shared package, tests, and CI/CD
4. `83e6165` - Add API client and fix code formatting
5. `dbcf11e` - Add modern API documentation with Scalar
6. `cf3e2e8` - Refresh token rotation, structured logging, and frontend integration

## Migration Guide

### Database Migration

Run the migration to add `token_version` column:

```bash
cd apps/api
pnpm db:migrate
```

Or for development:

```bash
pnpm db:push
```

### Environment Variables

Update your `.env` file with new required variables:

```bash
# Required (min 16 characters)
JWT_SECRET=your-secret-here-min-16-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-16-chars

# Optional (comma-separated origins)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Optional (defaults shown)
NODE_ENV=development
PORT=3001
```

### Breaking Changes

- Refresh tokens now rotate on each use - old tokens become invalid
- Public user endpoints no longer return email addresses
- JWT secrets must be at least 16 characters in production

## Statistics

- **Security Issues Fixed**: 6
- **New Features**: 10+
- **Test Coverage**: 12 test cases
- **Code Changes**: ~2200 lines
- **Commits**: 6
