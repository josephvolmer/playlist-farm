# Docker Deployment Guide

This guide explains how to deploy the application using Docker Compose with three separate containers: Next.js app, PostgreSQL database, and playlist sync worker.

## Architecture

The Docker Compose stack includes:

1. **`database`** - PostgreSQL 16 database with persistent storage
2. **`app`** - Next.js application running in production mode
3. **`worker`** - Scheduled worker that syncs playlists from playlist-farm API every 6 hours

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2+
- Git

## Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone <your-repo-url>
cd magicnothing.xyz

# Copy environment file
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### 2. Required Environment Variables

Edit `.env` and set these required variables:

```env
# Database (Docker)
POSTGRES_USER=musicplatform
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=musicplatform

# NextAuth (REQUIRED - generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Admin Users (comma-separated)
ADMIN_USERS=admin@example.com,admin2@example.com

# Playlist Farm API
PLAYLIST_FARM_API_URL=https://your-playlist-farm-api.com/playlists
```

### 3. Build and Start

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f database
```

The application will be available at:
- **App**: http://localhost:3000
- **Database**: localhost:5432

### 4. Initial Database Setup

The database migrations run automatically when the app container starts. If you need to run them manually:

```bash
docker compose exec app npx prisma migrate deploy
```

## Management Commands

### View Status

```bash
# Check running containers
docker compose ps

# View resource usage
docker compose stats
```

### Stop Services

```bash
# Stop all services
docker compose stop

# Stop and remove containers (data persists)
docker compose down

# Stop and remove containers AND volumes (deletes database!)
docker compose down -v
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart app
docker compose restart worker
```

### View Logs

```bash
# All services
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs -f worker
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker compose up -d --build

# Force rebuild without cache
docker compose build --no-cache
docker compose up -d
```

## Worker Configuration

The playlist sync worker runs automatically every 6 hours. It:

- Fetches playlists from `PLAYLIST_FARM_API_URL`
- Adds new playlists to the database
- Skips existing playlists to preserve manual edits
- Logs all sync activity

### View Worker Logs

```bash
# Real-time worker logs
docker compose logs -f worker

# Last sync result
docker compose logs --tail=50 worker
```

### Manually Trigger Sync

```bash
# Run sync immediately
docker compose exec worker tsx workers/sync-playlists.ts
```

### Change Sync Schedule

Edit `Dockerfile.worker` and change the cron schedule:

```dockerfile
# Current: Every 6 hours (0 */6 * * *)
RUN echo '0 */6 * * * cd /app && tsx workers/sync-playlists.ts >> /var/log/cron.log 2>&1' > /app/crontab

# Examples:
# Every hour: 0 * * * *
# Every 12 hours: 0 */12 * * *
# Daily at 3am: 0 3 * * *
# Every 30 minutes: */30 * * * *
```

Then rebuild:

```bash
docker compose up -d --build worker
```

## Database Management

### Access Database

```bash
# PostgreSQL CLI
docker compose exec database psql -U musicplatform -d musicplatform

# Run SQL query
docker compose exec database psql -U musicplatform -d musicplatform -c "SELECT COUNT(*) FROM \"CuratedPlaylist\";"
```

### Backup Database

```bash
# Create backup
docker compose exec database pg_dump -U musicplatform musicplatform > backup.sql

# Restore backup
docker compose exec -T database psql -U musicplatform -d musicplatform < backup.sql
```

### Reset Database

```bash
# WARNING: This deletes all data!
docker compose down -v
docker compose up -d
```

## Production Deployment

### 1. Use Production Domain

Update `.env`:

```env
NEXTAUTH_URL=https://yourdomain.com
SPOTIFY_REDIRECT_URI=https://yourdomain.com/api/auth/callback/spotify
```

### 2. Secure Database

Change default database password:

```env
POSTGRES_PASSWORD=use-a-strong-random-password
```

### 3. Use Reverse Proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Enable HTTPS

Use Certbot to get SSL certificate:

```bash
sudo certbot --nginx -d yourdomain.com
```

### 5. Restrict Database Port

Remove database port exposure in `docker-compose.yml`:

```yaml
database:
  # Remove or comment out:
  # ports:
  #   - "5432:5432"
```

The database will still be accessible to other containers via Docker's internal network.

### 6. Set Up Monitoring

```bash
# Monitor container health
docker compose ps

# Set up restart policy (already configured as 'unless-stopped')
# Containers will auto-restart on failure
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs app
docker compose logs database
docker compose logs worker

# Check container status
docker compose ps
```

### Database Connection Issues

```bash
# Verify database is healthy
docker compose ps database

# Test connection
docker compose exec database pg_isready -U musicplatform

# Check database logs
docker compose logs database
```

### App Can't Connect to Database

1. Ensure database is healthy: `docker compose ps database`
2. Check `DATABASE_URL` in `.env` is NOT set (docker-compose handles it)
3. Verify containers are on same network: `docker network inspect magicnothing_default`

### Worker Not Running

```bash
# Check worker logs
docker compose logs worker

# Verify worker is running
docker compose ps worker

# Manually test sync
docker compose exec worker tsx workers/sync-playlists.ts
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

### Port Already in Use

If port 3000 or 5432 is already in use, change in `docker-compose.yml`:

```yaml
app:
  ports:
    - "8080:3000"  # Use port 8080 instead

database:
  ports:
    - "5433:5432"  # Use port 5433 instead
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# Run migrations if needed
docker compose exec app npx prisma migrate deploy
```

## Performance Tuning

### Increase Database Resources

Edit `docker-compose.yml`:

```yaml
database:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

### Scale Workers (Optional)

If you need multiple worker instances:

```bash
docker compose up -d --scale worker=3
```

## Security Checklist

- [ ] Changed default `POSTGRES_PASSWORD`
- [ ] Generated secure `NEXTAUTH_SECRET` (32+ chars)
- [ ] Restricted database port exposure in production
- [ ] Using HTTPS with valid SSL certificate
- [ ] Set `ADMIN_USERS` to actual admin emails
- [ ] Kept `.env` file secure (not committed to git)
- [ ] Set up regular database backups
- [ ] Using strong Stripe webhook secret
- [ ] Validated all OAuth redirect URIs

## Support

For issues:
1. Check logs: `docker compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all required services are running: `docker compose ps`
4. Check Docker disk space: `df -h`
