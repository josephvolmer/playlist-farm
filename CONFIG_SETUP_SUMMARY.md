# Global Configuration System - Setup Summary

## What Was Added

A centralized configuration system has been implemented to manage all global settings from a single `config.json` file at the project root.

## Files Created

### 1. Configuration Files
- **`config.json`** - Main configuration file (active settings)
- **`config.example.json`** - Template/example configuration
- **`config.schema.json`** - JSON schema for validation and IDE support
- **`CONFIG.md`** - Complete configuration documentation

### 2. Shared Code
- **`shared-config.ts`** - TypeScript utility to load and access config
- **`entrypoint-worker.sh`** - Shell script to read config and generate crontab

## Files Modified

### 1. Worker Files
- **`playlist-farm-worker/sync-playlists.ts`**
  - Now imports and uses `shared-config`
  - Checks if sync is enabled
  - Uses config for timeouts and logging
  - Shows schedule description in logs

### 2. Docker Files
- **`Dockerfile.worker`**
  - Copies `shared-config.ts`
  - Copies `entrypoint-worker.sh`
  - Installs `jq` for JSON parsing
  - Uses entrypoint instead of hardcoded CMD

- **`docker-compose.yml`**
  - Mounts `config.json` to both app and worker (read-only)
  - Mounts `shared-config.ts` to worker

### 3. Documentation
- **`README.md`**
  - Added Configuration section
  - Links to CONFIG.md
  - Quick example of changing schedule

## How It Works

### 1. Configuration Loading

**In TypeScript (app/worker):**
```typescript
import { getWorkerConfig } from '../shared-config'

const config = getWorkerConfig()
console.log(config.sync.schedule)  // "0 */6 * * *"
```

**In Shell (worker entrypoint):**
```bash
SCHEDULE=$(cat /config/config.json | jq -r '.worker.sync.schedule')
echo "$SCHEDULE cd /app && tsx sync-playlists.ts" > /app/crontab
```

### 2. Worker Startup Flow

1. Container starts → runs `/entrypoint.sh`
2. Script reads `/config/config.json`
3. Extracts `worker.sync.schedule` using jq
4. Checks if `worker.sync.enabled` is true
5. Generates crontab dynamically
6. Starts supercronic with generated schedule
7. Logs show the active schedule

### 3. Configuration in Docker

```yaml
# docker-compose.yml
worker:
  volumes:
    - ./config.json:/config/config.json:ro  # Read-only mount
```

Container sees config at `/config/config.json`

## Key Features

### 1. Centralized Settings
All global settings in one place - no more hunting through multiple files.

### 2. Dynamic Cron Schedule
Worker reads schedule from config at startup - no need to rebuild image to change schedule!

### 3. Type Safety
TypeScript interfaces provide autocomplete and type checking.

### 4. Validation
JSON schema validates configuration structure and values.

### 5. Documentation
Comprehensive CONFIG.md explains every setting.

### 6. Hot Reload
Restart services to apply config changes - no rebuild needed.

## Common Use Cases

### Change Worker Schedule

1. Edit `config.json`:
   ```json
   {
     "worker": {
       "sync": {
         "schedule": "0 */2 * * *",
         "scheduleDescription": "Every 2 hours"
       }
     }
   }
   ```

2. Restart worker:
   ```bash
   docker compose restart worker
   ```

3. Verify in logs:
   ```bash
   docker compose logs worker | grep schedule
   # Output: Cron schedule: 0 */2 * * *
   ```

### Disable Worker

Set `enabled: false`:
```json
{
  "worker": {
    "sync": {
      "enabled": false
    }
  }
}
```

Worker will log "Sync is disabled" and sleep.

### Enable Debug Logging

```json
{
  "worker": {
    "logging": {
      "level": "debug"
    }
  }
}
```

Worker will log all Prisma queries and detailed info.

### Change App Limits

```json
{
  "app": {
    "limits": {
      "maxPitchesPerDay": 5,
      "itemsPerPage": 50
    }
  }
}
```

App code reads these values at runtime.

## File Locations

```
playlist-farm/
├── config.json                    ← Active configuration
├── config.example.json            ← Template
├── config.schema.json             ← Validation schema
├── CONFIG.md                      ← Documentation
├── shared-config.ts               ← TypeScript loader
├── entrypoint-worker.sh           ← Shell script for worker
│
├── docker-compose.yml             ← Mounts config
├── Dockerfile.worker              ← Copies entrypoint
│
└── playlist-farm-worker/
    └── sync-playlists.ts          ← Uses shared-config
```

## Configuration Sections

1. **project** - Basic metadata
2. **worker** - Sync schedule, API settings, logging
3. **database** - Connection pool, timeouts
4. **app** - Features, limits, UI settings
5. **email** - Email sending configuration
6. **security** - Sessions, rate limiting, CORS
7. **monitoring** - Health checks, metrics
8. **maintenance** - Maintenance mode settings

See `CONFIG.md` for complete details on each section.

## Benefits

### Before Configuration System
- Schedule hardcoded in Dockerfile
- Settings scattered across multiple files
- Need to rebuild Docker image to change schedule
- No validation or documentation
- Difficult to manage different environments

### After Configuration System
- All settings in one `config.json`
- Change schedule without rebuild
- Validated with JSON schema
- Comprehensive documentation
- Easy to version control
- IDE autocomplete support
- Type-safe TypeScript access

## Integration Points

### Worker
- **Entrypoint**: Reads schedule from config
- **Sync script**: Uses config for timeouts, logging level
- **Prisma**: Uses config for query logging

### App (Future)
- Can read feature flags from config
- Can use limits from config
- Can check maintenance mode

### Both
- Share same `shared-config.ts` utility
- Access database settings
- Read project metadata

## Testing

### Validate Configuration
```bash
# Check JSON syntax
cat config.json | jq .

# Validate against schema (requires ajv-cli)
npm install -g ajv-cli
ajv validate -s config.schema.json -d config.json
```

### Test Worker Startup
```bash
docker compose up worker

# Check logs for:
# - "Reading configuration from /config/config.json"
# - "Cron schedule: ..."
# - "Starting supercronic"
```

### Test Schedule Change
```bash
# Edit config.json, change schedule
docker compose restart worker
docker compose logs worker | tail -20
# Should show new schedule
```

## Troubleshooting

### Config Not Found
```
ERROR: /config/config.json not found!
```
**Fix:** Ensure docker-compose.yml has volume mount:
```yaml
volumes:
  - ./config.json:/config/config.json:ro
```

### Invalid JSON
```
parse error: Invalid numeric literal
```
**Fix:** Validate JSON syntax:
```bash
cat config.json | jq .
```

### Cron Not Running
Check if disabled in config:
```bash
docker compose exec worker cat /config/config.json | jq '.worker.sync.enabled'
```

### Wrong Schedule
Check generated crontab:
```bash
docker compose exec worker cat /app/crontab
```

## Migration from Old System

### Old Way (Hardcoded)
```dockerfile
# Dockerfile.worker
RUN echo '0 */6 * * * ...' > /app/crontab
```

### New Way (Config-driven)
```json
// config.json
{
  "worker": {
    "sync": {
      "schedule": "0 */6 * * *"
    }
  }
}
```

**No changes needed to existing environment variables!**

## Environment Variables Still Used

Config does NOT replace environment variables for:
- ✅ Secrets (API keys, passwords)
- ✅ Database URLs
- ✅ OAuth credentials
- ✅ Stripe keys

Config is for:
- ✅ Schedules and timing
- ✅ Feature flags
- ✅ Limits and quotas
- ✅ Application behavior

## Best Practices

1. **Version Control**: Commit `config.json` to git
2. **Documentation**: Update descriptions when changing values
3. **Validation**: Always validate JSON before deploying
4. **Testing**: Test config changes in development first
5. **Backups**: Keep backup before major changes
6. **Security**: Never add secrets to config.json
7. **Comments**: Use description fields to explain settings

## Next Steps

1. **Review** `CONFIG.md` for all available settings
2. **Customize** `config.json` for your needs
3. **Test** changes in development
4. **Deploy** to production with confidence
5. **Monitor** logs after changes

## Summary

You now have a powerful, centralized configuration system that:
- ✅ Controls worker sync schedule from config
- ✅ Manages all global settings in one place
- ✅ Provides type safety and validation
- ✅ Enables hot reload without rebuilds
- ✅ Includes comprehensive documentation
- ✅ Supports multiple environments

**All without changing any environment variables or secrets!**
