# Playlist Sync Cron Job Setup

This document explains how to set up the automated playlist synchronization worker.

## Overview

The playlist sync worker fetches new playlists from the playlist-farm API and adds them to the database. It automatically skips existing playlists to preserve any manual edits made by admins.

## Environment Variables

Add these to your `.env` file:

```env
# Required: URL to your playlist-farm API endpoint that returns playlist data in JSON format
PLAYLIST_FARM_API_URL=https://your-playlist-farm-api.com/playlists

# Required: Secret token to protect the cron endpoint from unauthorized access
# Generate a random string (e.g., using: openssl rand -hex 32)
CRON_SECRET=your-random-secret-token-here
```

## Deployment Options

### Option 1: Vercel Cron (Recommended for Vercel deployments)

The `vercel.json` file is already configured to run the sync every 6 hours.

**Schedule:** `0 */6 * * *` (Every 6 hours)

**Steps:**
1. Deploy to Vercel
2. Add the environment variables in Vercel dashboard:
   - `PLAYLIST_FARM_API_URL`
   - `CRON_SECRET`
3. Vercel will automatically run the cron job

**Note:** Vercel Cron is available on Pro and Enterprise plans. The cron will be triggered automatically.

### Option 2: External Cron Service (Works anywhere)

Use a service like [cron-job.org](https://cron-job.org), [EasyCron](https://www.easycron.com/), or any cron service.

**Endpoint:** `https://your-domain.com/api/cron/sync-playlists`

**Method:** GET

**Headers:**
```
Authorization: Bearer your-cron-secret-token
```

**Recommended Schedule:** Every 6 hours (0 */6 * * *)

**Setup Example (cron-job.org):**
1. Create account at cron-job.org
2. Create new cron job:
   - Title: "Sync Playlists"
   - URL: `https://your-domain.com/api/cron/sync-playlists`
   - Schedule: Every 6 hours
   - HTTP Headers: Add `Authorization: Bearer your-cron-secret-token`

### Option 3: Manual Trigger

You can manually trigger the sync at any time using curl:

```bash
curl -H "Authorization: Bearer your-cron-secret-token" \
  https://your-domain.com/api/cron/sync-playlists
```

## API Response

The endpoint returns a JSON response:

```json
{
  "success": true,
  "timestamp": "2025-01-21T10:00:00.000Z",
  "total": 150,
  "created": 25,
  "skipped": 125,
  "errors": []
}
```

- `total`: Total playlists fetched from playlist-farm
- `created`: New playlists added to database
- `skipped`: Existing playlists (preserved to maintain manual edits)
- `errors`: Array of error messages if any occurred

## Expected Playlist-Farm API Format

The `PLAYLIST_FARM_API_URL` should return an array of playlist objects:

```json
[
  {
    "spotifyId": "37i9dQZF1DXcBWIGoYBM5M",
    "name": "Today's Top Hits",
    "description": "Ed Sheeran is on top...",
    "imageUrl": "https://...",
    "curatorName": "Spotify",
    "curatorEmail": "curator@example.com",
    "curatorInstagram": "@curator",
    "curatorWebsite": "https://...",
    "followers": 32000000,
    "trackCount": 50,
    "genres": ["pop", "dance"],
    "moods": ["energetic", "happy"],
    "isActive": true,
    "acceptsSubmissions": false,
    "submissionNotes": "..."
  }
]
```

**Required fields:**
- `spotifyId` (unique identifier)
- `name`
- `curatorName`

**All other fields are optional.**

## Security

- The endpoint is protected by the `CRON_SECRET` token
- Only requests with the correct `Authorization: Bearer <token>` header will be processed
- Keep your `CRON_SECRET` private and use a strong random value

## Monitoring

Check the sync status:
1. **Vercel:** View cron logs in Vercel dashboard under "Functions" → "Cron"
2. **External Cron:** Check execution history in your cron service dashboard
3. **Manual:** Response will show the sync results

## Troubleshooting

**"Unauthorized" error:**
- Check that `CRON_SECRET` environment variable is set correctly
- Verify the Authorization header matches the secret

**"PLAYLIST_FARM_API_URL not configured" error:**
- Add the `PLAYLIST_FARM_API_URL` environment variable

**"Invalid response from playlist-farm API" error:**
- Verify the playlist-farm API returns a JSON array
- Check the API is accessible

**No new playlists created:**
- This is normal if all playlists already exist
- Check the `skipped` count in the response
