"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Mail, ArrowLeft, Disc, User, Music, Download, CheckSquare, Square, ChevronDown } from "lucide-react"
import { EmailTemplateModal } from "./email-template-modal"
import type { User as PrismaUser } from "@prisma/client"
import { Header } from "@/components/header"
import { Logo } from "@/components/logo"
import { Footer } from "@/components/footer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type DashboardUser = Pick<PrismaUser, "id" | "name" | "email" | "image">

interface DashboardClientProps {
  user: DashboardUser
  isAdmin?: boolean
}

// Example tracks for different genres - all verified Spotify URLs
const EXAMPLE_TRACKS = [
  {
    name: "Strobe - Deadmau5",
    url: "https://open.spotify.com/track/2Cd9iWfcOpGDHLz6tVA3G4",
    genre: "Progressive House"
  },
  {
    name: "Crystalised - The xx",
    url: "https://open.spotify.com/track/6VePtm37ryoByXzsSURqfR",
    genre: "Indie Electronic"
  },
  {
    name: "Windowlicker - Aphex Twin",
    url: "https://open.spotify.com/track/5IIkGCdiNKTL0hnkaCr0AQ",
    genre: "IDM / Experimental"
  },
  {
    name: "Inner City Life - Goldie",
    url: "https://open.spotify.com/track/61EFs5WQOvrC6QYEeA3jWD",
    genre: "Drum & Bass"
  },
  {
    name: "Genesis - Justice",
    url: "https://open.spotify.com/track/6y1TyRW6u4FrJlwYHlJBkc",
    genre: "Electro House"
  },
  {
    name: "Shelter - Porter Robinson & Madeon",
    url: "https://open.spotify.com/track/4S7YHmlWwfwArgd9eB6wpr",
    genre: "Future Bass"
  },
  {
    name: "Born Slippy - Underworld",
    url: "https://open.spotify.com/track/3aQem1wUHHWTmvCIUCglHT",
    genre: "Techno"
  },
  {
    name: "Around the World - Daft Punk",
    url: "https://open.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN",
    genre: "French House"
  },
  {
    name: "Opus - Eric Prydz",
    url: "https://open.spotify.com/track/08y3fLBVTZjqRcds8WkOPG",
    genre: "Progressive House"
  },
  {
    name: "Midnight City - M83",
    url: "https://open.spotify.com/track/0QeI79KOWvh81XzKHrLP2C",
    genre: "Synth Pop"
  },
  {
    name: "Sleepless - Flume",
    url: "https://open.spotify.com/track/3zkyus0njMCL6phZmNNEeN",
    genre: "Future Bass"
  },
  {
    name: "Teardrop - Massive Attack",
    url: "https://open.spotify.com/track/4tCtwWceOPWzenK2HAIJSb",
    genre: "Trip Hop"
  },
]

export default function DashboardClient({ user, isAdmin = false }: DashboardClientProps) {
  const [spotifyUrl, setSpotifyUrl] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTypes, setSearchTypes] = useState({
    track: true,
    artist: false,
    album: false
  })
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any>({})
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
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set())
  const [examplesOpen, setExamplesOpen] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return
    }

    setIsSearching(true)
    setSearchResults({})
    setSelectedArtist(null)
    setSelectedAlbum(null)

    try {
      const types = Object.entries(searchTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type)
        .join(",")

      const res = await fetch(`/api/tracks/search?q=${encodeURIComponent(searchQuery)}&types=${types}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        throw new Error("Failed to search")
      }

      const data = await res.json()
      setSearchResults(data)
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectArtist = async (artist: any) => {
    setSelectedArtist(artist)
    setIsLoadingDetails(true)
    setArtistTopTracks([])

    try {
      const res = await fetch(`/api/artists/${artist.id}/top-tracks`)
      if (res.ok) {
        const data = await res.json()
        setArtistTopTracks(data.tracks)
      }
    } catch (err) {
      console.error("Error loading artist top tracks:", err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleSelectAlbum = async (album: any) => {
    setSelectedAlbum(album)
    setIsLoadingDetails(true)
    setAlbumTracks([])

    try {
      const res = await fetch(`/api/albums/${album.id}/tracks`)
      if (res.ok) {
        const data = await res.json()
        setAlbumTracks(data.tracks)
      }
    } catch (err) {
      console.error("Error loading album tracks:", err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleSelectTrack = (trackUrl: string) => {
    setSpotifyUrl(trackUrl)
    setSearchResults({})
    setSearchQuery("")
    setSelectedArtist(null)
    setSelectedAlbum(null)
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
      setSelectedPlaylists(new Set()) // Reset selection when new matches arrive
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const togglePlaylistSelection = (playlistId: string) => {
    const newSelection = new Set(selectedPlaylists)
    if (newSelection.has(playlistId)) {
      newSelection.delete(playlistId)
    } else {
      newSelection.add(playlistId)
    }
    setSelectedPlaylists(newSelection)
  }

  const selectAll = () => {
    setSelectedPlaylists(new Set(matches.map(m => m.playlist.id)))
  }

  const unselectAll = () => {
    setSelectedPlaylists(new Set())
  }

  const selectByPotential = (threshold: number) => {
    const filtered = matches.filter(m => m.score >= threshold).map(m => m.playlist.id)
    setSelectedPlaylists(new Set(filtered))
  }

  const generateEmailTemplate = (match: any) => {
    const trackName = trackData?.track?.name || ''
    const artistName = trackData?.track?.artists?.[0]?.name || ''

    return `Subject: Music Submission for ${match.playlist.name}

Hi ${match.playlist.curatorName},

I hope this email finds you well. I'm reaching out to submit my track "${trackName}" for consideration for your playlist "${match.playlist.name}".

${match.matchReasons.length > 0 ? `I believe my track would be a great fit because:\n${match.matchReasons.map((r: string) => `• ${r}`).join('\n')}\n\n` : ''}Track: ${trackName}
Artist: ${artistName}
Spotify Link: ${spotifyUrl}

${match.playlist.description ? `Your playlist's focus on "${match.playlist.description}" resonates with the vibe and energy of this track.\n\n` : ''}I'd be grateful if you could give it a listen. Thank you for your time and for curating such an amazing playlist!

Best regards,
${user.name || 'Your Name'}`
  }

  const downloadAllEmails = () => {
    const selectedMatches = matches.filter(m => selectedPlaylists.has(m.playlist.id))

    const emailsText = selectedMatches.map((match, index) => {
      const email = generateEmailTemplate(match)
      return `${'='.repeat(80)}\nEMAIL ${index + 1} of ${selectedMatches.length}\nTo: ${match.playlist.curatorEmail || 'No email available'}\n${'='.repeat(80)}\n\n${email}\n\n\n`
    }).join('\n')

    const blob = new Blob([emailsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const trackName = trackData?.track?.name?.replace(/[^a-z0-9]/gi, '_') || 'track'
    link.download = `pitch_emails_${trackName}_${selectedMatches.length}_playlists.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getPotentialLevel = (score: number) => {
    if (score >= 0.7) return { label: 'High Potential', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' }
    if (score >= 0.5) return { label: 'Medium Potential', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' }
    return { label: 'Exploratory', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" user={user} showThemeToggle={true} isAdmin={isAdmin} />

      <main className={`container mx-auto px-4 py-8 max-w-4xl ${selectedPlaylists.size > 0 ? 'pb-32' : ''}`}>
        <div className="mb-8 flex items-center gap-6">
          <img
            src="/cassette2.png"
            alt="Cassette tape"
            className="w-24 h-24 opacity-90 hidden sm:block"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Find Your Perfect Playlists</h1>
            <p className="text-muted-foreground">
              Search for tracks, artists, or albums to discover curated playlists
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Music</CardTitle>
            <CardDescription>
              Search Spotify by track, artist, or album
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Type Checkboxes */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Search For</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="search-track"
                    checked={searchTypes.track}
                    onCheckedChange={(checked) =>
                      setSearchTypes({ ...searchTypes, track: checked as boolean })
                    }
                  />
                  <label htmlFor="search-track" className="text-sm cursor-pointer flex items-center gap-1">
                    <Music className="h-4 w-4" />
                    Tracks
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="search-artist"
                    checked={searchTypes.artist}
                    onCheckedChange={(checked) =>
                      setSearchTypes({ ...searchTypes, artist: checked as boolean })
                    }
                  />
                  <label htmlFor="search-artist" className="text-sm cursor-pointer flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Artists
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="search-album"
                    checked={searchTypes.album}
                    onCheckedChange={(checked) =>
                      setSearchTypes({ ...searchTypes, album: checked as boolean })
                    }
                  />
                  <label htmlFor="search-album" className="text-sm cursor-pointer flex items-center gap-1">
                    <Disc className="h-4 w-4" />
                    Albums
                  </label>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching} variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Artist Detail View */}
            {selectedArtist && (
              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedArtist(null)}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  {selectedArtist.images?.[0] && (
                    <img
                      src={selectedArtist.images[0].url}
                      alt={selectedArtist.name}
                      className="w-20 h-20 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{selectedArtist.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedArtist.followers?.total.toLocaleString()} followers
                    </p>
                  </div>
                </div>
                <Label className="text-sm font-medium mb-2 block">Top Tracks</Label>
                {isLoadingDetails ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {artistTopTracks.map((track: any) => (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track.external_urls.spotify)}
                        className="w-full p-3 hover:bg-muted flex items-center gap-3 text-left rounded"
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
                            {track.album.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Album Detail View */}
            {selectedAlbum && (
              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAlbum(null)}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  {selectedAlbum.images?.[0] && (
                    <img
                      src={selectedAlbum.images[0].url}
                      alt={selectedAlbum.name}
                      className="w-20 h-20 rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{selectedAlbum.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAlbum.artists?.map((a: any) => a.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAlbum.total_tracks} tracks
                    </p>
                  </div>
                </div>
                <Label className="text-sm font-medium mb-2 block">Album Tracks</Label>
                {isLoadingDetails ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {albumTracks.map((track: any, index: number) => (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track.external_urls.spotify)}
                        className="w-full p-3 hover:bg-muted flex items-center gap-3 text-left rounded"
                      >
                        <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Results */}
            {!selectedArtist && !selectedAlbum && Object.keys(searchResults).length > 0 && (
              <div className="space-y-4">
                {/* Track Results */}
                {searchResults.tracks?.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Tracks</Label>
                    <div className="border rounded-md max-h-64 overflow-y-auto">
                      {searchResults.tracks.map((track: any) => (
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
                  </div>
                )}

                {/* Artist Results */}
                {searchResults.artists?.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Artists</Label>
                    <div className="border rounded-md max-h-64 overflow-y-auto">
                      {searchResults.artists.map((artist: any) => (
                        <button
                          key={artist.id}
                          onClick={() => handleSelectArtist(artist)}
                          className="w-full p-3 hover:bg-muted flex items-center gap-3 text-left border-b last:border-b-0"
                        >
                          {artist.images?.[2] && (
                            <img
                              src={artist.images[2].url}
                              alt={artist.name}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{artist.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {artist.followers?.total.toLocaleString()} followers
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Album Results */}
                {searchResults.albums?.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Albums</Label>
                    <div className="border rounded-md max-h-64 overflow-y-auto">
                      {searchResults.albums.map((album: any) => (
                        <button
                          key={album.id}
                          onClick={() => handleSelectAlbum(album)}
                          className="w-full p-3 hover:bg-muted flex items-center gap-3 text-left border-b last:border-b-0"
                        >
                          {album.images?.[2] && (
                            <img
                              src={album.images[2].url}
                              alt={album.name}
                              className="w-10 h-10 rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{album.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {album.artists.map((a: any) => a.name).join(", ")}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
            <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen} className="pt-4 border-t">
              <CollapsibleTrigger className="flex items-center justify-between w-full mb-2">
                <Label className="text-sm font-medium cursor-pointer">Try Example Tracks</Label>
                <ChevronDown className={`h-4 w-4 transition-transform ${examplesOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
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
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">
                <span className="text-green-600">{matches.length}</span> Matches Found
              </h2>
              <p className="text-muted-foreground mb-4">Select playlists to pitch to</p>

              {/* Bulk Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={unselectAll}>
                  <Square className="h-4 w-4 mr-1" />
                  Unselect All
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPotential(0.7)}>
                  Select High Potential
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPotential(0.5)}>
                  Select Medium Potential+
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {matches.map((match: any, index: number) => {
                const isSelected = selectedPlaylists.has(match.playlist.id)
                const potential = getPotentialLevel(match.score)

                return (
                  <Card
                    key={match.playlist.id}
                    className={`transition-all ${isSelected ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-950/20' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4 items-start">
                        {/* Checkbox */}
                        <div className="flex items-center pt-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => togglePlaylistSelection(match.playlist.id)}
                            className="h-5 w-5"
                          />
                        </div>

                        {/* Playlist Image */}
                        {match.playlist.imageUrl && (
                          <img
                            src={match.playlist.imageUrl}
                            alt={match.playlist.name}
                            className="w-20 h-20 rounded object-cover"
                          />
                        )}

                        {/* Playlist Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="font-bold text-lg">{match.playlist.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${potential.color}`}>
                              {potential.label}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            by {match.playlist.curatorName} · 🎵 {match.playlist.followers.toLocaleString()} followers
                          </p>

                          {match.playlist.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {match.playlist.description}
                            </p>
                          )}

                          {/* Match Reasons */}
                          {match.matchReasons.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {match.matchReasons.map((reason: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 bg-muted rounded"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Genres */}
                          {match.playlist.genres && match.playlist.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {match.playlist.genres.slice(0, 5).map((genre: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 bg-secondary rounded"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Match Score */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-3xl font-bold text-green-600">
                            {Math.round(match.score * 100)}%
                          </div>
                          <p className="text-xs text-muted-foreground">match</p>
                        </div>
                      </div>

                      {/* Submission Notes */}
                      {match.playlist.submissionNotes && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-950 p-3 rounded">
                          <p className="text-xs font-medium mb-1 text-blue-900 dark:text-blue-100">
                            📝 Submission Notes:
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {match.playlist.submissionNotes}
                          </p>
                        </div>
                      )}

                      {/* Draft Email Button */}
                      {match.playlist.curatorEmail && (
                        <div className="mt-3">
                          <Button
                            onClick={() => {
                              setSelectedPlaylist(match)
                              setEmailModalOpen(true)
                            }}
                            className="w-full gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Draft Pitch Email
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {matches.length === 0 && trackData && !isAnalyzing && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Logo width={48} height={48} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No matching playlists found</p>
                <p className="text-sm">
                  Try another track or check back later as we add more playlists
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      </main>

      {/* Sticky Bottom Bar for Multi-Select */}
      {selectedPlaylists.size > 0 && matches.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold">
                  {selectedPlaylists.size} selected
                </div>
                <Button variant="ghost" size="sm" onClick={unselectAll}>
                  Clear
                </Button>
              </div>
              <Button
                size="lg"
                onClick={downloadAllEmails}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="h-5 w-5" />
                Download {selectedPlaylists.size} Email{selectedPlaylists.size > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

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

      <Footer />
    </div>
  )
}
