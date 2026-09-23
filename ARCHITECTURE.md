# Playlist Farm - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App (Port 3000)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • Authentication (NextAuth)                               │ │
│  │  • Playlist Browsing & Search                              │ │
│  │  • Artist Pitch Submission                                 │ │
│  │  • Admin Dashboard                                         │ │
│  │  • Payment Processing (Stripe)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Prisma ORM
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               PostgreSQL Database (Port 5432)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Tables:                                                   │ │
│  │  • users, accounts, sessions                               │ │
│  │  • curated_playlists                                       │ │
│  │  • playlist_pitches                                        │ │
│  │  • And more...                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           ▲
                           │ Prisma ORM
┌──────────────────────────┴──────────────────────────────────────┐
│              Background Worker (Cron: */6 hours)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • Fetches playlists from API                              │ │
│  │  • Updates database with new playlists                     │ │
│  │  • Preserves manual edits                                  │ │
│  │  • Runs via supercronic                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP
                           ▼
                  ┌────────────────────┐
                  │  Playlist Farm API │
                  │  (External)        │
                  └────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Python CLI/TUI Tools (Local/Standalone)             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • Spotify playlist scraping                               │ │
│  │  • Curator contact collection                              │ │
│  │  • Playlist analysis                                       │ │
│  │  • Database management utilities                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Next.js Application
- **Location**: `playlist-farm-app/`
- **Technology**: Next.js 16, React 19, TypeScript
- **Port**: 3000
- **Dockerfile**: `Dockerfile.app` (multi-stage build)
- **Dependencies**:
  - NextAuth for authentication
  - Prisma for database access
  - Stripe for payments
  - Radix UI for components

**Key Features**:
- Server-side rendering
- API routes for backend logic
- OAuth integration (Google, Spotify)
- Payment processing
- Email notifications

### 2. PostgreSQL Database
- **Container**: postgres:16-alpine
- **Port**: 5432
- **Volume**: postgres_data (persistent storage)
- **Schema**: Managed by Prisma migrations

**Health Check**: Ensures database is ready before app/worker start

### 3. Background Worker
- **Location**: `playlist-farm-worker/`
- **Technology**: Node.js, TypeScript, tsx
- **Dockerfile**: `Dockerfile.worker`
- **Schedule**: Every 6 hours (configurable in Dockerfile.worker)
- **Job Runner**: supercronic (container-friendly cron)

**Workflow**:
1. Cron triggers sync script
2. Fetch playlists from PLAYLIST_FARM_API_URL
3. Check each playlist against database
4. Insert new playlists only (skip existing)
5. Log results to stdout

### 4. Python Tools
- **Location**: `playlist-farm-tool/`
- **Technology**: Python 3.8+, Textual, Rich
- **Installation**: `pip install -e .`
- **Executables**:
  - `playlist-farm` - CLI tool
  - `playlist-farm-tui` - Interactive TUI
  - `playlist-farm-analyze` - Data analysis
  - `playlist-farm-setup` - Initial setup

**Use Cases**:
- Development and testing
- One-off data operations
- Playlist research
- Not used in production containers

## Data Flow

### User Interaction Flow
```
User → Next.js App → PostgreSQL
  ↓
OAuth Provider (Google/Spotify)
  ↓
Stripe (for payments)
```

### Worker Sync Flow
```
Cron Timer → Worker Script → External API
                ↓
           PostgreSQL (insert new playlists)
```

### Development Flow
```
Developer → Python Tools → Analysis/Scraping
                ↓
           Export to Excel/JSON
                ↓
           Import via App scripts
```

## Directory Structure

```
playlist-farm/
├── .env                        # Environment configuration
├── .env.example                # Template for environment vars
├── .dockerignore               # Root-level ignore rules
├── docker-compose.yml          # Service orchestration
├── Dockerfile.app              # Next.js app build
├── Dockerfile.worker           # Worker build
├── README.md                   # Main documentation
├── ARCHITECTURE.md             # This file
│
├── playlist-farm-app/          # Next.js Application
│   ├── .dockerignore           # App-specific ignore
│   ├── package.json            # App dependencies
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (source of truth)
│   │   └── migrations/         # Database migration history
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   ├── lib/                    # Utilities and helpers
│   └── public/                 # Static assets
│
├── playlist-farm-worker/       # Background Worker
│   ├── .dockerignore           # Worker-specific ignore
│   ├── package.json            # Worker dependencies
│   ├── prisma/                 # Copy of schema (for Prisma Client)
│   └── sync-playlists.ts       # Main sync script
│
└── playlist-farm-tool/         # Python CLI/TUI
    ├── pyproject.toml          # Python project config
    ├── requirements.txt        # Python dependencies
    ├── playlist_farm/          # Python package
    │   ├── cli/                # CLI commands
    │   ├── tui/                # TUI application
    │   └── core/               # Core logic
    └── README.md               # Tool documentation
```

## Deployment Modes

### Development
- All services run locally
- App: `pnpm dev` (hot reload)
- Worker: Run manually with `pnpm sync`
- Database: Local PostgreSQL or Docker
- Python tools: Installed via pip in development mode

### Docker (Production)
- All services containerized
- App: Production build, optimized
- Worker: Runs on schedule via supercronic
- Database: PostgreSQL container with persistent volume
- Python tools: Not included in containers

## Environment Configuration

Services share environment variables from root `.env`:

**Shared**:
- `DATABASE_URL` - Both app and worker use this
- Database credentials

**App-specific**:
- NextAuth configuration
- OAuth credentials (Google, Spotify)
- Stripe keys
- SMTP settings

**Worker-specific**:
- `PLAYLIST_FARM_API_URL` - Where to fetch playlists

## Network Communication

### Docker Network
All containers communicate on the same Docker network:
- App → Database: `database:5432`
- Worker → Database: `database:5432`
- Worker → External API: via internet

### External Access
- Only the app is exposed to host: `localhost:3000`
- Database exposed for development: `localhost:5432`
- Worker has no exposed ports (background service)

## Scaling Considerations

### Current Setup
- Single instance of each service
- Suitable for small to medium traffic

### Future Scaling
- **App**: Can run multiple instances behind load balancer
- **Worker**: Can be scaled horizontally with distributed locks
- **Database**: Can add read replicas
- **Python tools**: Independent, scale on demand

## Backup Strategy

### Database
- Volume: `postgres_data` persists data
- Recommended: Regular `pg_dump` backups
- Cloud providers: Automated backups

### Configuration
- `.env` file should be backed up securely
- Never commit `.env` to git

## Security Notes

1. **Secrets**: All sensitive data in environment variables
2. **Database**: Not exposed publicly in production
3. **Authentication**: Managed by NextAuth
4. **Payments**: Handled by Stripe (PCI compliant)
5. **Docker**: Non-root users in containers

## Monitoring & Logs

### App Logs
```bash
docker compose logs -f app
```

### Worker Logs
```bash
docker compose logs -f worker
# Logs include cron execution and sync results
```

### Database Logs
```bash
docker compose logs -f database
```

## Common Operations

### Deploy Updates
```bash
git pull
docker compose up -d --build
```

### Database Migrations
```bash
# Development
cd playlist-farm-app
pnpm prisma migrate dev

# Production
docker compose exec app npx prisma migrate deploy
```

### Manual Worker Run
```bash
docker compose exec worker tsx sync-playlists.ts
```

### Database Backup
```bash
docker compose exec database pg_dump -U musicplatform musicplatform > backup.sql
```

### View Database
```bash
cd playlist-farm-app
pnpm prisma studio
```

## Technology Stack Summary

| Component | Technologies |
|-----------|-------------|
| **Frontend** | React 19, Next.js 16, Tailwind CSS, Radix UI |
| **Backend** | Next.js API Routes, NextAuth |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Worker** | Node.js, TypeScript, Supercronic |
| **Python Tools** | Python 3.8+, Textual, Rich |
| **Infrastructure** | Docker, Docker Compose |
| **Payments** | Stripe |
| **Auth** | NextAuth with Google & Spotify OAuth |
| **Email** | Nodemailer |

## Next Steps

1. Configure `.env` with your credentials
2. Run `docker compose up -d` to start all services
3. Access the app at http://localhost:3000
4. Monitor worker logs to ensure sync is working
5. Use Python tools for playlist research and data collection
