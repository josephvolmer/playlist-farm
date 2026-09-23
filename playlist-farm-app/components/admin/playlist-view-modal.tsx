"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface PlaylistViewModalProps {
  playlist: {
    id: string
    spotifyId: string
    name: string
    description: string | null
    imageUrl: string | null
    curatorName: string
    curatorEmail: string | null
    curatorInstagram: string | null
    curatorWebsite: string | null
    followers: number
    genres: string[]
    moods: string[]
    isActive: boolean
    acceptsSubmissions: boolean
    submissionNotes: string | null
    trackCount: number | null
    createdAt: Date
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlaylistViewModal({ playlist, open, onOpenChange }: PlaylistViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950">
        <VisuallyHidden>
          <DialogTitle>View Playlist: {playlist.name}</DialogTitle>
        </VisuallyHidden>
        <Card className="bg-white dark:bg-gray-950 border-0">
          <CardContent className="p-6 bg-white dark:bg-gray-950">
            <div className="flex gap-4 items-start">
              {/* Playlist Image */}
              {playlist.imageUrl && (
                <img
                  src={playlist.imageUrl}
                  alt={playlist.name}
                  className="w-24 h-24 rounded object-cover flex-shrink-0"
                />
              )}

              {/* Playlist Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-xl">{playlist.name}</h3>
                  {playlist.isActive ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                  {playlist.acceptsSubmissions && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Accepting Submissions
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  by {playlist.curatorName} · 🎵 {playlist.followers.toLocaleString()} followers
                  {playlist.trackCount ? ` · ${playlist.trackCount} tracks` : ''}
                </p>

                {playlist.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {playlist.description}
                  </p>
                )}

                {/* Genres */}
                {playlist.genres && playlist.genres.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">GENRES</p>
                    <div className="flex flex-wrap gap-1">
                      {playlist.genres.map((genre: string) => (
                        <span
                          key={genre}
                          className="text-xs px-2 py-0.5 bg-secondary rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Moods */}
                {playlist.moods && playlist.moods.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">MOODS</p>
                    <div className="flex flex-wrap gap-1">
                      {playlist.moods.map((mood: string) => (
                        <span
                          key={mood}
                          className="text-xs px-2 py-0.5 bg-muted rounded"
                        >
                          {mood}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Curator Contact */}
                {(playlist.curatorEmail || playlist.curatorInstagram || playlist.curatorWebsite) && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">CONTACT</p>
                    <div className="space-y-1 text-sm">
                      {playlist.curatorEmail && (
                        <div>
                          📧 <a href={`mailto:${playlist.curatorEmail}`} className="hover:underline">
                            {playlist.curatorEmail}
                          </a>
                        </div>
                      )}
                      {playlist.curatorInstagram && (
                        <div>
                          📷 <a
                            href={`https://instagram.com/${playlist.curatorInstagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {playlist.curatorInstagram}
                          </a>
                        </div>
                      )}
                      {playlist.curatorWebsite && (
                        <div>
                          🌐 <a
                            href={playlist.curatorWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline break-all"
                          >
                            {playlist.curatorWebsite}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Notes */}
            {playlist.submissionNotes && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p className="text-xs font-medium mb-1 text-blue-900 dark:text-blue-100">
                  📝 Submission Notes:
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {playlist.submissionNotes}
                </p>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Spotify ID:</span> {playlist.spotifyId}
                </div>
                <div className="text-right">
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(playlist.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
