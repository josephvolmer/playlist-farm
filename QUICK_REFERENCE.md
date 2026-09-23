# Quick Reference Card

## Project Commands

### Start/Stop Services
```bash
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose restart        # Restart all services
docker compose ps             # Check status
```

### View Logs
```bash
docker compose logs -f                # All services
docker compose logs -f app            # App only
docker compose logs -f worker         # Worker only
docker compose logs -f database       # Database only
```

### Build/Rebuild
```bash
docker compose up -d --build          # Rebuild and start
docker compose build --no-cache       # Force clean build
```

## Configuration

### Change Worker Schedule
```bash
# 1. Edit config.json
vim config.json
# Change: "schedule": "0 */2 * * *"

# 2. Restart worker
docker compose restart worker

# 3. Verify
docker compose logs worker | grep schedule
```

### Common Schedules
```
0 */6 * * *     # Every 6 hours (default)
0 */2 * * *     # Every 2 hours
0 0 * * *       # Daily at midnight
*/30 * * * *    # Every 30 minutes
0 */1 * * *     # Every hour
```

### Disable Worker
```json
{
  "worker": {
    "sync": { "enabled": false }
  }
}
```

### Enable Maintenance Mode
```json
{
  "maintenance": {
    "enabled": true,
    "message": "Back soon!"
  }
}
```

## Database

### Run Migrations
```bash
docker compose exec app npx prisma migrate deploy
```

### View Database
```bash
cd playlist-farm-app
pnpm prisma studio
```

### Backup Database
```bash
docker compose exec database pg_dump -U musicplatform musicplatform > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker compose exec -T database psql -U musicplatform musicplatform
```

## Worker

### Run Worker Manually
```bash
docker compose exec worker tsx sync-playlists.ts
```

### Check Worker Schedule
```bash
docker compose exec worker cat /app/crontab
```

### View Worker Config
```bash
docker compose exec worker cat /config/config.json | jq '.worker'
```

## Development

### App Development
```bash
cd playlist-farm-app
pnpm install
pnpm dev                    # Start dev server (http://localhost:3000)
pnpm build                  # Build for production
pnpm lint                   # Run linter
```

### Worker Development
```bash
cd playlist-farm-worker
pnpm install
pnpm sync                   # Run sync manually
```

### Python Tools
```bash
cd playlist-farm-tool
pip install -e .
playlist-farm-tui           # Launch TUI
playlist-farm --help        # CLI help
```

## Files

### Configuration
- `config.json` - Main settings
- `.env` - Secrets and environment vars
- `docker-compose.yml` - Service orchestration

### Documentation
- `README.md` - Main overview
- `CONFIG.md` - Configuration guide
- `ARCHITECTURE.md` - System architecture
- `QUICK_REFERENCE.md` - This file

### Dockerfiles
- `Dockerfile.app` - Next.js app image
- `Dockerfile.worker` - Worker image
- `docker-compose.yml` - Orchestration

## Troubleshooting

### Service Won't Start
```bash
docker compose ps              # Check status
docker compose logs <service>  # Check logs
docker compose down && docker compose up -d --build
```

### Database Connection Error
```bash
# Check database is running
docker compose ps database

# Check connection string
docker compose exec app printenv DATABASE_URL
```

### Worker Not Syncing
```bash
# Check if enabled
docker compose exec worker cat /config/config.json | jq '.worker.sync.enabled'

# Check schedule
docker compose exec worker cat /app/crontab

# Run manually
docker compose exec worker tsx sync-playlists.ts
```

### Config Not Updating
```bash
# Validate JSON
cat config.json | jq .

# Restart services
docker compose restart

# Check mounted config
docker compose exec worker cat /config/config.json
```

## URLs

### Local Development
- App: http://localhost:3000
- Database: localhost:5432

### Docker Services
- App container: `musicplatform-app`
- Worker container: `musicplatform-worker`
- Database container: `musicplatform-db`

## Environment Files

### .env (Secrets)
```bash
DATABASE_URL=...
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
SPOTIFY_CLIENT_ID=...
STRIPE_SECRET_KEY=...
```

### config.json (Settings)
```json
{
  "worker": { "sync": { "schedule": "..." } },
  "app": { "features": { ... } }
}
```

## Validation

### Check Config Syntax
```bash
cat config.json | jq .
```

### Validate Docker Compose
```bash
docker compose config --quiet
```

### Test TypeScript
```bash
cd playlist-farm-app
pnpm tsc --noEmit
```

## Monitoring

### Resource Usage
```bash
docker stats
```

### Disk Space
```bash
docker system df
```

### Clean Up
```bash
docker system prune -a          # Clean all unused
docker volume prune             # Clean volumes
```

## Quick Fixes

### Reset Everything
```bash
docker compose down -v
docker compose up -d --build
```

### Fresh Database
```bash
docker compose down -v
docker compose up -d database
docker compose exec app npx prisma migrate deploy
```

### Rebuild Single Service
```bash
docker compose up -d --build app
docker compose up -d --build worker
```

## Cron Schedule Format

```
 ┌─ minute (0-59)
 │ ┌─ hour (0-23)
 │ │ ┌─ day of month (1-31)
 │ │ │ ┌─ month (1-12)
 │ │ │ │ ┌─ day of week (0-6)
 * * * * *
```

## File Sizes

- 1 MB = 1,048,576 bytes
- 5 MB = 5,242,880 bytes
- 10 MB = 10,485,760 bytes

## Time Units

- 1 hour = 3,600 seconds = 3,600,000 ms
- 1 day = 86,400 seconds = 86,400,000 ms
- 30 days = 2,592,000 seconds

## Getting Help

1. Check logs: `docker compose logs <service>`
2. Review docs in project root
3. Validate config: `cat config.json | jq .`
4. Check GitHub issues
