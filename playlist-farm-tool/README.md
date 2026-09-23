<div align="center">

<img src="logo.png" alt="Playlist Farm Logo" width="200"/>

# 🎵 Playlist Farm

### Systematically Harvest Spotify Playlist Curator Contact Information

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![GitHub](https://img.shields.io/badge/github-josephvolmer%2Fplaylist--farm-blue)](https://github.com/josephvolmer/playlist-farm)

**A professional-grade CLI and TUI tool for music industry professionals to discover and connect with playlist curators.**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Commands](#-commands) • [Documentation](#-output-format)

</div>

---

## 🎯 What is Playlist Farm?

Playlist Farm is a powerful automation tool that systematically searches Spotify's entire catalog of public playlists and extracts curator contact information. Perfect for artists, labels, and music marketers looking to pitch tracks to playlist curators.

### What It Collects

✅ **Playlist Data**
- Playlist names, IDs, and URLs
- Follower counts and track totals
- Full descriptions and metadata

✅ **Curator Information**
- Curator display names
- Spotify profile URLs and user IDs
- Public/private status

✅ **Contact Details** (extracted from descriptions)
- 📧 **Email addresses**
- 📷 **Instagram handles**
- 🐦 **Twitter/X handles**

✅ **Smart Features**
- Real-time Excel export with automatic formatting
- Duplicate detection (never processes the same playlist twice)
- Resumable operations (stop and restart anytime)
- Contact info rows automatically highlighted in green
- Idempotent design (safe to run multiple times)

---

## ✨ Features

### 🖥️ Two Interfaces, One Tool

#### **Terminal UI (`playlist-farm-tui`)** - Recommended
<div align="center">

```
┌────────────────────────────────────────────────────┐
│ ░█▀█░█░░░█▀█░█░█░█░░░▀█▀░█▀▀░▀█▀░░░█▀▀░█▀█░█▀▄░█▄█ │
│ ░█▀▀░█░░░█▀█░░█░░█░░░░█░░▀▀█░░█░░░░█▀▀░█▀█░█▀▄░█░█ │
│ ░▀░░░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀░▀▀▀░░▀░░░░▀░░░▀░▀░▀░▀░▀░▀ │
└────────────────────────────────────────────────────┘
```

</div>

- 🎨 **Beautiful interface** built with [Textual](https://textual.textualize.io/)
- 📊 **Live statistics dashboard** with real-time metrics
- 📈 **Progress tracking** with visual progress bars
- 🎵 **Genre selector** - choose from 50+ genres or farm all
- ⚙️ **Interactive settings** - configure everything without editing files
- 🔑 **Built-in credential manager** - setup wizard included
- 📝 **Activity log** - see everything as it happens
- 📧 **Contact highlighting** - instantly spot valuable playlists

#### **Command Line (`playlist-farm`)** - For Power Users
- 🎯 **Rich-styled output** with beautiful tables and panels
- 📋 **Interactive menus** for easy navigation
- 🌾 **Flexible farming** - target specific genres or farm systematically
- 📊 **Database analysis** - instant statistics and insights
- 🚀 **Fast and efficient** - batch processing with rate limiting

---

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- A Spotify account (free or premium)
- Spotify API credentials ([get them here](https://developer.spotify.com/dashboard))

### Install from Source

```bash
# Clone the repository
git clone https://github.com/josephvolmer/playlist-farm.git
cd playlist-farm

# Install the package
pip install -e .
```

That's it! The installation will automatically install all dependencies:
- `requests` - HTTP client for Spotify API
- `openpyxl` - Excel file creation and manipulation
- `textual` - Modern TUI framework
- `rich` - Beautiful terminal formatting
- `prompt_toolkit` - Interactive CLI prompts

---

## 🔑 Getting Spotify API Credentials

### Step 1: Create a Spotify App

1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create App"**
4. Fill in the form:
   - **App name:** `Playlist Farm` (or any name)
   - **App description:** `Tool to search and analyze public playlists`
   - **Redirect URI:** `http://localhost:8888/callback`
5. Check **"Web API"**
6. Accept the Terms of Service
7. Click **"Create"**

### Step 2: Get Your Credentials

1. Click on your newly created app
2. Click **"Settings"** (top right)
3. You'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "View client secret" and copy

### Step 3: Configure Playlist Farm

Run the interactive setup wizard:

```bash
playlist-farm-setup
```

Or manually set environment variables:

```bash
export SPOTIFY_CLIENT_ID="your_client_id_here"
export SPOTIFY_CLIENT_SECRET="your_client_secret_here"
```

Or create a config file at `~/.playlist-farm/config.env`:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

---

## 🎮 Quick Start

### Launch the Terminal UI (Recommended)

```bash
playlist-farm-tui
```

**What you can do:**
1. Enter a genre (e.g., "lofi", "indie rock", "hip hop")
2. Set how many playlists to farm (default: 50)
3. Click "🚀 Start" to begin farming
4. Or click "🌾 Farm All" to systematically harvest all 50+ genres
5. Watch real-time stats and progress
6. Results saved automatically to `spotify_playlists_database.xlsx`

### Launch the Command Line Interface

```bash
playlist-farm
```

**Menu options:**
1. **Farm ALL genres** - Systematically process all 50+ genres
2. **Farm specific genres** - Choose custom genres
3. **Quick test** - Farm 10 playlists per genre for testing
4. **Analyze database** - View statistics and insights
5. **Exit** - Save and quit

### Analyze Your Results

```bash
playlist-farm-analyze
```

Shows:
- Total playlists collected
- Number with contact information
- Contact percentage
- Top playlists by followers
- Breakdown by contact type (email, Instagram, Twitter)

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `playlist-farm-tui` | Launch the beautiful Terminal UI (recommended) |
| `playlist-farm` | Launch the command-line interface with Rich styling |
| `playlist-farm-setup` | Interactive wizard to configure API credentials |
| `playlist-farm-analyze` | Analyze your database with detailed statistics |

---

## 📁 Output Format

Results are saved to **`spotify_playlists_database.xlsx`** (configurable) with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| **Playlist Name** | Text | Name of the playlist |
| **Playlist ID** | Text | Spotify's unique playlist identifier |
| **Playlist URL** | URL | Direct link to the playlist on Spotify |
| **Curator Name** | Text | Display name of the playlist owner |
| **Curator ID** | Text | Spotify user ID of the curator |
| **Curator URL** | URL | Link to the curator's Spotify profile |
| **Followers** | Number | Number of playlist followers |
| **Total Tracks** | Number | Number of tracks in the playlist |
| **Is Public** | Yes/No | Whether the playlist is publicly visible |
| **Email** | Email | 📧 Email address (if found in description) |
| **Instagram** | Handle | 📷 Instagram handle (if found in description) |
| **Twitter** | Handle | 🐦 Twitter/X handle (if found in description) |
| **Description** | Text | Full playlist description |
| **Genre Searched** | Text | The genre keyword used in the search |
| **Date Added** | DateTime | Timestamp when the playlist was added |

**💡 Pro Tip:** Rows with contact information are automatically highlighted in **green** for easy identification!

---

## 🎵 Supported Genres

Playlist Farm covers **50+ genres** out of the box:

### Popular Genres
`pop` • `rock` • `hip hop` • `rap` • `country` • `r&b` • `soul` • `electronic` • `dance` • `edm` • `house` • `techno` • `dubstep` • `indie` • `alternative` • `punk` • `metal` • `jazz` • `blues` • `classical` • `reggae` • `latin` • `salsa` • `bachata` • `reggaeton`

### Moods & Vibes
`lofi` • `chill` • `relax` • `study` • `focus` • `sleep` • `workout` • `party` • `sad` • `happy` • `motivation` • `gaming` • `driving`

### Specific Styles
`acoustic` • `piano` • `guitar` • `instrumental` • `vocal` • `trap` • `drill` • `phonk` • `hyperpop` • `synthwave` • `vaporwave`

### By Decade
`80s` • `90s` • `2000s` • `2010s` • `2020s`

### Regional
`k-pop` • `j-pop` • `afrobeat` • `bollywood` • `french pop` • `german rap` • `uk drill` • `spanish pop`

**Want to add more?** You can search for any genre or keyword Spotify recognizes!

---

## ⚙️ Configuration

Configuration files are stored in `~/.playlist-farm/`:

```
~/.playlist-farm/
├── config.env           # API credentials (secure, never committed)
└── preferences.json     # User preferences (TUI settings)
```

### Available Preferences

Edit via the TUI (`⚙️ Prefs` button) or manually in `preferences.json`:

```json
{
  "default_limit": 50,              // Playlists per genre
  "rate_limit_delay": 0.2,          // Seconds between requests
  "database_file": "my_playlists.xlsx",  // Custom database name
  "selected_genres": [              // Genres to farm with "Farm All"
    "pop", "rock", "hip hop", ...
  ]
}
```

---

## 🏗️ Project Structure

```
playlist-farm/
├── playlist_farm/           # Main package
│   ├── __init__.py
│   ├── cli/                 # Command-line interface
│   │   ├── __init__.py
│   │   ├── main.py          # Rich-styled CLI with menus
│   │   ├── analyze.py       # Database analysis tool
│   │   └── setup.py         # Credential setup wizard
│   ├── core/                # Core business logic
│   │   ├── __init__.py
│   │   ├── config.py        # Configuration and genre lists
│   │   └── farmer.py        # Playlist farming logic
│   └── tui/                 # Terminal UI
│       ├── __init__.py
│       └── app.py           # Textual TUI application
├── setup.py                 # Package installation config
├── pyproject.toml           # Modern Python packaging
├── requirements.txt         # Dependencies
├── MANIFEST.in              # Package manifest
├── LICENSE                  # MIT License
├── .gitignore               # Git ignore rules
├── logo.png                 # Project logo
└── README.md                # This file
```

---

## 🔐 Privacy & Ethics

### ✅ 100% Legitimate & Legal

- **Uses Official API:** Built on Spotify's official Web API with proper authentication
- **Public Data Only:** Only accesses publicly available playlist information
- **Rate Limited:** Respects Spotify's rate limits (default: 0.2s between requests)
- **No Scraping:** No web scraping, automation, or unauthorized access
- **Terms Compliant:** Follows Spotify's Developer Terms of Service

### 🛡️ Security Best Practices

- Credentials stored securely in `~/.playlist-farm/config.env` (chmod 600)
- Config files automatically added to `.gitignore`
- Database files excluded from version control
- No credentials ever logged or exposed

### ⚠️ Responsible Use

**This tool is for legitimate music industry networking only.** Please:

- ✅ Use for pitching music to curators who have publicly shared their contact info
- ✅ Respect privacy laws (GDPR, CAN-SPAM, CASL, etc.)
- ✅ Only contact curators with relevant music pitches
- ✅ Honor opt-out requests immediately
- ❌ Don't use for spam, harassment, or unsolicited bulk messaging
- ❌ Don't share or sell extracted contact databases
- ❌ Don't use data for purposes unrelated to music promotion

**Remember:** Just because contact info is public doesn't mean it's free from privacy protections. Always respect recipients and follow applicable laws.

---

## 🐛 Troubleshooting

### "401 Unauthorized" Error

**Problem:** Your API credentials are invalid or expired.

**Solution:**
```bash
# Run the setup wizard to reconfigure
playlist-farm-setup

# Or manually update your credentials at:
# ~/.playlist-farm/config.env
```

### "Command not found"

**Problem:** The package wasn't installed correctly or isn't in your PATH.

**Solution:**
```bash
# Reinstall the package
pip install -e .

# Verify installation
pip show playlist-farm
which playlist-farm-tui
```

### "ImportError: No module named 'textual'"

**Problem:** Dependencies weren't installed.

**Solution:**
```bash
# Install dependencies manually
pip install -r requirements.txt

# Or reinstall the package
pip install -e .
```

### Excel File is Locked / Permission Denied

**Problem:** The Excel file is open in another program.

**Solution:**
- Close Excel or any program viewing the database file
- Or use a different filename in preferences

### Rate Limit Errors (429)

**Problem:** Making requests too quickly.

**Solution:**
- The tool automatically handles rate limiting
- If issues persist, increase `rate_limit_delay` in preferences
- Wait a few minutes and try again

### Low Contact Info Hit Rate

**Fact:** Not all playlists include contact information in descriptions.

**Tips to improve:**
- Farm more playlists per genre (try 100-200)
- Target niche genres (curators more likely to include contact)
- Look for playlists with "submissions" or "promotion" in titles
- Higher follower playlists often have better contact info

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, features, or documentation improvements.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/playlist-farm.git
cd playlist-farm

# Install in development mode
pip install -e .

# Make changes and test
playlist-farm-tui
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this software freely, even for commercial purposes, as long as you include the original copyright notice.

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- **[Textual](https://textual.textualize.io/)** - The best TUI framework for Python
- **[Rich](https://rich.readthedocs.io/)** - Beautiful terminal formatting
- **[Spotify Web API](https://developer.spotify.com/documentation/web-api/)** - Access to millions of playlists
- **[openpyxl](https://openpyxl.readthedocs.io/)** - Excel file manipulation
- **[requests](https://requests.readthedocs.io/)** - HTTP for humans

---

## 📧 Support & Contact

- **Author:** Joseph Volmer
- **GitHub:** [@josephvolmer](https://github.com/josephvolmer)
- **Repository:** [github.com/josephvolmer/playlist-farm](https://github.com/josephvolmer/playlist-farm)
- **Issues:** [Report bugs or request features](https://github.com/josephvolmer/playlist-farm/issues)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

**🎵 Happy farming! 🌾**

Made with ❤️ for the music industry

</div>
