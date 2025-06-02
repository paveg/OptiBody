# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `pnpm dev` - Start development server with D1 database (recommended)
- `pnpm dev:ui` - Start UI-only development server (no database access)
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Database

- `pnpm db:generate` - Generate Drizzle schema migrations for D1
- `pnpm db:push` - Push schema changes to D1 database  
- `pnpm db:studio` - Open Drizzle Studio for local database inspection
- `pnpm db:init:local` - Initialize local D1 database with schema

### Code Quality

- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome
- `pnpm check` - Run both lint and format checks
- `pnpm test` - Run Vitest tests

## Architecture Overview

OptiBody is a health and fitness calculator application built with:

- **TanStack Start** - React SSR framework with file-based routing
- **Cloudflare D1 + Drizzle ORM** - SQLite edge database with type-safe queries
- **Lucia Auth** - Authentication with Argon2 password hashing
- **TRPC + TanStack Query** - Type-safe API and data fetching
- **Tailwind CSS + shadcn/ui** - Styling and UI components

### Key Directories

- `src/routes/` - File-based routes (pages and API endpoints)
- `src/lib/` - Core business logic and utilities
  - `auth.ts` - Lucia authentication setup
  - `database.ts` - Drizzle database connection
  - `health-calculators.ts` - BMR/TDEE calculation logic
  - `env.ts` - Environment configuration with validation
- `src/components/` - React components and UI primitives
- `src/integrations/` - TRPC and TanStack Query setup

### Database Schema

Three main tables:

1. `users` - User accounts with email/username authentication
2. `sessions` - Lucia auth sessions (30-day expiration)
3. `user_metrics` - User health data (height, weight, age, gender, activity level)

### Authentication Flow

- Uses Lucia Auth v3 with Cloudflare D1 adapter
- API endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Protected routes check authentication and redirect to login
- Sessions stored in Cloudflare D1 with 30-day duration

### Health Calculations

The app calculates:

- **BMR** (Basal Metabolic Rate) using Mifflin-St Jeor equation
- **TDEE** (Total Daily Energy Expenditure) based on activity level
- Supports multiple calculation formulas through extensible architecture

### Development Setup

#### Local Development

**Primary Development (Recommended):**
```bash
pnpm dev  # One command - builds and starts with D1 database access
```

**Alternative Development Options:**
- `pnpm dev:ui` - UI-only development (fast, but no database access)
- `pnpm start` - Production server (requires `pnpm build` first)

#### When to use each:
- **`pnpm dev`**: Full-stack development with auth, database (recommended for most work)
- **`pnpm dev:ui`**: Rapid UI development, styling, components without database needs
- **`pnpm start`**: Testing production build locally

#### Development Notes:
- `pnpm dev` now automatically initializes D1 database, builds, and serves with full database access
- Authentication features (signup/login) work out of the box
- Server runs on http://localhost:3000
- Database schema is automatically created on first run
- For rapid iteration on UI-only changes, use `pnpm dev:ui` for faster startup

### Database Schema Development Workflow

When making schema changes to Cloudflare D1:

1. **Modify Schema**: Edit `src/lib/database/schema.ts` with your changes
2. **Generate Migration**: Run `pnpm db:generate` to create migration files
3. **Apply to Production**: Run `pnpm db:push` to apply changes to remote D1 database
4. **Verify Changes**: Use `pnpm db:studio` to inspect the database schema
5. **Deploy**: Push code changes to trigger Cloudflare Pages deployment

**Important Notes:**
- D1 uses SQLite syntax, so ensure schema changes are SQLite-compatible
- Always test schema changes in preview environment before production
- Migration files are generated in `./drizzle/` directory
- Use `drizzle.config.ts` for remote D1 database configuration

### API Development

- File-based API routes in `src/routes/api.*`
- TRPC router in `src/integrations/trpc/router.ts`
- Use `createAPIFileRoute` for new API endpoints
- Authentication middleware available via `lucia.ts`
