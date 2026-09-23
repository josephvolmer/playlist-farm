# Playlist Farm Platform

A complete music platform with playlist curation, artist pitching, and automated playlist syncing.

## Architecture

This is a monorepo containing three main components:

```
playlist-farm/
├── playlist-farm-app/      # Next.js web application
├── playlist-farm-worker/   # Background worker for playlist syncing
├── playlist-farm-tool/     # Python CLI/TUI tools for playlist scraping
├── Dockerfile.app          # Docker configuration for Next.js app
├── Dockerfile.worker       # Docker configuration for worker
└── docker-compose.yml      # Orchestration for all services
```

## Components

### 1. Next.js App (`playlist-farm-app/`)

The main web application built with:
- **Next.js 16** - React framework
- **NextAuth** - Authentication (Google OAuth, Spotify)
- **Prisma** - Database ORM
- **Stripe** - Payment processing
- **Tailwind CSS** - Styling

Features:
- User authentication and authorization
- Playlist browsing and search
- Artist pitch submission system
- Admin dashboard for playlist curation
- Email notifications

### 2. Background Worker (`playlist-farm-worker/`)

Automated service that:
- Runs on a cron schedule (every 6 hours)
- Fetches playlists from playlist-farm API
- Updates the database with new playlists
- Preserves manual edits to existing playlists

Built with:
- Node.js + TypeScript
- Prisma (shared schema with app)
- Supercronic for container-friendly cron jobs

### 3. Python Tools (`playlist-farm-tool/`)

Command-line and TUI tools for:
- Scraping Spotify playlists
- Collecting curator contact information
- Analyzing playlist data
- Database management

Built with:
- Python 3.8+
- Textual (TUI framework)
- Rich (terminal formatting)

## Database

PostgreSQL database shared by both the app and worker:

- **Schema**: Defined in `playlist-farm-app/prisma/schema.prisma`
- **Migrations**: Managed by Prisma
- **Models**: Users, Playlists, Pitches, Sessions, etc.

## Configuration

The project uses a centralized `config.json` file for global settings including:
- Worker sync schedules (change from default 6 hours)
- Application features and limits
- Database settings
- Security policies

**See [CONFIG.md](./CONFIG.md) for complete configuration guide.**

Quick example - change sync schedule:
```json
// config.json
{
  "worker": {
    "sync": {
      "schedule": "0 */2 * * *",  // Every 2 hours instead of 6
      "enabled": true
    }
  }
}
```

Then restart: `docker compose restart worker`

## Quick Start

### Development (Local)

1. **Install dependencies:**
   ```bash
   # App
   cd playlist-farm-app
   pnpm install

   # Worker
   cd ../playlist-farm-worker
   pnpm install

   # Python tools
   cd ../playlist-farm-tool
   pip install -e .
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Set up database:**
   ```bash
   cd playlist-farm-app
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

4. **Run development servers:**
   ```bash
   # App (in playlist-farm-app/)
   pnpm dev

   # Worker (in playlist-farm-worker/)
   pnpm sync  # Run once manually
   ```

### Production (Docker)

1. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with production credentials
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

Services:
- **App**: http://localhost:3000
- **Database**: PostgreSQL on port 5432
- **Worker**: Runs in background

## Environment Variables

See `.env.example` for all required variables:

- **Database**: `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **Authentication**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Spotify**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Email**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- **Worker**: `PLAYLIST_FARM_API_URL`

## Docker Services

### Database
- Image: `postgres:16-alpine`
- Port: 5432
- Volume: `postgres_data`
- Healthcheck enabled

### App
- Build: `playlist-farm-app/` with `Dockerfile.app`
- Port: 3000
- Depends on: database
- Auto-runs migrations on startup

### Worker
- Build: `playlist-farm-worker/` with `Dockerfile.worker`
- No exposed ports
- Depends on: database
- Runs sync every 6 hours via supercronic

## Useful Commands

### Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service_name]

# Run migrations manually
docker-compose exec app npx prisma migrate deploy

# Run worker sync manually
docker-compose exec worker tsx sync-playlists.ts
```

### Local Development

```bash
# App
cd playlist-farm-app
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm lint             # Run linter
pnpm prisma studio    # Open database GUI

# Worker
cd playlist-farm-worker
pnpm sync             # Run sync manually

# Python Tools
playlist-farm-tui     # Launch TUI
playlist-farm --help  # CLI help
```

## Project Structure Details

### Shared Resources

- **Prisma Schema**: `playlist-farm-app/prisma/schema.prisma` (copied to worker during build)
- **Environment**: `.env` at root (used by all services)
- **Docker Compose**: `docker-compose.yml` orchestrates all services

### Independent Components

Each component has its own:
- `package.json` (app & worker) or `pyproject.toml` (tool)
- `.dockerignore` for optimized builds
- Dependencies and build process

## Documentation

- **Configuration Guide**: See `CONFIG.md` - **Start here for settings**
- **Architecture Overview**: See `ARCHITECTURE.md`
- **App Setup**: See `playlist-farm-app/README.md`
- **Spotify Integration**: See `playlist-farm-app/SPOTIFY_SETUP.md`
- **Docker Deployment**: See `playlist-farm-app/DOCKER_DEPLOYMENT.md`
- **Cron Setup**: See `playlist-farm-app/CRON_SETUP.md`
- **Python Tools**: See `playlist-farm-tool/README.md`

## Contributing

1. Make changes in the appropriate component directory
2. Test locally before building Docker images
3. Update documentation as needed
4. Run linters and tests

## License

MIT
