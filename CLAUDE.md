# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Database

- `pnpm db:up` - Start PostgreSQL database with Docker
- `pnpm db:init` - Initialize database schema
- `pnpm db:push` - Push schema changes
- `pnpm db:studio` - Open Drizzle Studio for database management

### Code Quality

- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome
- `pnpm check` - Run both lint and format checks
- `pnpm test` - Run Vitest tests

## Architecture Overview

OptiBody is a health and fitness calculator application built with:

- **TanStack Start** - React SSR framework with file-based routing
- **PostgreSQL + Drizzle ORM** - Database with type-safe queries
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

- Uses Lucia Auth v3 with PostgreSQL adapter
- API endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Protected routes check authentication and redirect to login
- Sessions stored in PostgreSQL with 30-day duration

### Health Calculations

The app calculates:

- **BMR** (Basal Metabolic Rate) using Mifflin-St Jeor equation
- **TDEE** (Total Daily Energy Expenditure) based on activity level
- Supports multiple calculation formulas through extensible architecture

### Development Setup

1. Start PostgreSQL: `pnpm db:up`
2. Initialize database: `pnpm db:init`
3. Start dev server: `pnpm dev`
4. Default database credentials are in `docker-compose.yml`

### API Development

- File-based API routes in `src/routes/api.*`
- TRPC router in `src/integrations/trpc/router.ts`
- Use `createAPIFileRoute` for new API endpoints
- Authentication middleware available via `lucia.ts`
