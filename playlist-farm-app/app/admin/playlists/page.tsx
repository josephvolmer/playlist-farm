"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Eye, Upload } from "lucide-react"
import { PlaylistEditModal } from "@/components/admin/playlist-edit-modal"
import { PlaylistViewModal } from "@/components/admin/playlist-view-modal"
import { PlaylistImportModal } from "@/components/admin/playlist-import-modal"

type Playlist = {
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
  trackCount: number | null
  genres: string[]
  moods: string[]
  isActive: boolean
  acceptsSubmissions: boolean
  submissionNotes: string | null
  createdAt: Date
  updatedAt: Date
}

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  const [viewingPlaylist, setViewingPlaylist] = useState<Playlist | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("/api/admin/playlists")
      if (!response.ok) throw new Error("Failed to fetch playlists")
      const data = await response.json()
      setPlaylists(data)
    } catch (error) {
      console.error("Error fetching playlists:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Playlists</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Playlists</CardTitle>
            <Button onClick={() => setImportModalOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Import from XLSX
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Curator</TableHead>
                <TableHead>Curator Email</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Track Count</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlists.map((playlist) => (
                <TableRow key={playlist.id}>
                  <TableCell className="font-mono text-xs">
                    {playlist.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">{playlist.name}</TableCell>
                  <TableCell>{playlist.curatorName || "-"}</TableCell>
                  <TableCell>{playlist.curatorEmail || "-"}</TableCell>
                  <TableCell>{playlist.followers?.toLocaleString() || 0}</TableCell>
                  <TableCell>{playlist.trackCount || 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(playlist.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingPlaylist(playlist)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingPlaylist(playlist)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {playlists.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No playlists found
            </p>
          )}
        </CardContent>
      </Card>

      {editingPlaylist && (
        <PlaylistEditModal
          playlist={editingPlaylist}
          open={!!editingPlaylist}
          onOpenChange={(open) => !open && setEditingPlaylist(null)}
          onSave={() => {
            fetchPlaylists()
            setEditingPlaylist(null)
          }}
        />
      )}

      {viewingPlaylist && (
        <PlaylistViewModal
          playlist={viewingPlaylist}
          open={!!viewingPlaylist}
          onOpenChange={(open) => !open && setViewingPlaylist(null)}
        />
      )}

      <PlaylistImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportComplete={() => {
          fetchPlaylists()
        }}
      />
    </>
  )
}
