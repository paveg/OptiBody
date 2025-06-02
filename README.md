# OptiBody

A health and fitness calculator application that helps you track your body metrics and calculate BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure).

## 🚀 Tech Stack

- **[TanStack Start](https://tanstack.com/start)** - React SSR framework with file-based routing
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** + **[Drizzle ORM](https://orm.drizzle.team/)** - Edge SQLite database with type-safe queries
- **[Lucia Auth](https://lucia-auth.com/)** - Authentication with PBKDF2-SHA256 password hashing
- **[tRPC](https://trpc.io/)** + **[TanStack Query](https://tanstack.com/query)** - Type-safe API and data fetching
- **[Tailwind CSS](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)** - Styling and UI components
- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[Biome](https://biomejs.dev/)** - Fast formatter and linter

## 📋 Prerequisites

- Node.js 18+ 
- pnpm package manager
- Cloudflare account (for production deployment)

## 🛠️ Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/paveg/optibody.git
cd optibody

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server with D1 database (recommended)
pnpm dev

# Alternative: UI-only development (no database)
pnpm dev:ui
```

The development server runs at http://localhost:3000

### Building for Production

```bash
# Build the application
pnpm build

# Run production build locally
pnpm start
```

## 🗄️ Database Management

This project uses Cloudflare D1 (SQLite) with Drizzle ORM.

```bash
# Generate schema migrations
pnpm db:generate

# Push schema changes to D1
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Initialize local D1 database
pnpm db:init:local
```

## 🧪 Testing & Code Quality

```bash
# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Run both lint and format checks
pnpm check
```

## 🔐 Authentication

OptiBody uses Lucia Auth v3 for authentication:

- Session-based authentication (30-day expiration)
- PBKDF2-SHA256 password hashing (100,000 iterations)
- Auth endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`

## 📊 Features

### Health Calculators
- **BMR (Basal Metabolic Rate)** - Calories burned at rest using Mifflin-St Jeor equation
- **TDEE (Total Daily Energy Expenditure)** - Total calories burned based on activity level

### User Management
- User registration and login
- Profile management with health metrics
- Secure session handling

## 📁 Project Structure

```
src/
├── routes/              # File-based routes (pages and API endpoints)
├── lib/                 # Core business logic
│   ├── auth.ts         # Lucia authentication setup
│   ├── database.ts     # Drizzle database connection
│   ├── database/
│   │   └── schema.ts   # Database schema definitions
│   ├── health-calculators.ts  # BMR/TDEE calculations
│   └── env.ts          # Environment configuration
├── components/          # React components and UI
├── integrations/        # tRPC and TanStack Query setup
└── hooks/              # Custom React hooks
```

## 🚀 Deployment

### Environment Variables

Required for production:

- `SESSION_SECRET` - Secure session signing key (32+ characters)
- `NODE_ENV` - Set to "production"

### Cloudflare Pages

This project is designed to deploy on Cloudflare Pages:

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Configure environment variables in Cloudflare Pages settings
5. Deploy!

### Database Setup

1. Create a D1 database in Cloudflare Dashboard
2. Update `wrangler.toml` with your database binding
3. Run `pnpm db:push` to apply schema to production

## 🛡️ Security

- Session cookies with secure flag in production
- Password hashing with PBKDF2-SHA256
- Environment variable validation
- HTTPS enforced via Cloudflare

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

## 📝 License

This project is open source. See the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open a GitHub issue.