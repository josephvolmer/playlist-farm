"""Terminal User Interface for Spotify Playlist Farmer"""

from playlist_farm.tui.app import PlaylistFarmerApp

__all__ = ["PlaylistFarmerApp", "main"]


def main():
    """Main entry point for TUI"""
    app = PlaylistFarmerApp()
    app.run()
