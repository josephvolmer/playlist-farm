# Configuration Guide

This document explains the global configuration system for Playlist Farm.

## Overview

The project uses a centralized `config.json` file at the root level to manage all global settings. This file controls:

- Worker sync schedules
- Application features and limits
- Database connection settings
- Security policies
- Monitoring and maintenance modes

## Configuration File

### Location
- **File**: `config.json` (at project root)
- **Schema**: `config.schema.json` (for validation and IDE support)
- **Utility**: `shared-config.ts` (TypeScript loader)

### Structure

```json
{
  "version": "1.0.0",
  "project": { ... },
  "worker": { ... },
  "database": { ... },
  "app": { ... },
  "email": { ... },
  "security": { ... },
  "monitoring": { ... },
  "maintenance": { ... }
}
```

## Configuration Sections

### 1. Project Information

Basic project metadata.

```json
"project": {
  "name": "Playlist Farm",
  "description": "Music platform with playlist curation and artist pitching"
}
```

### 2. Worker Configuration

Controls the background worker that syncs playlists.

#### Sync Settings

```json
"worker": {
  "sync": {
    "schedule": "0 */6 * * *",
    "scheduleDescription": "Every 6 hours at minute 0",
    "enabled": true,
    "timeout": 600000,
    "retryAttempts": 3,
    "retryDelay": 60000
  }
}
```

**Fields:**
- `schedule` (required): Cron expression for sync schedule
  - Format: `minute hour day month weekday`
  - Examples:
    - `0 */6 * * *` - Every 6 hours
    - `0 0 * * *` - Daily at midnight
    - `0 */2 * * *` - Every 2 hours
    - `*/30 * * * *` - Every 30 minutes
- `scheduleDescription`: Human-readable description
- `enabled` (required): Set to `false` to disable worker
- `timeout`: Max time for entire sync (ms)
- `retryAttempts`: Number of retries on failure
- `retryDelay`: Delay between retries (ms)

#### API Settings

```json
"api": {
  "requestTimeout": 30000,
  "maxRetries": 3,
  "batchSize": 100
}
```

**Fields:**
- `requestTimeout`: HTTP request timeout (ms)
- `maxRetries`: Retry attempts for API calls
- `batchSize`: Items to process per batch

#### Logging Settings

```json
"logging": {
  "level": "info",
  "includeTimestamps": true,
  "logFile": "/var/log/cron.log"
}
```

**Fields:**
- `level`: Log level - `error`, `warn`, `info`, `debug`
- `includeTimestamps`: Add timestamps to logs
- `logFile`: Path to log file

### 3. Database Configuration

Prisma and PostgreSQL settings.

```json
"database": {
  "poolSize": 10,
  "connectionTimeout": 30000,
  "queryTimeout": 60000,
  "enableQueryLogging": false
}
```

**Fields:**
- `poolSize`: Connection pool size (1-100)
- `connectionTimeout`: Connection timeout (ms)
- `queryTimeout`: Query timeout (ms)
- `enableQueryLogging`: Log all Prisma queries

### 4. Application Configuration

Controls Next.js app features and behavior.

#### Features

```json
"app": {
  "features": {
    "enableRegistration": true,
    "enablePitching": true,
    "requireEmailVerification": false,
    "enableStripePayments": true
  }
}
```

**Fields:**
- `enableRegistration`: Allow new user signups
- `enablePitching`: Enable playlist pitch submissions
- `requireEmailVerification`: Verify emails before access
- `enableStripePayments`: Enable payment processing

#### Limits

```json
"limits": {
  "maxPitchesPerUser": 10,
  "maxPitchesPerDay": 3,
  "maxUploadSize": 5242880,
  "sessionTimeout": 2592000
}
```

**Fields:**
- `maxPitchesPerUser`: Total pitches per user
- `maxPitchesPerDay`: Daily pitch limit
- `maxUploadSize`: Max upload size in bytes (5MB default)
- `sessionTimeout`: Session duration in seconds (30 days default)

#### UI Settings

```json
"ui": {
  "itemsPerPage": 20,
  "enableDarkMode": true,
  "defaultTheme": "system"
}
```

**Fields:**
- `itemsPerPage`: Pagination size (1-100)
- `enableDarkMode`: Enable dark mode toggle
- `defaultTheme`: `light`, `dark`, or `system`

### 5. Email Configuration

Email sending settings.

```json
"email": {
  "enabled": true,
  "rateLimit": {
    "maxPerHour": 100,
    "maxPerDay": 500
  },
  "templates": {
    "fromName": "Playlist Farm",
    "replyToEnabled": true
  }
}
```

**Fields:**
- `enabled`: Enable/disable email sending
- `rateLimit`: Prevent email abuse
- `templates`: Email template settings

### 6. Security Configuration

Security policies and rate limiting.

```json
"security": {
  "session": {
    "maxAge": 2592000,
    "updateAge": 86400
  },
  "rateLimit": {
    "enabled": true,
    "windowMs": 900000,
    "maxRequests": 100
  },
  "cors": {
    "enabled": false,
    "allowedOrigins": []
  }
}
```

**Fields:**
- `session.maxAge`: Session max age (seconds)
- `session.updateAge`: Session refresh interval (seconds)
- `rateLimit.enabled`: Enable rate limiting
- `rateLimit.windowMs`: Rate limit window (ms)
- `rateLimit.maxRequests`: Max requests per window
- `cors.enabled`: Enable CORS
- `cors.allowedOrigins`: Allowed origins array

### 7. Monitoring Configuration

Health checks and metrics.

```json
"monitoring": {
  "healthCheck": {
    "enabled": true,
    "interval": 60000
  },
  "metrics": {
    "enabled": false,
    "endpoint": "/metrics"
  }
}
```

**Fields:**
- `healthCheck.enabled`: Enable health endpoint
- `healthCheck.interval`: Check interval (ms)
- `metrics.enabled`: Enable Prometheus metrics
- `metrics.endpoint`: Metrics endpoint path

### 8. Maintenance Mode

Control maintenance mode.

```json
"maintenance": {
  "enabled": false,
  "message": "We're currently performing scheduled maintenance.",
  "allowedIPs": []
}
```

**Fields:**
- `enabled`: Enable maintenance mode
- `message`: Message to display
- `allowedIPs`: IPs allowed during maintenance

## Using Configuration in Code

### Worker (TypeScript)

```typescript
import { getWorkerConfig } from '../shared-config'

const config = getWorkerConfig()
console.log(config.sync.schedule)
```

### App (TypeScript)

```typescript
import { getAppConfig, isMaintenanceMode } from '@/shared-config'

const config = getAppConfig()
if (config.features.enablePitching) {
  // Show pitching UI
}

if (isMaintenanceMode()) {
  // Show maintenance page
}
```

## Configuration in Docker

The config file is mounted as read-only in containers:

```yaml
# docker-compose.yml
services:
  app:
    volumes:
      - ./config.json:/app/config/config.json:ro

  worker:
    volumes:
      - ./config.json:/config/config.json:ro
```

**Worker reads cron schedule from config at startup!**

## Common Tasks

### Change Sync Schedule

1. Edit `config.json`:
   ```json
   "worker": {
     "sync": {
       "schedule": "0 */2 * * *",
       "scheduleDescription": "Every 2 hours"
     }
   }
   ```

2. Restart worker:
   ```bash
   docker compose restart worker
   ```

3. Verify:
   ```bash
   docker compose logs worker
   # Should show: "Cron schedule: 0 */2 * * *"
   ```

### Disable Worker Sync

Set `enabled: false` in config:

```json
"worker": {
  "sync": {
    "enabled": false
  }
}
```

Restart: `docker compose restart worker`

### Enable Maintenance Mode

```json
"maintenance": {
  "enabled": true,
  "message": "Scheduled maintenance - back in 1 hour"
}
```

Restart app: `docker compose restart app`

### Change Pagination

```json
"app": {
  "ui": {
    "itemsPerPage": 50
  }
}
```

Restart app to apply.

### Disable New Registrations

```json
"app": {
  "features": {
    "enableRegistration": false
  }
}
```

## Validation

### JSON Schema

The `config.schema.json` file provides:
- Type validation
- Required field checks
- Value constraints
- IDE autocomplete and hints

### Manual Validation

Check syntax:
```bash
cat config.json | jq .
```

Validate against schema (requires ajv-cli):
```bash
npm install -g ajv-cli
ajv validate -s config.schema.json -d config.json
```

## Environment Variables vs Config

**Config File (config.json):**
- Application behavior settings
- Feature flags
- Limits and quotas
- Schedules and timing

**Environment Variables (.env):**
- Secrets (API keys, passwords)
- External service URLs
- Database connection strings
- Environment-specific values

**Never put secrets in config.json!**

## Examples

### High-Traffic Setup

```json
{
  "worker": {
    "sync": {
      "schedule": "0 */1 * * *",  // Every hour
      "timeout": 1200000  // 20 minutes
    }
  },
  "database": {
    "poolSize": 20
  },
  "security": {
    "rateLimit": {
      "maxRequests": 1000
    }
  }
}
```

### Development Setup

```json
{
  "worker": {
    "sync": {
      "schedule": "*/5 * * * *",  // Every 5 minutes
      "enabled": true
    },
    "logging": {
      "level": "debug"
    }
  },
  "database": {
    "enableQueryLogging": true
  }
}
```

### Restricted Access Setup

```json
{
  "app": {
    "features": {
      "enableRegistration": false,
      "requireEmailVerification": true
    },
    "limits": {
      "maxPitchesPerDay": 1
    }
  }
}
```

## Troubleshooting

### Worker Not Running

Check config:
```bash
docker compose exec worker cat /config/config.json | jq '.worker.sync'
```

Check logs:
```bash
docker compose logs worker
```

Verify schedule:
```bash
docker compose exec worker cat /app/crontab
```

### Invalid Cron Schedule

Cron format: `minute hour day month weekday`

Valid examples:
- `0 */6 * * *` ✓
- `*/30 * * * *` ✓
- `0 0 * * *` ✓

Invalid examples:
- `every 6 hours` ✗
- `0 6 * * * *` ✗ (6 fields, need 5)

### Configuration Not Updating

1. Check file syntax: `cat config.json | jq .`
2. Restart services: `docker compose restart`
3. Check volumes are mounted: `docker compose exec worker ls -l /config/`

## Best Practices

1. **Version Control**: Commit `config.json` to git
2. **Documentation**: Update `scheduleDescription` when changing schedule
3. **Testing**: Test config changes in development first
4. **Backups**: Keep backup before major changes
5. **Validation**: Always validate JSON syntax
6. **Security**: Never add secrets to config.json
7. **Monitoring**: Check logs after config changes

## Reference

### Cron Schedule Quick Reference

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

Common patterns:
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight
- `0 12 * * *` - Daily at noon
- `0 0 * * 0` - Weekly on Sunday
- `0 0 1 * *` - Monthly on 1st
- `*/15 * * * *` - Every 15 minutes

### File Size Reference

- 1 MB = 1,048,576 bytes
- 5 MB = 5,242,880 bytes
- 10 MB = 10,485,760 bytes

### Time Reference

- 1 hour = 3,600 seconds
- 1 day = 86,400 seconds
- 1 week = 604,800 seconds
- 30 days = 2,592,000 seconds

## Support

For issues with configuration:
1. Validate JSON syntax
2. Check schema compliance
3. Review logs after changes
4. See main README.md for general help
