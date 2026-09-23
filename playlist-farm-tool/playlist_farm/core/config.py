"""Configuration for Playlist Farm"""

import os
from pathlib import Path


def load_credentials_from_file():
    """Load credentials and database URL from config file"""
    config_file = Path.home() / ".playlist-farm" / "config.env"

    if not config_file.exists():
        return None, None, None

    client_id = None
    client_secret = None
    database_url = None

    try:
        with open(config_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith('SPOTIFY_CLIENT_ID='):
                    client_id = line.split('=', 1)[1]
                elif line.startswith('SPOTIFY_CLIENT_SECRET='):
                    client_secret = line.split('=', 1)[1]
                elif line.startswith('DATABASE_URL='):
                    database_url = line.split('=', 1)[1]
    except Exception:
        pass

    return client_id, client_secret, database_url


# Load credentials from multiple sources (in priority order):
# 1. Environment variables
# 2. Config file (~/.playlist-farm/config.env)
# 3. None (user must configure)

_config_id, _config_secret, _config_db_url = load_credentials_from_file()

CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID') or _config_id
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET') or _config_secret

# Database URL (optional - for PostgreSQL support)
# Example: postgresql://user:password@localhost:5432/database
# Priority: 1. Environment variable, 2. Config file
DATABASE_URL = os.getenv('DATABASE_URL') or _config_db_url

# Default Excel filename
DEFAULT_EXCEL_FILE = "spotify_playlists_database.xlsx"

# Comprehensive genre list for systematic farming
GENRE_KEYWORDS = [
    # Popular genres
    "pop", "rock", "hip hop", "rap", "country", "r&b", "soul",
    "electronic", "dance", "edm", "house", "techno", "dubstep",
    "indie", "alternative", "punk", "metal", "jazz", "blues",
    "classical", "reggae", "latin", "salsa", "bachata", "reggaeton",

    # Subgenres & moods
    "lofi", "chill", "relax", "study", "focus", "sleep", "workout",
    "party", "sad", "happy", "motivation", "gaming", "driving",

    # Specific styles
    "acoustic", "piano", "guitar", "instrumental", "vocal",
    "trap", "drill", "phonk", "hyperpop", "synthwave", "vaporwave",

    # Decades
    "80s", "90s", "2000s", "2010s", "2020s",

    # Regional
    "k-pop", "j-pop", "afrobeat", "bollywood", "french pop",
    "german rap", "uk drill", "spanish pop",
]
