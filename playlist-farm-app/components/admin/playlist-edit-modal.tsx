"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface PlaylistEditModalProps {
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
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function PlaylistEditModal({ playlist, open, onOpenChange, onSave }: PlaylistEditModalProps) {
  const [formData, setFormData] = useState({
    name: playlist.name,
    description: playlist.description || "",
    curatorName: playlist.curatorName,
    curatorEmail: playlist.curatorEmail || "",
    curatorInstagram: playlist.curatorInstagram || "",
    curatorWebsite: playlist.curatorWebsite || "",
    imageUrl: playlist.imageUrl || "",
    followers: playlist.followers,
    isActive: playlist.isActive,
    acceptsSubmissions: playlist.acceptsSubmissions,
    submissionNotes: playlist.submissionNotes || "",
    genres: playlist.genres,
    moods: playlist.moods,
  })
  const [genreInput, setGenreInput] = useState("")
  const [moodInput, setMoodInput] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/playlists/${playlist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update playlist")

      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating playlist:", error)
      alert("Failed to update playlist")
    } finally {
      setSaving(false)
    }
  }

  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData({ ...formData, genres: [...formData.genres, genreInput.trim()] })
      setGenreInput("")
    }
  }

  const removeGenre = (genre: string) => {
    setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) })
  }

  const addMood = () => {
    if (moodInput.trim() && !formData.moods.includes(moodInput.trim())) {
      setFormData({ ...formData, moods: [...formData.moods, moodInput.trim()] })
      setMoodInput("")
    }
  }

  const removeMood = (mood: string) => {
    setFormData({ ...formData, moods: formData.moods.filter(m => m !== mood) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle>Edit Playlist</DialogTitle>
          <DialogDescription>
            Update playlist information and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Playlist Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curatorName">Curator Name</Label>
              <Input
                id="curatorName"
                value={formData.curatorName}
                onChange={(e) => setFormData({ ...formData, curatorName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curatorEmail">Curator Email</Label>
              <Input
                id="curatorEmail"
                type="email"
                value={formData.curatorEmail}
                onChange={(e) => setFormData({ ...formData, curatorEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curatorInstagram">Curator Instagram</Label>
              <Input
                id="curatorInstagram"
                value={formData.curatorInstagram}
                onChange={(e) => setFormData({ ...formData, curatorInstagram: e.target.value })}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curatorWebsite">Curator Website</Label>
              <Input
                id="curatorWebsite"
                type="url"
                value={formData.curatorWebsite}
                onChange={(e) => setFormData({ ...formData, curatorWebsite: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followers">Followers</Label>
            <Input
              id="followers"
              type="number"
              value={formData.followers}
              onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Genres</Label>
            <div className="flex gap-2">
              <Input
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                placeholder="Add genre..."
              />
              <Button type="button" onClick={addGenre}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="gap-1">
                  {genre}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeGenre(genre)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Moods</Label>
            <div className="flex gap-2">
              <Input
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMood())}
                placeholder="Add mood..."
              />
              <Button type="button" onClick={addMood}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.moods.map((mood) => (
                <Badge key={mood} variant="secondary" className="gap-1">
                  {mood}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeMood(mood)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="submissionNotes">Submission Notes</Label>
            <Textarea
              id="submissionNotes"
              value={formData.submissionNotes}
              onChange={(e) => setFormData({ ...formData, submissionNotes: e.target.value })}
              rows={2}
              placeholder="Special instructions for artists..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="acceptsSubmissions"
                checked={formData.acceptsSubmissions}
                onCheckedChange={(checked) => setFormData({ ...formData, acceptsSubmissions: checked })}
              />
              <Label htmlFor="acceptsSubmissions">Accepts Submissions</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
