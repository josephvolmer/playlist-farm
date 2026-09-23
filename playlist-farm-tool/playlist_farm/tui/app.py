#!/usr/bin/env python3
"""
🎵 Spotify Playlist Farmer - Beautiful TUI Edition
A gorgeous terminal UI for farming playlist curator contacts
"""

from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical, Grid, ScrollableContainer
from textual.widgets import Header, Footer, Button, Static, ProgressBar, Input, Label, Log, Checkbox, SelectionList
from textual.widgets.selection_list import Selection
from textual.binding import Binding
from textual.screen import ModalScreen
from textual import work
from rich.table import Table as RichTable
from datetime import datetime
from typing import List, Dict, Set, Optional
import time

# Import from package
from playlist_farm.core.config import CLIENT_ID, CLIENT_SECRET, DEFAULT_EXCEL_FILE, GENRE_KEYWORDS, DATABASE_URL
from playlist_farm.core.farmer import PlaylistFarmer as CorePlaylistFarmer


class StatsPanel(Static):
    """Live statistics panel"""

    def __init__(self):
        super().__init__()
        self.stats = {
            'total_processed': 0,
            'new_added': 0,
            'duplicates_skipped': 0,
            'with_contact': 0,
            'with_email': 0,
            'with_instagram': 0,
            'errors': 0,
            'total_followers': 0,
        }

    def compose(self) -> ComposeResult:
        yield Static(self.render_stats(), id="stats-content")

    def render_stats(self) -> RichTable:
        """Render statistics as a rich table"""
        table = RichTable.grid(padding=(0, 2))
        table.add_column(style="bold cyan", justify="right")
        table.add_column(style="green")

        table.add_row("📊 Total Processed:", f"{self.stats['total_processed']:,}")
        table.add_row("✅ New Added:", f"{self.stats['new_added']:,}")
        table.add_row("⏭  Duplicates Skipped:", f"{self.stats['duplicates_skipped']:,}")
        table.add_row("📧 With Contact Info:", f"{self.stats['with_contact']:,}")
        table.add_row("  └─ Emails:", f"{self.stats['with_email']:,}")
        table.add_row("  └─ Instagram:", f"{self.stats['with_instagram']:,}")
        table.add_row("👥 Total Followers:", f"{self.stats['total_followers']:,}")
        table.add_row("⚠  Errors:", f"{self.stats['errors']:,}")

        return table

    def update_stats(self, **kwargs):
        """Update statistics"""
        for key, value in kwargs.items():
            if key in self.stats:
                self.stats[key] += value

        self.query_one("#stats-content", Static).update(self.render_stats())


class RecentPlaylists(Static):
    """Shows recent playlists added"""

    def __init__(self):
        super().__init__()
        self.recent = []
        self.max_items = 10

    def compose(self) -> ComposeResult:
        yield Static("No playlists yet...", id="recent-content")

    def add_playlist(self, name: str, curator: str, followers: int, has_contact: bool):
        """Add a playlist to recent list"""
        icon = "📧" if has_contact else "  "
        item = f"{icon} {name[:40]:<40} | {curator[:20]:<20} | {followers:>10,}"

        self.recent.insert(0, item)
        if len(self.recent) > self.max_items:
            self.recent = self.recent[:self.max_items]

        self.query_one("#recent-content", Static).update("\n".join(self.recent))


class ConfigScreen(ModalScreen):
    """Modal screen for configuring API credentials"""

    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
    ]

    CSS = """
    ConfigScreen {
        align: center middle;
    }

    #config-dialog {
        width: 80;
        height: auto;
        max-height: 30;
        background: $panel;
        border: thick $primary;
        padding: 2;
    }

    #config-title {
        width: 100%;
        height: 3;
        content-align: center middle;
        text-style: bold;
        color: $accent;
    }

    #config-help {
        width: 100%;
        height: auto;
        margin: 1 0;
        color: $text-muted;
    }

    .config-label {
        width: 100%;
        padding: 1 0 0 0;
        color: $text;
    }

    .config-input {
        width: 100%;
        margin: 0 0 1 0;
    }

    #config-buttons {
        width: 100%;
        height: auto;
        align: center middle;
        margin: 2 0 0 0;
        padding: 1 0;
    }

    #config-buttons Button {
        margin: 0 2;
        min-width: 15;
    }
    """

    def compose(self) -> ComposeResult:
        """Create the configuration dialog"""
        # Check if credentials already exist
        from pathlib import Path
        config_file = Path.home() / ".playlist-farm" / "config.env"
        has_credentials = config_file.exists()

        help_text = "Get your credentials from: https://developer.spotify.com/dashboard\n"
        if has_credentials:
            help_text += "Existing credentials loaded. Edit and save to update."
        else:
            help_text += "Create an app and copy your Client ID and Client Secret."

        with Container(id="config-dialog"):
            yield Static("🔑 Spotify API Configuration", id="config-title")
            yield Static(help_text, id="config-help")

            yield Label("Client ID:", classes="config-label")
            yield Input(
                placeholder="Enter your Spotify Client ID",
                id="client-id-input",
                classes="config-input"
            )

            yield Label("Client Secret:", classes="config-label")
            yield Input(
                placeholder="Enter your Spotify Client Secret",
                password=True,
                id="client-secret-input",
                classes="config-input"
            )

            yield Label("Database URL (optional):", classes="config-label")
            yield Input(
                placeholder="postgresql://user:pass@host:5432/database (leave empty to disable)",
                id="database-url-input",
                classes="config-input"
            )

            with Horizontal(id="config-buttons"):
                yield Button("💾 Save", variant="success", id="save-btn")
                yield Button("❌ Cancel", variant="error", id="cancel-btn")

    def on_mount(self) -> None:
        """Focus the first input when mounted and load existing credentials"""
        # Load existing credentials if available
        try:
            from pathlib import Path
            config_file = Path.home() / ".playlist-farm" / "config.env"

            if config_file.exists():
                client_id = None
                client_secret = None
                database_url = None

                with open(config_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith('SPOTIFY_CLIENT_ID='):
                            client_id = line.split('=', 1)[1]
                        elif line.startswith('SPOTIFY_CLIENT_SECRET='):
                            client_secret = line.split('=', 1)[1]
                        elif line.startswith('DATABASE_URL='):
                            database_url = line.split('=', 1)[1]

                # Pre-fill the input fields
                if client_id:
                    self.query_one("#client-id-input", Input).value = client_id
                if client_secret:
                    self.query_one("#client-secret-input", Input).value = client_secret
                if database_url:
                    self.query_one("#database-url-input", Input).value = database_url

                self.app.log_message("📝 Loaded existing credentials for editing")
        except Exception as e:
            pass  # If loading fails, just start with empty fields

        self.query_one("#client-id-input", Input).focus()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button presses"""
        if event.button.id == "save-btn":
            self.save_credentials()
        elif event.button.id == "cancel-btn":
            self.action_cancel()

    def action_cancel(self) -> None:
        """Cancel and close the dialog"""
        self.app.pop_screen()

    def on_input_submitted(self, event: Input.Submitted) -> None:
        """Handle Enter key in input fields"""
        # If Enter is pressed in Database URL field, save
        if event.input.id == "database-url-input":
            self.save_credentials()
        # If Enter is pressed in Client Secret field, move to Database URL
        elif event.input.id == "client-secret-input":
            self.query_one("#database-url-input", Input).focus()
        # If Enter is pressed in Client ID field, move to Client Secret
        elif event.input.id == "client-id-input":
            self.query_one("#client-secret-input", Input).focus()

    def save_credentials(self) -> None:
        """Save the credentials and database URL to config file"""
        client_id = self.query_one("#client-id-input", Input).value.strip()
        client_secret = self.query_one("#client-secret-input", Input).value.strip()
        database_url = self.query_one("#database-url-input", Input).value.strip()

        if not client_id or not client_secret:
            self.app.log_message("❌ Both Client ID and Secret are required!")
            return

        try:
            from pathlib import Path
            config_dir = Path.home() / ".playlist-farm"
            config_dir.mkdir(exist_ok=True)
            config_file = config_dir / "config.env"

            with open(config_file, 'w') as f:
                f.write(f"# Spotify API Credentials & Database Configuration\n")
                f.write(f"# Generated by spotify-farmer TUI\n\n")
                f.write(f"SPOTIFY_CLIENT_ID={client_id}\n")
                f.write(f"SPOTIFY_CLIENT_SECRET={client_secret}\n")
                if database_url:
                    f.write(f"DATABASE_URL={database_url}\n")

            # Make file readable only by user
            import os
            os.chmod(config_file, 0o600)

            self.app.log_message(f"✅ Configuration saved to: {config_file}")
            if database_url:
                self.app.log_message("💾 Database URL configured")
            self.app.log_message("💡 Please restart the TUI to use new configuration")
            self.app.pop_screen()

        except Exception as e:
            self.app.log_message(f"❌ Error saving configuration: {e}")


class GenreSelectionScreen(ModalScreen):
    """Modal screen for selecting genres"""

    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
    ]

    CSS = """
    GenreSelectionScreen {
        align: center middle;
    }

    #genre-dialog {
        width: 80;
        height: 35;
        background: $panel;
        border: thick $primary;
        padding: 2;
    }

    #genre-title {
        width: 100%;
        height: 3;
        content-align: center middle;
        text-style: bold;
        color: $accent;
    }

    #genre-help {
        width: 100%;
        height: auto;
        margin: 1 0;
        color: $text-muted;
    }

    #genre-list-container {
        width: 100%;
        height: 1fr;
        padding: 1 0;
    }

    #genre-buttons {
        width: 100%;
        height: auto;
        align: center middle;
        margin: 1 0 0 0;
    }

    #genre-buttons Button {
        margin: 0 2;
        min-width: 15;
    }

    SelectionList {
        height: 100%;
        border: solid $accent;
    }
    """

    def __init__(self):
        super().__init__()
        self.selected_genres = set(GENRE_KEYWORDS)
        self.load_selected_genres()

    def load_selected_genres(self):
        """Load selected genres from preferences"""
        try:
            from pathlib import Path
            import json
            prefs_file = Path.home() / ".playlist-farm" / "preferences.json"

            if prefs_file.exists():
                with open(prefs_file, 'r') as f:
                    prefs = json.load(f)
                    self.selected_genres = set(prefs.get('selected_genres', GENRE_KEYWORDS))
        except Exception:
            self.selected_genres = set(GENRE_KEYWORDS)

    def compose(self) -> ComposeResult:
        """Create the genre selection dialog"""
        with Container(id="genre-dialog"):
            yield Static("🎵 Select Genres to Farm", id="genre-title")
            yield Static(
                f"Select which genres to include when using 'Farm All' ({len(self.selected_genres)}/{len(GENRE_KEYWORDS)} selected)",
                id="genre-help"
            )

            with ScrollableContainer(id="genre-list-container"):
                # Create selection list with all genres
                selections = [
                    Selection(genre, genre, genre in self.selected_genres)
                    for genre in sorted(GENRE_KEYWORDS)
                ]
                yield SelectionList(*selections, id="genre-selection")

            with Horizontal(id="genre-buttons"):
                yield Button("💾 Save", variant="success", id="save-genres-btn")
                yield Button("🔄 Select All", variant="primary", id="select-all-genres-btn")
                yield Button("❌ Cancel", variant="error", id="cancel-genres-btn")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button presses"""
        if event.button.id == "save-genres-btn":
            self.save_genres()
        elif event.button.id == "select-all-genres-btn":
            self.select_all_genres()
        elif event.button.id == "cancel-genres-btn":
            self.action_cancel()

    def action_cancel(self) -> None:
        """Cancel and close the dialog"""
        self.app.pop_screen()

    def select_all_genres(self) -> None:
        """Select all genres"""
        selection_list = self.query_one("#genre-selection", SelectionList)
        for index in range(len(GENRE_KEYWORDS)):
            selection_list.select(index)
        self.app.log_message(f"✅ Selected all {len(GENRE_KEYWORDS)} genres")

    def save_genres(self) -> None:
        """Save genre selection"""
        try:
            selection_list = self.query_one("#genre-selection", SelectionList)
            selected_genres = [genre for genre in selection_list.selected]

            if not selected_genres:
                self.app.log_message("⚠️  Please select at least one genre!")
                return

            # Load existing preferences
            from pathlib import Path
            import json

            prefs_dir = Path.home() / ".playlist-farm"
            prefs_dir.mkdir(exist_ok=True)
            prefs_file = prefs_dir / "preferences.json"

            # Load existing prefs or create new
            if prefs_file.exists():
                with open(prefs_file, 'r') as f:
                    prefs = json.load(f)
            else:
                prefs = {
                    'default_limit': 50,
                    'rate_limit_delay': 0.2,
                    'database_file': DEFAULT_EXCEL_FILE
                }

            # Update genres
            prefs['selected_genres'] = selected_genres

            with open(prefs_file, 'w') as f:
                json.dump(prefs, f, indent=2)

            self.app.log_message(f"✅ Genre selection saved!")
            self.app.log_message(f"   Selected: {len(selected_genres)}/{len(GENRE_KEYWORDS)} genres")

            self.app.pop_screen()

        except Exception as e:
            self.app.log_message(f"❌ Error saving genres: {e}")


class PreferencesScreen(ModalScreen):
    """Modal screen for configuring preferences"""

    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
    ]

    CSS = """
    PreferencesScreen {
        align: center middle;
    }

    #prefs-dialog {
        width: 80;
        height: auto;
        max-height: 25;
        background: $panel;
        border: thick $primary;
        padding: 2;
    }

    #prefs-title {
        width: 100%;
        height: 3;
        content-align: center middle;
        text-style: bold;
        color: $accent;
    }

    #prefs-content {
        width: 100%;
        height: 1fr;
        padding: 1 0;
    }

    .prefs-section {
        width: 100%;
        height: auto;
        margin: 1 0;
        border: solid $accent;
        padding: 1;
    }

    .prefs-section-title {
        width: 100%;
        text-style: bold;
        color: $primary;
    }

    .prefs-input {
        width: 100%;
        margin: 0 0 1 0;
    }

    #prefs-buttons {
        width: 100%;
        height: auto;
        align: center middle;
        margin: 1 0 0 0;
    }

    #prefs-buttons Button {
        margin: 0 2;
        min-width: 15;
    }
    """

    def __init__(self):
        super().__init__()
        self.selected_genres = set(GENRE_KEYWORDS)  # Start with all selected
        self.load_preferences()

    def load_preferences(self):
        """Load saved preferences"""
        try:
            from pathlib import Path
            import json
            prefs_file = Path.home() / ".playlist-farm" / "preferences.json"

            if prefs_file.exists():
                with open(prefs_file, 'r') as f:
                    prefs = json.load(f)
                    self.selected_genres = set(prefs.get('selected_genres', GENRE_KEYWORDS))
                    self.default_limit = prefs.get('default_limit', 50)
                    self.rate_limit_delay = prefs.get('rate_limit_delay', 0.2)
                    self.database_file = prefs.get('database_file', DEFAULT_EXCEL_FILE)
            else:
                self.default_limit = 50
                self.rate_limit_delay = 0.2
                self.database_file = DEFAULT_EXCEL_FILE
        except Exception:
            self.default_limit = 50
            self.rate_limit_delay = 0.2
            self.database_file = DEFAULT_EXCEL_FILE

    def compose(self) -> ComposeResult:
        """Create the preferences dialog"""
        with Container(id="prefs-dialog"):
            yield Static("⚙️  Preferences & Settings", id="prefs-title")

            with Container(id="prefs-content"):
                # Default Limit Section
                with Container(classes="prefs-section"):
                    yield Static("📊 Default Settings", classes="prefs-section-title")
                    yield Label("Default playlists per genre:")
                    yield Input(
                        value=str(self.default_limit),
                        placeholder="50",
                        id="limit-input",
                        classes="prefs-input"
                    )
                    yield Label("Rate limit delay (seconds):")
                    yield Input(
                        value=str(self.rate_limit_delay),
                        placeholder="0.2",
                        id="delay-input",
                        classes="prefs-input"
                    )
                    yield Label("Database file name:")
                    yield Input(
                        value=self.database_file,
                        placeholder="spotify_playlists_database.xlsx",
                        id="database-input",
                        classes="prefs-input"
                    )

            with Horizontal(id="prefs-buttons"):
                yield Button("💾 Save", variant="success", id="save-prefs-btn")
                yield Button("❌ Cancel", variant="error", id="cancel-prefs-btn")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button presses"""
        if event.button.id == "save-prefs-btn":
            self.save_preferences()
        elif event.button.id == "cancel-prefs-btn":
            self.action_cancel()

    def action_cancel(self) -> None:
        """Cancel and close the dialog"""
        self.app.pop_screen()

    def save_preferences(self) -> None:
        """Save preferences to file"""
        try:
            # Get values
            limit_input = self.query_one("#limit-input", Input)
            delay_input = self.query_one("#delay-input", Input)
            database_input = self.query_one("#database-input", Input)

            try:
                default_limit = int(limit_input.value)
            except ValueError:
                default_limit = 50

            try:
                rate_limit_delay = float(delay_input.value)
            except ValueError:
                rate_limit_delay = 0.2

            database_file = database_input.value.strip()
            if not database_file:
                database_file = DEFAULT_EXCEL_FILE

            # Ensure it ends with .xlsx
            if not database_file.endswith('.xlsx'):
                database_file += '.xlsx'

            # Save to file
            from pathlib import Path
            import json

            prefs_dir = Path.home() / ".playlist-farm"
            prefs_dir.mkdir(exist_ok=True)
            prefs_file = prefs_dir / "preferences.json"

            # Load existing prefs to preserve genre selection
            if prefs_file.exists():
                with open(prefs_file, 'r') as f:
                    prefs = json.load(f)
            else:
                prefs = {}

            # Update with new values
            prefs['default_limit'] = default_limit
            prefs['rate_limit_delay'] = rate_limit_delay
            prefs['database_file'] = database_file

            with open(prefs_file, 'w') as f:
                json.dump(prefs, f, indent=2)

            self.app.log_message(f"✅ Preferences saved!")
            self.app.log_message(f"   Default limit: {default_limit}")
            self.app.log_message(f"   Rate limit: {rate_limit_delay}s")
            self.app.log_message(f"   Database file: {database_file}")
            self.app.log_message(f"💡 Restart TUI to use new database file")

            # Update the limit input in main app
            self.app.query_one("#limit-input", Input).value = str(default_limit)

            self.app.pop_screen()

        except Exception as e:
            self.app.log_message(f"❌ Error saving preferences: {e}")


class PlaylistFarmerApp(App):
    """Main Textual application"""

    CSS = """
    Screen {
        background: $surface;
        overflow-y: hidden;
    }

    #title {
        width: 100%;
        height: 3;
        content-align: center middle;
        background: $primary;
        color: $text;
        text-style: bold;
    }

    #control-panel {
        width: 100%;
        height: auto;
        background: $panel;
        padding: 1 2;
        border: solid $primary;
    }

    #stats-panel {
        width: 1fr;
        height: 14;
        background: $panel;
        border: solid $accent;
        padding: 1 2;
        margin: 1 0;
    }

    #recent-panel {
        width: 2fr;
        height: 14;
        background: $panel;
        border: solid $accent;
        padding: 1 2;
        margin: 1 0;
    }

    #log-panel {
        width: 100%;
        height: 1fr;
        background: $panel;
        border: solid $accent;
        padding: 1 2;
        margin: 0 0 1 0;
    }

    #progress-panel {
        width: 100%;
        height: 5;
        background: $panel;
        border: solid $primary;
        padding: 1 2;
        margin: 0;
    }

    Horizontal {
        width: 100%;
        height: auto;
    }

    Vertical {
        height: auto;
    }

    Button {
        margin: 0 1;
        min-width: 12;
    }

    Input {
        margin: 0 1;
    }

    Label {
        padding: 0 1;
        color: $text-muted;
    }

    ProgressBar {
        margin: 1 0;
    }

    Log {
        height: 100%;
        border: none;
        scrollbar-gutter: stable;
    }
    """

    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("s", "start", "Start Farming"),
        Binding("p", "pause", "Pause"),
        Binding("g", "genres", "Select Genres"),
        Binding("r", "preferences", "Preferences"),
        Binding("c", "config", "Configure Credentials"),
    ]

    def __init__(self):
        super().__init__()
        self.farmer = None
        self.is_farming = False
        self.is_paused = False

    def compose(self) -> ComposeResult:
        """Create child widgets"""
        yield Header()

        # Title with ASCII art
        yield Static("░█▀█░█░░░█▀█░█░█░█░░░▀█▀░█▀▀░▀█▀░░░█▀▀░█▀█░█▀▄░█▄█\n░█▀▀░█░░░█▀█░░█░░█░░░░█░░▀▀█░░█░░░░█▀▀░█▀█░█▀▄░█░█\n░▀░░░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀░▀▀▀░░▀░░░░▀░░░▀░▀░▀░▀░▀░▀", id="title")

        # Control Panel
        with Container(id="control-panel"):
            yield Label("🎯 Genre to Farm:")
            with Horizontal():
                yield Input(placeholder="Enter genre (e.g., 'lofi', 'indie', 'hip hop')", id="genre-input")
                yield Input(placeholder="Limit (default: 50)", value="50", id="limit-input")

            with Horizontal():
                yield Button("🚀 Start", variant="primary", id="start-btn")
                yield Button("⏸ Pause", variant="primary", id="pause-btn")
                yield Button("🌾 Farm All", variant="primary", id="farm-all-btn")
                yield Button("🎵 Genres", variant="primary", id="genres-btn")
                yield Button("⚙️ Prefs", variant="primary", id="prefs-btn")
                yield Button("📊 Analyze", variant="primary", id="analyze-btn")
                yield Button("🔑 Setup", variant="primary", id="config-btn")

        # Progress Panel
        with Container(id="progress-panel"):
            yield Label("Progress:", id="progress-label")
            yield ProgressBar(total=100, show_eta=True, id="progress-bar")

        # Stats and Recent
        with Horizontal():
            with Vertical(id="stats-panel"):
                yield Label("📊 Statistics")
                yield StatsPanel()

            with Vertical(id="recent-panel"):
                yield Label("🎵 Recent Playlists")
                yield RecentPlaylists()

        # Log Panel
        with Container(id="log-panel"):
            yield Label("📝 Activity Log")
            yield Log(id="activity-log")

        yield Footer()

    def on_mount(self):
        """Initialize on mount"""
        # Load database file from preferences
        try:
            from pathlib import Path
            import json
            prefs_file = Path.home() / ".playlist-farm" / "preferences.json"

            if prefs_file.exists():
                with open(prefs_file, 'r') as f:
                    prefs = json.load(f)
                    database_file = prefs.get('database_file', DEFAULT_EXCEL_FILE)
            else:
                database_file = DEFAULT_EXCEL_FILE
        except Exception:
            database_file = DEFAULT_EXCEL_FILE

        self.log_message("🎵 Spotify Playlist Farmer initialized!")

        # Show database status if configured
        if DATABASE_URL:
            self.log_message("💾 PostgreSQL database configured")

        self.log_message("💡 Enter a genre and click 'Start Farming' to begin")
        self.log_message(f"📁 Excel file: {database_file}")

        # Initialize farmer with custom database file and database URL
        self.farmer = PlaylistFarmer(self, database_file, database_url=DATABASE_URL)
        self.farmer.init_excel()

    def log_message(self, message: str):
        """Add message to activity log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_widget = self.query_one("#activity-log", Log)
        log_widget.write_line(f"[{timestamp}] {message}")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button presses"""
        button_id = event.button.id

        if button_id == "start-btn":
            self.action_start()
        elif button_id == "pause-btn":
            self.action_pause()
        elif button_id == "farm-all-btn":
            self.farm_all_genres()
        elif button_id == "genres-btn":
            self.action_genres()
        elif button_id == "analyze-btn":
            self.analyze_database()
        elif button_id == "prefs-btn":
            self.action_preferences()
        elif button_id == "config-btn":
            self.action_config()

    def action_start(self):
        """Start farming"""
        if self.is_farming:
            self.log_message("⚠ Already farming!")
            return

        genre_input = self.query_one("#genre-input", Input)
        limit_input = self.query_one("#limit-input", Input)

        genre = genre_input.value.strip()
        if not genre:
            self.log_message("❌ Please enter a genre!")
            return

        try:
            limit = int(limit_input.value or "50")
        except ValueError:
            limit = 50

        self.log_message(f"🚀 Starting farming for genre: '{genre}' (limit: {limit})")
        self.is_farming = True
        self.start_farming_task(genre, limit)

    def action_pause(self):
        """Toggle pause"""
        if not self.is_farming:
            self.log_message("⚠ Not currently farming!")
            return

        self.is_paused = not self.is_paused
        if self.is_paused:
            self.log_message("⏸  Paused. Click 'Pause' again to resume.")
        else:
            self.log_message("▶  Resumed farming.")

    @work(exclusive=True, thread=True)
    def start_farming_task(self, genre: str, limit: int):
        """Background task for farming"""
        try:
            self.farmer.farm_genre(genre, limit)
        except Exception as e:
            self.call_from_thread(self.log_message, f"❌ Error: {e}")
        finally:
            self.is_farming = False
            self.call_from_thread(self.log_message, "✅ Farming complete!")

    @work(exclusive=True, thread=True)
    def farm_all_genres(self):
        """Farm all genres"""
        if self.is_farming:
            self.call_from_thread(self.log_message, "⚠ Already farming!")
            return

        # Load preferences
        try:
            from pathlib import Path
            import json
            prefs_file = Path.home() / ".playlist-farm" / "preferences.json"

            if prefs_file.exists():
                with open(prefs_file, 'r') as f:
                    prefs = json.load(f)
                    selected_genres = prefs.get('selected_genres', GENRE_KEYWORDS)
                    default_limit = prefs.get('default_limit', 50)
            else:
                selected_genres = GENRE_KEYWORDS
                default_limit = 50
        except Exception:
            selected_genres = GENRE_KEYWORDS
            default_limit = 50

        self.call_from_thread(self.log_message, f"🌾 Starting systematic farming of {len(selected_genres)} genres...")
        self.is_farming = True

        try:
            limit_input = self.query_one("#limit-input", Input)
            limit = int(limit_input.value or str(default_limit))

            for idx, genre in enumerate(selected_genres, 1):
                if not self.is_farming:  # Check if stopped
                    break

                self.call_from_thread(self.log_message, f"[{idx}/{len(selected_genres)}] Farming '{genre}'...")
                self.farmer.farm_genre(genre, limit)

        except Exception as e:
            self.call_from_thread(self.log_message, f"❌ Error: {e}")
        finally:
            self.is_farming = False
            self.call_from_thread(self.log_message, "✅ All genres farmed!")

    def action_config(self):
        """Open credential configuration"""
        self.push_screen(ConfigScreen())

    def action_preferences(self):
        """Open preferences dialog"""
        self.push_screen(PreferencesScreen())

    def action_genres(self):
        """Open genre selection dialog"""
        self.push_screen(GenreSelectionScreen())

    def analyze_database(self):
        """Analyze the database"""
        self.log_message("📊 Analyzing database...")
        stats = self.farmer.get_database_stats()

        self.log_message(f"📈 Total playlists: {stats['total']:,}")
        self.log_message(f"📧 With contact: {stats['with_contact']:,} ({stats['contact_pct']:.1f}%)")
        self.log_message(f"👥 Total followers: {stats['total_followers']:,}")


class PlaylistFarmer:
    """TUI wrapper around CorePlaylistFarmer with UI callbacks"""

    def __init__(self, app: PlaylistFarmerApp, excel_file: str = None, database_url: str = None):
        self.app = app
        self.excel_file = excel_file or DEFAULT_EXCEL_FILE

        # Use CorePlaylistFarmer with TUI log callback
        self.core_farmer = CorePlaylistFarmer(
            excel_file=self.excel_file,
            database_url=database_url,
            log_callback=lambda msg: self.app.call_from_thread(self.app.log_message, msg)
        )

    @property
    def existing_ids(self):
        """Proxy to core farmer's existing IDs"""
        return self.core_farmer.existing_ids

    @property
    def worksheet(self):
        """Proxy to core farmer's worksheet"""
        return self.core_farmer.worksheet

    @property
    def workbook(self):
        """Proxy to core farmer's workbook"""
        return self.core_farmer.workbook

    def init_excel(self):
        """Initialize Excel (delegates to core farmer)"""
        self.core_farmer.init_excel()

    def process_playlist(self, playlist: Dict, genre: str) -> bool:
        """Process a single playlist with TUI callbacks"""
        playlist_id = playlist.get('id')
        stats_panel = self.app.query_one(StatsPanel)

        # Check if duplicate
        if playlist_id in self.existing_ids:
            self.app.call_from_thread(stats_panel.update_stats, duplicates_skipped=1, total_processed=1)
            return False

        # Define callback for successful playlist processing
        def on_playlist_added(playlist_data, contacts):
            """Callback when playlist is successfully added"""
            # Update stats
            update_kwargs = {
                'new_added': 1,
                'total_processed': 1,
                'total_followers': playlist_data['followers']
            }

            if contacts:
                update_kwargs['with_contact'] = 1
                if contacts.get('email'):
                    update_kwargs['with_email'] = 1
                if contacts.get('instagram'):
                    update_kwargs['with_instagram'] = 1

            self.app.call_from_thread(stats_panel.update_stats, **update_kwargs)

            # Update recent panel
            recent_panel = self.app.query_one(RecentPlaylists)
            self.app.call_from_thread(
                recent_panel.add_playlist,
                playlist_data['playlist_name'],
                playlist_data['curator_name'],
                playlist_data['followers'],
                bool(contacts)
            )

        try:
            # Use core farmer's process_playlist with callback
            result = self.core_farmer.process_playlist(playlist, genre, callback=on_playlist_added)
            if not result:
                # If core farmer returned False (error), update stats
                self.app.call_from_thread(stats_panel.update_stats, errors=1)
            return result
        except Exception as e:
            self.app.call_from_thread(stats_panel.update_stats, errors=1, total_processed=1)
            return False

    def farm_genre(self, genre: str, limit: int = 50):
        """Farm a specific genre with TUI progress bar"""
        self.app.call_from_thread(self.app.log_message, f"🔍 Searching for '{genre}' playlists...")

        playlists = self.core_farmer.search_playlists(genre, limit=limit)

        if not playlists:
            self.app.call_from_thread(self.app.log_message, f"No playlists found for '{genre}'")
            return

        self.app.call_from_thread(self.app.log_message, f"Found {len(playlists)} playlists, processing...")

        # Update progress bar
        progress_bar = self.app.query_one("#progress-bar", ProgressBar)
        self.app.call_from_thread(setattr, progress_bar, 'total', len(playlists))
        self.app.call_from_thread(setattr, progress_bar, 'progress', 0)

        for idx, playlist in enumerate(playlists, 1):
            if self.app.is_paused:
                while self.app.is_paused:
                    time.sleep(0.5)

            self.process_playlist(playlist, genre)
            self.app.call_from_thread(setattr, progress_bar, 'progress', idx)

            time.sleep(0.2)  # Rate limiting

        self.app.call_from_thread(self.app.log_message, f"✅ Completed '{genre}'")

    def get_database_stats(self) -> Dict:
        """Get database statistics (delegates to core farmer)"""
        return self.core_farmer.get_database_stats()


def main():
    """Main entry point for TUI"""
    app = PlaylistFarmerApp()
    app.run()


if __name__ == "__main__":
    main()
