#!/usr/bin/env python3
"""
Beautiful command-line interface for Spotify Playlist Farmer
Using Rich for beautiful output and Prompt Toolkit for interactive prompts
"""

import sys
import argparse
import time
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich.table import Table
from rich.prompt import Prompt, IntPrompt, Confirm
from rich.live import Live
from rich.layout import Layout
from rich import box
from prompt_toolkit import prompt
from prompt_toolkit.completion import WordCompleter

from playlist_farm.core.farmer import PlaylistFarmer
from playlist_farm.core.config import GENRE_KEYWORDS, DEFAULT_EXCEL_FILE, DATABASE_URL

console = Console()


def show_banner():
    """Display the beautiful ASCII art banner"""
    banner = """[bold cyan]
┌────────────────────────────────────────────────────┐
│ ░█▀█░█░░░█▀█░█░█░█░░░▀█▀░█▀▀░▀█▀░░░█▀▀░█▀█░█▀▄░█▄█ │
│ ░█▀▀░█░░░█▀█░░█░░█░░░░█░░▀▀█░░█░░░░█▀▀░█▀█░█▀▄░█░█ │
│ ░▀░░░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀░▀▀▀░░▀░░░░▀░░░▀░▀░▀░▀░▀░▀ │
└────────────────────────────────────────────────────┘[/bold cyan]
"""
    console.print(banner)
    console.print(Panel.fit(
        "[bold green]Spotify Playlist Farming Operation[/bold green]\n"
        "[dim]Systematically collect playlist curator contact information[/dim]",
        border_style="cyan"
    ))


def show_menu():
    """Display the main menu"""
    console.print()
    menu_table = Table(show_header=False, box=box.ROUNDED, border_style="cyan")
    menu_table.add_column("Option", style="bold magenta", width=8)
    menu_table.add_column("Description", style="white")

    menu_table.add_row("1", "🌾 Farm [bold]ALL[/bold] genres systematically (recommended)")
    menu_table.add_row("2", "🎯 Farm [bold]specific[/bold] genres")
    menu_table.add_row("3", "⚡ Quick test (10 playlists per genre)")
    menu_table.add_row("4", "📊 Analyze database")
    menu_table.add_row("5", "❌ Exit")

    console.print(menu_table)


def farm_with_progress(farmer: PlaylistFarmer, genre: str, limit: int):
    """Farm a genre with beautiful progress display"""

    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        console=console
    ) as progress:

        task = progress.add_task(f"Farming '{genre}'...", total=limit)

        # Search playlists
        playlists = farmer.search_playlists(genre, limit=limit)

        if not playlists:
            console.print(f"[yellow]⚠ No playlists found for '{genre}'[/yellow]")
            return

        progress.update(task, total=len(playlists))

        # Process each playlist
        for idx, playlist in enumerate(playlists, 1):
            farmer.process_playlist(playlist, genre)
            progress.update(task, completed=idx)
            time.sleep(0.2)  # Rate limiting


def show_stats(farmer: PlaylistFarmer):
    """Display beautiful statistics"""

    stats_table = Table(title="📊 Farming Statistics", box=box.DOUBLE_EDGE, border_style="green")
    stats_table.add_column("Metric", style="cyan", justify="right")
    stats_table.add_column("Value", style="bold green")

    stats_table.add_row("Total Processed", f"{farmer.stats['total_processed']:,}")
    stats_table.add_row("New Added", f"{farmer.stats['new_added']:,}")
    stats_table.add_row("Duplicates Skipped", f"{farmer.stats['duplicates_skipped']:,}")
    stats_table.add_row("With Contact Info", f"[bold yellow]{farmer.stats['with_contact']:,}[/bold yellow]")
    stats_table.add_row("  └─ Emails", f"{farmer.stats['with_email']:,}")
    stats_table.add_row("  └─ Instagram", f"{farmer.stats['with_instagram']:,}")
    stats_table.add_row("Total Followers", f"{farmer.stats['total_followers']:,}")
    stats_table.add_row("Errors", f"{farmer.stats['errors']:,}")

    console.print()
    console.print(stats_table)


def farm_all_genres(farmer: PlaylistFarmer, limit_per_genre: int, genre_list: list = None):
    """Farm all genres with beautiful output"""

    if genre_list is None:
        genre_list = GENRE_KEYWORDS

    console.print()
    console.print(Panel(
        f"[bold]Target:[/bold] {len(genre_list)} genres × {limit_per_genre} playlists each\n"
        f"[bold]Database:[/bold] {farmer.excel_file}",
        title="🌾 Farming Configuration",
        border_style="green"
    ))

    start_time = time.time()

    for idx, genre in enumerate(genre_list, 1):
        console.print(f"\n[bold cyan]═══ [{idx}/{len(genre_list)}] {genre.upper()} ═══[/bold cyan]")

        try:
            farm_with_progress(farmer, genre, limit_per_genre)
        except KeyboardInterrupt:
            console.print("\n[yellow]⚠ Interrupted by user. Progress has been saved![/yellow]")
            break
        except Exception as e:
            console.print(f"[red]❌ Error farming '{genre}': {e}[/red]")
            continue

    # Final stats
    elapsed = time.time() - start_time

    console.print()
    console.print(Panel.fit(
        f"[bold green]✅ Farming Complete![/bold green]\n\n"
        f"⏱  Time Elapsed: [cyan]{elapsed/60:.1f}[/cyan] minutes\n"
        f"💾 Database: [cyan]{farmer.excel_file}[/cyan]\n"
        f"📈 Total in Database: [bold yellow]{len(farmer.existing_ids):,}[/bold yellow] playlists",
        title="🎉 Results",
        border_style="green"
    ))

    show_stats(farmer)


def main():
    """Main CLI entry point with Rich UI"""

    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Spotify Playlist Farmer')
    parser.add_argument('--auto', action='store_true', help='Run in non-interactive mode')
    parser.add_argument('--limit', type=int, default=50, help='Playlists per genre (default: 50)')
    parser.add_argument('--quick', action='store_true', help='Quick test mode (10 playlists, 5 genres)')
    args = parser.parse_args()

    show_banner()

    # Initialize farmer
    console.print("\n[dim]Initializing...[/dim]")

    # Show database status if configured
    if DATABASE_URL:
        console.print(f"[cyan]💾 Database configured[/cyan]")

    farmer = PlaylistFarmer(database_url=DATABASE_URL)

    with console.status("[bold green]Loading data sources...") as status:
        farmer.init_excel()

    # Show data sources
    sources_msg = f"[green]✓[/green] Loaded {len(farmer.existing_ids):,} existing playlists"
    if farmer.use_database:
        sources_msg += " [cyan](Excel + Database)[/cyan]"
    else:
        sources_msg += " [dim](Excel only)[/dim]"

    console.print(sources_msg + "\n")

    # Non-interactive mode
    if args.auto:
        if args.quick:
            console.print("\n[bold green]⚡ Running quick test...[/bold green]")
            test_genres = ["lofi", "indie", "hip hop", "rock", "electronic"]
            farm_all_genres(farmer, 10, test_genres)
        else:
            # Farm all genres automatically
            console.print(f"\n[bold green]🌾 Auto-farming all genres ({args.limit} per genre)...[/bold green]")
            farm_all_genres(farmer, args.limit)
        return

    while True:
        show_menu()

        choice = Prompt.ask(
            "\n[bold cyan]Choose an option[/bold cyan]",
            choices=["1", "2", "3", "4", "5"],
            default="1"
        )

        if choice == "5":
            console.print("\n[bold green]👋 Happy farming![/bold green]")
            break

        elif choice == "1":
            # Farm all genres
            limit = IntPrompt.ask(
                "[cyan]Playlists per genre[/cyan]",
                default=50
            )
            console.print()
            farm_all_genres(farmer, limit)

            console.print("\n[dim]Press Enter to continue...[/dim]")
            input()

        elif choice == "2":
            # Custom genres
            console.print("\n[cyan]Enter genres (comma-separated):[/cyan]")
            genres_input = prompt("Genres: ", completer=WordCompleter(GENRE_KEYWORDS))
            genres = [g.strip() for g in genres_input.split(',')]

            limit = IntPrompt.ask(
                "[cyan]Playlists per genre[/cyan]",
                default=50
            )
            console.print()
            farm_all_genres(farmer, limit, genres)

            console.print("\n[dim]Press Enter to continue...[/dim]")
            input()

        elif choice == "3":
            # Quick test
            console.print("\n[bold green]⚡ Running quick test...[/bold green]")
            test_genres = ["lofi", "indie", "hip hop", "rock", "electronic"]
            farm_all_genres(farmer, 10, test_genres)

            console.print("\n[dim]Press Enter to continue...[/dim]")
            input()

        elif choice == "4":
            # Analyze
            console.print()
            with console.status("[bold green]Analyzing database..."):
                stats = farmer.get_database_stats()

            analysis_table = Table(title="📊 Database Analysis", box=box.DOUBLE_EDGE, border_style="cyan")
            analysis_table.add_column("Metric", style="bold white", justify="right")
            analysis_table.add_column("Value", style="bold green")

            analysis_table.add_row("Total Playlists", f"{stats['total']:,}")
            analysis_table.add_row("With Contact Info", f"[yellow]{stats['with_contact']:,}[/yellow]")
            analysis_table.add_row("Contact Percentage", f"[bold yellow]{stats['contact_pct']:.1f}%[/bold yellow]")
            analysis_table.add_row("Total Followers", f"{stats['total_followers']:,}")

            console.print()
            console.print(analysis_table)
            console.print()

            console.print("\n[dim]Press Enter to continue...[/dim]")
            input()


if __name__ == "__main__":
    main()
