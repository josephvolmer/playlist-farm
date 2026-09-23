#!/bin/sh
set -e

echo "Playlist Farm Worker - Starting..."

# Check if config file exists
if [ ! -f "/config/config.json" ]; then
    echo "ERROR: /config/config.json not found!"
    echo "Please ensure config.json is mounted to /config/"
    exit 1
fi

echo "Reading configuration from /config/config.json"

# Extract cron schedule from config.json
CRON_SCHEDULE=$(cat /config/config.json | jq -r '.worker.sync.schedule // "0 */6 * * *"')
SYNC_ENABLED=$(cat /config/config.json | jq -r '.worker.sync.enabled // true')
SCHEDULE_DESC=$(cat /config/config.json | jq -r '.worker.sync.scheduleDescription // ""')

echo "Sync enabled: $SYNC_ENABLED"
echo "Cron schedule: $CRON_SCHEDULE"
if [ -n "$SCHEDULE_DESC" ]; then
    echo "Schedule description: $SCHEDULE_DESC"
fi

# Check if sync is disabled
if [ "$SYNC_ENABLED" = "false" ]; then
    echo "WARNING: Sync is disabled in config. Worker will not run."
    echo "To enable sync, set worker.sync.enabled to true in config.json"
    echo "Sleeping indefinitely..."
    tail -f /dev/null
    exit 0
fi

# Create crontab with the schedule from config
echo "Creating crontab..."
echo "$CRON_SCHEDULE cd /app && /app/node_modules/.bin/tsx sync-playlists.ts >> /var/log/cron.log 2>&1" > /app/crontab

echo "Crontab created:"
cat /app/crontab

# Validate crontab format
if ! supercronic -test /app/crontab; then
    echo "ERROR: Invalid crontab format!"
    exit 1
fi

echo "Starting supercronic with crontab..."
echo "Logs will be written to /var/log/cron.log"
echo "---"

# Run sync immediately on startup
echo "Running initial sync on startup..."
cd /app && /app/node_modules/.bin/tsx sync-playlists.ts >> /var/log/cron.log 2>&1 &

# Start supercronic in background and tail the log
supercronic /app/crontab &
tail -f /var/log/cron.log
