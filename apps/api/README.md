# Notiving API

REST API for Notiving - your space to share and connect.

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL
docker-compose up -d

# Run migrations
pnpm db:push

# Start dev server
pnpm dev
```

Server runs at `http://localhost:3001`

## API Documentation

Interactive API documentation powered by Scalar:

**📚 [http://localhost:3001/docs](http://localhost:3001/docs)**

- Modern, beautiful UI
- Try API calls directly from the browser
- OpenAPI 3.1 spec available at `/docs/openapi.json`

## Development

```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Build for production
pnpm start        # Run production build
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Lint code
pnpm lint:fix     # Fix linting issues
```

## Database

```bash
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema changes (dev only)
pnpm db:studio    # Open Drizzle Studio
```

## Tech Stack

- **Runtime**: Node.js 24 / Cloudflare Workers (dual entry)
- **Framework**: Hono
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Auth**: JWT (jose) + bcrypt + Google/Apple OAuth (arctic)
- **Testing**: Vitest
- **Linting**: Biome
- **Docs**: Scalar (OpenAPI 3.1)

## Deploy

Cloudflare Workers at `api.notiving.com`:

```bash
pnpm deploy    # wrangler deploy
```

## Security Features

- JWT-based authentication with refresh token rotation
- Password hashing with bcrypt (cost factor 12)
- Google + Apple OAuth with CSRF protection (state + PKCE)
- Email OTP verification with rate limiting and attempt tracking
- CORS whitelist configuration
- Rate limiting on auth endpoints (10 req/min)
- Input validation with Zod schemas
- SQL injection protection via Drizzle ORM
- Device-aware auth (httpOnly cookies for web, tokens for native)

## License

Private
