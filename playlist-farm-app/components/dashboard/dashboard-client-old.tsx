"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Music2, Search, Mail } from "lucide-react"
import { UserNav } from "./user-nav"
import { EmailTemplateModal } from "./email-template-modal"
import type { User, PlaylistPitch, CuratedPlaylist } from "@prisma/client"

type DashboardUser = Pick<User, "id" | "name" | "email" | "image">
type DashboardPitch = PlaylistPitch & {
  playlist: Pick<CuratedPlaylist, "name" | "imageUrl" | "curatorName">
}

interface DashboardClientProps {
  user: DashboardUser
  pitches: DashboardPitch[]
}

// Example tracks for different genres
const EXAMPLE_TRACKS = [
  {
    name: "Blinding Lights - The Weeknd",
    url: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
    genre: "Pop / Synthwave"
  },
  {
    name: "Levitating - Dua Lipa",
    url: "https://open.spotify.com/track/39LLxExYz6ewLAcYrzQQyP",
    genre: "Pop / Dance"
  },
  {
    name: "Stay - The Kid LAROI & Justin Bieber",
    url: "https://open.spotify.com/track/5PjdY0CKGZdEuoNab3yDmX",
    genre: "Pop"
  },
  {
    name: "Heat Waves - Glass Animals",
    url: "https://open.spotify.com/track/02MWAaffLxlfxAUY7c5dvx",
    genre: "Indie / Alternative"
  },
  {
    name: "lofi hip hop - Homework Radio",
    url: "https://open.spotify.com/track/7lQ8MOhq6IN2w8EYcFNSUk",
    genre: "Lofi / Chill"
  },
]

export default function DashboardClient({ user, pitches }: DashboardClientProps) {
  const [spotifyUrl, setSpotifyUrl] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"track" | "artist" | "album">("track")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedArtist, setSelectedArtist] = useState<any>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [artistTopTracks, setArtistTopTracks] = useState<any[]>([])
  const [albumTracks, setAlbumTracks] = useState<any[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [trackData, setTrackData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return
    }

    setIsSearching(true)
    setSearchResults([])

    try {
      const res = await fetch(`/api/tracks/search?q=${encodeURIComponent(searchQuery)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        throw new Error("Failed to search tracks")
      }

      const data = await res.json()
      setSearchResults(data.tracks || [])
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectTrack = (trackUrl: string) => {
    setSpotifyUrl(trackUrl)
    setSearchResults([])
    setSearchQuery("")
  }

  const handleAnalyze = async () => {
    if (!spotifyUrl.trim()) {
      setError("Please enter a Spotify track URL")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setMatches([])
    setTrackData(null)

    try {
      // First, analyze the track
      const analyzeRes = await fetch("/api/tracks/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUrl: spotifyUrl }),
      })

      if (!analyzeRes.ok) {
        throw new Error("Failed to analyze track")
      }

      const data = await analyzeRes.json()
      setTrackData(data)

      // Then, match it against playlists
      const matchRes = await fetch("/api/playlists/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackUrl: spotifyUrl,
          audioFeatures: data.audioFeatures,
          genres: data.genres,
        }),
      })

      if (!matchRes.ok) {
        throw new Error("Failed to match playlists")
      }

      const matchData = await matchRes.json()
      setMatches(matchData.matches)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music2 className="h-6 w-6" />
            <span className="font-bold text-xl">Playlist Pitch</span>
          </div>
          <UserNav user={user} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Playlists</h1>
          <p className="text-muted-foreground">
            Paste a Spotify track URL to discover curated playlists that match your music
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analyze Your Track</CardTitle>
            <CardDescription>
              Search for a track or paste a Spotify URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search tracks */}
            <div>
              <Label htmlFor="search-query" className="text-sm font-medium mb-2 block">
                Search Spotify
              </Label>
              <div className="flex gap-2">
                <Input
                  id="search-query"
                  placeholder="Search for a song or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching} variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-md max-h-64 overflow-y-auto">
                  {searchResults.map((track: any) => (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(track.external_urls.spotify)}
                      className="w-full p-3 hover:bg-muted flex items-center gap-3 text-left border-b last:border-b-0"
                    >
                      {track.album?.images[2] && (
                        <img
                          src={track.album.images[2].url}
                          alt={track.name}
                          className="w-10 h-10 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artists.map((a: any) => a.name).join(", ")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* OR divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
              </div>
            </div>

            {/* Paste URL */}
            <div>
              <Label htmlFor="spotify-url" className="text-sm font-medium mb-2 block">
                Spotify Track URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="spotify-url"
                  placeholder="https://open.spotify.com/track/..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
                  <Search className="h-4 w-4" />
                  {isAnalyzing ? "Analyzing..." : "Find Matches"}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Example Tracks */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">Try Example Tracks</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLE_TRACKS.map((track) => (
                  <button
                    key={track.url}
                    onClick={() => setSpotifyUrl(track.url)}
                    className="p-2 text-left border rounded hover:bg-muted transition-colors"
                  >
                    <p className="text-sm font-medium">{track.name}</p>
                    <p className="text-xs text-muted-foreground">{track.genre}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {trackData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Track Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                {trackData.track.album.images[0] && (
                  <img
                    src={trackData.track.album.images[0].url}
                    alt={trackData.track.name}
                    className="w-24 h-24 rounded"
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg">{trackData.track.name}</h3>
                  <p className="text-muted-foreground">
                    {trackData.track.artists.map((a: any) => a.name).join(", ")}
                  </p>
                  {trackData.genres.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Genres: {trackData.genres.slice(0, 3).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Energy</p>
                  <p className="font-semibold">
                    {Math.round(trackData.audioFeatures.energy * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Danceability</p>
                  <p className="font-semibold">
                    {Math.round(trackData.audioFeatures.danceability * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valence</p>
                  <p className="font-semibold">
                    {Math.round(trackData.audioFeatures.valence * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {matches.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Top {matches.length} Playlist Matches
            </h2>
            <div className="space-y-4">
              {matches.map((match: any, index: number) => (
                <Card key={match.playlist.id}>
                  <CardHeader>
                    <div className="flex gap-4">
                      <div className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      {match.playlist.imageUrl && (
                        <img
                          src={match.playlist.imageUrl}
                          alt={match.playlist.name}
                          className="w-16 h-16 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle>{match.playlist.name}</CardTitle>
                        <CardDescription>
                          by {match.playlist.curatorName} · {match.playlist.followers.toLocaleString()} followers
                        </CardDescription>
                        <div className="flex gap-2 mt-2">
                          {match.matchReasons.map((reason: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-muted rounded"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(match.score * 100)}%
                        </div>
                        <p className="text-xs text-muted-foreground">match</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {match.playlist.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {match.playlist.description}
                      </p>
                    )}
                    {match.playlist.submissionNotes && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded mb-4">
                        <p className="text-sm font-medium mb-1">Submission Notes:</p>
                        <p className="text-sm">{match.playlist.submissionNotes}</p>
                      </div>
                    )}
                    <Button
                      className="gap-2"
                      onClick={() => {
                        setSelectedPlaylist(match)
                        setEmailModalOpen(true)
                      }}
                    >
                      <Mail className="h-4 w-4" />
                      Draft Pitch Email
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && trackData && !isAnalyzing && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Music2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No matching playlists found</p>
                <p className="text-sm">
                  Try another track or check back later as we add more playlists
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {pitches.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Recent Pitches</h2>
            <div className="space-y-2">
              {pitches.map((pitch) => (
                <Card key={pitch.id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{pitch.trackName}</p>
                        <p className="text-sm text-muted-foreground">
                          {pitch.artistName} → {pitch.playlist.name}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(pitch.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {selectedPlaylist && trackData && (
        <EmailTemplateModal
          open={emailModalOpen}
          onOpenChange={setEmailModalOpen}
          trackName={trackData.track.name}
          trackUrl={spotifyUrl}
          artistName={trackData.track.artists.map((a: any) => a.name).join(", ")}
          playlistName={selectedPlaylist.playlist.name}
          curatorName={selectedPlaylist.playlist.curatorName}
          curatorEmail={selectedPlaylist.playlist.curatorEmail}
          submissionNotes={selectedPlaylist.playlist.submissionNotes}
        />
      )}
    </div>
  )
}
