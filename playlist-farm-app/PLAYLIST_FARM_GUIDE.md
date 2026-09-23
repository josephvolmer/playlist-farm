# Playlist Farm Integration Guide

This guide explains how to use the `playlist-farm` tool to harvest Spotify playlists and import them into your database.

## Quick Start

1. **Harvest playlists** with playlist-farm
2. **Import the Excel file** into your database
3. **Match tracks** against the imported playlists

---

## Step 1: Setup Playlist Farm

### Install the tool

The tool is already cloned at `../playlist-farm/`

```bash
cd ../playlist-farm
pip install -e .
```

### Configure Spotify Credentials

Run the setup wizard:

```bash
playlist-farm-setup
```

Or manually create `~/.playlist-farm/config.env`:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

You can use the same Spotify credentials as your main app.

---

## Step 2: Harvest Playlists

### Option A: Terminal UI (Recommended)

Launch the beautiful TUI:

```bash
cd ../playlist-farm
playlist-farm-tui
```

**What you can do:**
- Enter a genre (e.g., "lofi", "indie rock", "hip hop")
- Set how many playlists to harvest (default: 50)
- Click "🚀 Start" to begin harvesting
- Or click "🌾 Farm All" to systematically harvest all 50+ genres
- Watch real-time stats and progress
- Results saved automatically to `spotify_playlists_database.xlsx`

### Option B: Command Line

```bash
cd ../playlist-farm
playlist-farm
```

**Menu options:**
1. **Farm ALL genres** - Systematically process all 50+ genres
2. **Farm specific genres** - Choose custom genres
3. **Quick test** - Farm 10 playlists per genre for testing
4. **Analyze database** - View statistics

### Recommended Genres to Start

For music discovery, focus on:

**Popular Genres:**
- `indie`
- `alternative`
- `hip hop`
- `electronic`
- `r&b`

**Moods:**
- `lofi`
- `chill`
- `study`
- `workout`
- `party`

**Tip:** Start with 50-100 playlists per genre to get a good dataset without overwhelming the database.

---

## Step 3: Import into Database

After harvesting playlists, you'll have an Excel file (default: `spotify_playlists_database.xlsx`)

### Import a single file

```bash
cd ../magicnothing.xyz
pnpm import-playlists ../playlist-farm/spotify_playlists_database.xlsx
```

### Import all Excel files from a directory

```bash
pnpm import-playlists ../playlist-farm/
```

### What gets imported

The import script:
- ✅ Extracts Spotify playlist ID from URLs
- ✅ Imports playlist name, description, curator info
- ✅ Extracts curator email, Instagram, Twitter
- ✅ Maps genre from the search query
- ✅ Auto-detects moods from descriptions (chill, upbeat, workout, etc.)
- ✅ Skips duplicates (based on Spotify ID)
- ✅ Updates existing playlists if they've changed

### Output

You'll see a summary like:

```
📊 Import Summary:
   ✨ New playlists imported: 245
   ✅ Existing playlists updated: 12
   ⚠️  Playlists skipped: 3
   ❌ Errors: 0
   📈 Total processed: 260
```

---

## Step 4: Verify Import

Check your database:

```bash
psql postgresql://postgres:postgres@localhost:5432/magicnothing -c "SELECT COUNT(*) FROM curated_playlists;"
```

Or view the data:

```bash
psql postgresql://postgres:postgres@localhost:5432/magicnothing -c "SELECT name, curator_name, followers, genres, moods FROM curated_playlists LIMIT 10;"
```

---

## Step 5: Use in Your App

Now that playlists are imported, the matching algorithm will automatically use them!

1. Go to http://127.0.0.1:3000/dashboard
2. Paste a Spotify track URL
3. Click "Find Matches"
4. See your imported playlists ranked by compatibility

The algorithm matches based on:
- Audio features (energy, danceability, valence)
- Genres
- Moods
- Follower count (higher = better)

---

## Recommended Workflow

### First Time Setup

1. Farm 50 playlists from 5-10 key genres that match your music
2. Import them into the database
3. Test matching with your tracks
4. Refine by adding more genres as needed

### Weekly Maintenance

1. Farm 50-100 new playlists from trending genres
2. Import fresh data to keep the database current
3. Playlists with updated descriptions will be refreshed

### Pro Tips

**Quality over quantity:**
- Focus on playlists with 500+ followers
- Playlists with email addresses are gold (they accept submissions!)
- Niche genres often have more engaged curators

**Genre strategy:**
- Start with your primary genre
- Add 2-3 adjacent genres (e.g., if you make indie rock, also farm "alternative" and "garage rock")
- Include mood-based genres (lofi, chill, study) for broader reach

**Contact information:**
- Rows with emails are highlighted in green by playlist-farm
- These curators have explicitly shared contact info for submissions
- The import script flags playlists with emails as `acceptsSubmissions: true`

---

## Troubleshooting

### "Command not found: playlist-farm-tui"

Make sure you're in the playlist-farm directory and it's installed:

```bash
cd ../playlist-farm
pip install -e .
```

### "401 Unauthorized" from Spotify

Your API credentials are invalid or expired:

```bash
cd ../playlist-farm
playlist-farm-setup
```

### Import script fails

Check that the Excel file exists:

```bash
ls -la ../playlist-farm/*.xlsx
```

Make sure you're in the right directory:

```bash
cd /Users/beowulf/Desktop/magicnothing.xyz
```

### No matching playlists found

You need to import more playlists. Try:

```bash
cd ../playlist-farm
playlist-farm-tui
# Farm 100 playlists from "indie", "alternative", etc.

cd ../magicnothing.xyz
pnpm import-playlists ../playlist-farm/spotify_playlists_database.xlsx
```

---

## Advanced: Automated Harvesting

Create a script to automatically harvest and import playlists weekly:

```bash
#!/bin/bash
# harvest-weekly.sh

GENRES=("indie" "alternative" "hip hop" "electronic" "r&b" "lofi" "chill")

cd /Users/beowulf/Desktop/playlist-farm

for genre in "${GENRES[@]}"; do
  echo "Harvesting $genre..."
  playlist-farm farm "$genre" --limit 50
done

cd /Users/beowulf/Desktop/magicnothing.xyz
pnpm import-playlists ../playlist-farm/
```

Run it with:

```bash
chmod +x harvest-weekly.sh
./harvest-weekly.sh
```

---

## Database Schema Reference

Playlists are stored in the `curated_playlists` table:

| Column | Type | Description |
|--------|------|-------------|
| `spotifyId` | String | Unique Spotify playlist ID |
| `name` | String | Playlist name |
| `description` | String | Full description |
| `curatorName` | String | Curator display name |
| `curatorEmail` | String | Email (if found in description) |
| `curatorInstagram` | String | Instagram handle |
| `curatorWebsite` | String | Twitter/website |
| `followers` | Int | Number of followers |
| `genres` | String[] | Array of genres |
| `moods` | String[] | Array of moods |
| `acceptsSubmissions` | Boolean | True if email is present |
| `submissionNotes` | String | Special instructions |

---

## Need Help?

- **Playlist Farm Issues:** https://github.com/josephvolmer/playlist-farm/issues
- **App Issues:** Check the main README or your development logs

Happy harvesting! 🌾🎵
