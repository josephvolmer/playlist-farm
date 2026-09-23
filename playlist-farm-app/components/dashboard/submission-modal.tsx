"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Music2, Coins, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubmissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userTokenBalance: number
}

interface PlaylistMatch {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  followers: number
  curatorName: string | null
  tokenCost: number
  matchScore: number
  matchReason: string[]
  potential: "HIGH" | "MEDIUM" | "EXPLORATORY"
}

export function SubmissionModal({ open, onOpenChange, userTokenBalance }: SubmissionModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<"input" | "matches" | "confirm">("input")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [spotifyUrl, setSpotifyUrl] = useState("")
  const [vibe, setVibe] = useState("")
  const [genres, setGenres] = useState("")
  const [similarArtists, setSimilarArtists] = useState("")

  const [matches, setMatches] = useState<PlaylistMatch[]>([])
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([])
  const [trackData, setTrackData] = useState<any>(null)

  async function handleFindMatches() {
    if (!spotifyUrl) {
      setError("Please enter a Spotify track URL")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/submissions/find-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotifyUrl,
          vibe,
          genres: genres.split(",").map(g => g.trim()).filter(Boolean),
          similarArtists: similarArtists.split(",").map(a => a.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to find matches")
      }

      const data = await response.json()
      setMatches(data.matches)
      setTrackData(data.track)
      setStep("matches")
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotifyUrl,
          vibe,
          genres: genres.split(",").map(g => g.trim()).filter(Boolean),
          similarArtists: similarArtists.split(",").map(a => a.trim()).filter(Boolean),
          playlistIds: selectedPlaylists,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create submission")
      }

      onOpenChange(false)
      resetForm()
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setStep("input")
    setSpotifyUrl("")
    setVibe("")
    setGenres("")
    setSimilarArtists("")
    setMatches([])
    setSelectedPlaylists([])
    setTrackData(null)
    setError("")
  }

  const togglePlaylist = (playlistId: string) => {
    setSelectedPlaylists(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    )
  }

  const selectAll = () => {
    setSelectedPlaylists(matches.map(m => m.id))
  }

  const unselectAll = () => {
    setSelectedPlaylists([])
  }

  const totalCost = selectedPlaylists.reduce((sum, id) => {
    const playlist = matches.find(m => m.id === id)
    return sum + (playlist?.tokenCost || 0)
  }, 0)

  const highMatches = matches.filter(m => m.potential === "HIGH")
  const mediumMatches = matches.filter(m => m.potential === "MEDIUM")
  const exploratoryMatches = matches.filter(m => m.potential === "EXPLORATORY")

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "input" && "Submit Your Track"}
            {step === "matches" && "Select Playlists"}
            {step === "confirm" && "Confirm Submission"}
          </DialogTitle>
          <DialogDescription>
            {step === "input" && "Enter your track details to find matching playlists"}
            {step === "matches" && `Found ${matches.length} matching playlists`}
            {step === "confirm" && "Review and confirm your submission"}
          </DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spotify-url">Spotify Track URL *</Label>
              <Input
                id="spotify-url"
                placeholder="https://open.spotify.com/track/..."
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vibe">Track Vibe (Optional)</Label>
              <Input
                id="vibe"
                placeholder="e.g., energetic, chill, emotional"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Describe the mood or feeling of your track
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genres">Genres (Recommended: 3-5)</Label>
              <Input
                id="genres"
                placeholder="indie, pop, electronic"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate genres with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="similar-artists">Similar Artists (Recommended: 3-5)</Label>
              <Input
                id="similar-artists"
                placeholder="Artist Name, Another Artist"
                value={similarArtists}
                onChange={(e) => setSimilarArtists(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Artists with a similar sound to your track
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {error}
              </div>
            )}

            <Button
              onClick={handleFindMatches}
              disabled={isLoading || !spotifyUrl}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Matches...
                </>
              ) : (
                "Find Matching Playlists"
              )}
            </Button>
          </div>
        )}

        {step === "matches" && (
          <div className="space-y-4">
            {trackData && (
              <div className="p-4 bg-muted rounded-lg flex gap-4 items-center">
                {trackData.imageUrl && (
                  <img src={trackData.imageUrl} alt={trackData.name} className="w-16 h-16 rounded" />
                )}
                <div>
                  <p className="font-semibold">{trackData.name}</p>
                  <p className="text-sm text-muted-foreground">{trackData.artist}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedPlaylists.length} playlists selected · {totalCost} tokens
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={unselectAll}>
                  Unselect All
                </Button>
              </div>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-8">
                <Music2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No matches found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your genres or similar artists
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {highMatches.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge className="bg-green-500">High Potential</Badge>
                    </h3>
                    <div className="space-y-2">
                      {highMatches.map(match => (
                        <PlaylistItem
                          key={match.id}
                          match={match}
                          selected={selectedPlaylists.includes(match.id)}
                          onToggle={() => togglePlaylist(match.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {mediumMatches.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge className="bg-yellow-500">Medium Potential</Badge>
                    </h3>
                    <div className="space-y-2">
                      {mediumMatches.map(match => (
                        <PlaylistItem
                          key={match.id}
                          match={match}
                          selected={selectedPlaylists.includes(match.id)}
                          onToggle={() => togglePlaylist(match.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {exploratoryMatches.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge className="bg-blue-500">Exploratory</Badge>
                    </h3>
                    <div className="space-y-2">
                      {exploratoryMatches.map(match => (
                        <PlaylistItem
                          key={match.id}
                          match={match}
                          selected={selectedPlaylists.includes(match.id)}
                          onToggle={() => togglePlaylist(match.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {error}
              </div>
            )}

            {totalCost > userTokenBalance && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Insufficient tokens</p>
                  <p>You need {totalCost - userTokenBalance} more tokens to submit to these playlists.</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || selectedPlaylists.length === 0 || totalCost > userTokenBalance}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit ({totalCost} <Coins className="ml-1 h-4 w-4" />)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function PlaylistItem({
  match,
  selected,
  onToggle,
}: {
  match: PlaylistMatch
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        selected ? "bg-primary/10 border-primary" : "hover:bg-muted"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} onCheckedChange={onToggle} onClick={(e) => e.stopPropagation()} />
        {match.imageUrl && (
          <img src={match.imageUrl} alt={match.name} className="w-12 h-12 rounded" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{match.name}</p>
              {match.curatorName && (
                <p className="text-xs text-muted-foreground">by {match.curatorName}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              {match.tokenCost}
              <Coins className="h-3 w-3" />
            </div>
          </div>
          {match.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {match.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{match.followers.toLocaleString()} followers</span>
            {match.matchReason.length > 0 && (
              <>
                <span>·</span>
                <span>{match.matchReason.join(", ")}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
