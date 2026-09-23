"""Database writer for Playlist Farm - writes to PostgreSQL database"""

from typing import Dict, Optional, Set
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, ARRAY, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from datetime import datetime

Base = declarative_base()


class CuratedPlaylist(Base):
    """SQLAlchemy model matching the Next.js Prisma schema"""
    __tablename__ = 'CuratedPlaylist'

    id = Column(String, primary_key=True)
    spotifyId = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    imageUrl = Column(String, nullable=True)
    curatorName = Column(String, nullable=False)
    curatorEmail = Column(String, nullable=True)
    curatorInstagram = Column(String, nullable=True)
    curatorWebsite = Column(String, nullable=True)
    followers = Column(Integer, default=0)
    trackCount = Column(Integer, nullable=True)
    genres = Column(ARRAY(String), default=[])
    moods = Column(ARRAY(String), default=[])
    isActive = Column(Boolean, default=True)
    acceptsSubmissions = Column(Boolean, default=False)
    submissionNotes = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DatabaseWriter:
    """Handles writing playlist data to PostgreSQL database"""

    def __init__(self, database_url: str, log_callback=None):
        """
        Initialize database writer

        Args:
            database_url: PostgreSQL connection string (e.g., postgresql://user:pass@host:port/dbname)
            log_callback: Optional logging function
        """
        self.database_url = database_url
        self.log = log_callback or print
        self.engine = None
        self.Session = None
        self.session = None
        self.existing_ids: Set[str] = set()

    def connect(self):
        """Connect to database and create tables if needed"""
        try:
            self.engine = create_engine(self.database_url)

            # Create tables if they don't exist
            # Note: In production with Prisma, tables already exist via migrations
            # This is just a safety check
            Base.metadata.create_all(self.engine)

            self.Session = sessionmaker(bind=self.engine)
            self.session = self.Session()

            # Load existing Spotify IDs
            self._load_existing_ids()

            self.log(f"✓ Connected to database ({len(self.existing_ids):,} existing playlists)")
            return True

        except Exception as e:
            self.log(f"⚠ Database connection error: {e}")
            return False

    def _load_existing_ids(self):
        """Load existing Spotify IDs to avoid duplicates"""
        try:
            result = self.session.query(CuratedPlaylist.spotifyId).all()
            self.existing_ids = {row[0] for row in result}
        except Exception as e:
            self.log(f"⚠ Error loading existing IDs: {e}")
            self.existing_ids = set()

    def playlist_exists(self, spotify_id: str) -> bool:
        """Check if playlist already exists"""
        return spotify_id in self.existing_ids

    def add_playlist(self, playlist_data: Dict, genre: str = "") -> bool:
        """
        Add a playlist to the database

        Args:
            playlist_data: Dictionary with playlist information
            genre: Genre that was searched (optional, can be stored in moods/genres)

        Returns:
            True if added successfully, False if skipped/error
        """
        spotify_id = playlist_data.get('playlist_id')

        if not spotify_id:
            self.log("⚠ No Spotify ID provided")
            return False

        # Skip if already exists
        if self.playlist_exists(spotify_id):
            return False

        try:
            # Generate a unique ID (Prisma uses cuid, we'll use timestamp + spotify_id hash)
            import hashlib
            unique_id = f"cl{hashlib.md5(f'{datetime.utcnow().isoformat()}{spotify_id}'.encode()).hexdigest()[:24]}"

            # Prepare genres and moods
            genres = []
            moods = []
            if genre:
                # Categorize the search term as either genre or mood
                mood_keywords = ['chill', 'relax', 'study', 'focus', 'sleep', 'workout', 'party',
                                'sad', 'happy', 'motivation', 'gaming', 'driving']
                if any(keyword in genre.lower() for keyword in mood_keywords):
                    moods.append(genre)
                else:
                    genres.append(genre)

            # Create new playlist record
            new_playlist = CuratedPlaylist(
                id=unique_id,
                spotifyId=spotify_id,
                name=playlist_data.get('playlist_name', 'Unknown'),
                description=playlist_data.get('description'),
                imageUrl=None,  # Not provided by current scraper
                curatorName=playlist_data.get('curator_name', 'Unknown'),
                curatorEmail=playlist_data.get('email'),
                curatorInstagram=playlist_data.get('instagram'),
                curatorWebsite=None,  # Can be extracted from description if needed
                followers=playlist_data.get('followers', 0),
                trackCount=playlist_data.get('total_tracks'),
                genres=genres,
                moods=moods,
                isActive=True,
                acceptsSubmissions=False,  # Default, could be inferred from description
                submissionNotes=None
            )

            self.session.add(new_playlist)
            self.session.commit()

            # Add to existing IDs set
            self.existing_ids.add(spotify_id)

            return True

        except IntegrityError:
            # Duplicate entry (shouldn't happen due to our check, but safety)
            self.session.rollback()
            self.existing_ids.add(spotify_id)
            return False

        except Exception as e:
            self.log(f"⚠ Database error adding playlist: {e}")
            self.session.rollback()
            return False

    def get_stats(self) -> Dict:
        """Get database statistics"""
        try:
            total = self.session.query(CuratedPlaylist).count()
            with_email = self.session.query(CuratedPlaylist).filter(
                CuratedPlaylist.curatorEmail.isnot(None),
                CuratedPlaylist.curatorEmail != ''
            ).count()
            with_instagram = self.session.query(CuratedPlaylist).filter(
                CuratedPlaylist.curatorInstagram.isnot(None),
                CuratedPlaylist.curatorInstagram != ''
            ).count()

            total_followers = self.session.query(
                func.sum(CuratedPlaylist.followers)
            ).scalar() or 0

            with_contact = self.session.query(CuratedPlaylist).filter(
                (CuratedPlaylist.curatorEmail.isnot(None) & (CuratedPlaylist.curatorEmail != '')) |
                (CuratedPlaylist.curatorInstagram.isnot(None) & (CuratedPlaylist.curatorInstagram != ''))
            ).count()

            return {
                'total': total,
                'with_contact': with_contact,
                'with_email': with_email,
                'with_instagram': with_instagram,
                'contact_pct': (with_contact / total * 100) if total > 0 else 0,
                'total_followers': total_followers
            }
        except Exception as e:
            self.log(f"⚠ Error getting stats: {e}")
            return {
                'total': 0,
                'with_contact': 0,
                'with_email': 0,
                'with_instagram': 0,
                'contact_pct': 0,
                'total_followers': 0
            }

    def close(self):
        """Close database connection"""
        if self.session:
            self.session.close()
        if self.engine:
            self.engine.dispose()
