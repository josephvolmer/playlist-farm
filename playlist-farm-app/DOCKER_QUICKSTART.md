# Docker Quick Start

Quick reference for running the application with Docker Compose.

## Setup (First Time)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your values (REQUIRED!)
nano .env

# 3. Start everything
docker compose up -d

# 4. View logs to ensure everything started
docker compose logs -f
```

Application available at: http://localhost:3000

## Daily Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose stop

# View logs
docker compose logs -f

# Restart after code changes
docker compose up -d --build

# Stop and remove everything (database data persists)
docker compose down
```

## Three Containers

1. **database** - PostgreSQL on port 5432
2. **app** - Next.js app on port 3000
3. **worker** - Playlist sync (runs every 6 hours)

## Common Tasks

### View Worker Logs
```bash
docker compose logs -f worker
```

### Manually Run Playlist Sync
```bash
docker compose exec worker tsx workers/sync-playlists.ts
```

### Access Database
```bash
docker compose exec database psql -U musicplatform -d musicplatform
```

### Restart Single Service
```bash
docker compose restart app
```

### View Container Status
```bash
docker compose ps
```

## Troubleshooting

```bash
# Check what's wrong
docker compose logs app
docker compose logs database
docker compose logs worker

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Full Documentation

See `DOCKER_DEPLOYMENT.md` for complete documentation.
