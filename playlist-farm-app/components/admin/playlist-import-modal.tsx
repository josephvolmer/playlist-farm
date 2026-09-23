"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PlaylistImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

export function PlaylistImportModal({ open, onOpenChange, onImportComplete }: PlaylistImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [result, setResult] = useState<{
    total: number
    created: number
    updated: number
    skipped: number
    errors: string[]
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("updateExisting", String(updateExisting))

      const response = await fetch("/api/admin/playlists/import", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to import playlists")
      }

      const data = await response.json()
      setResult(data)

      if (data.errors.length === 0 || data.created > 0 || data.updated > 0) {
        onImportComplete()
      }
    } catch (error) {
      console.error("Error importing playlists:", error)
      setResult({
        total: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : "An error occurred"],
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setUpdateExisting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle>Import Playlists</DialogTitle>
          <DialogDescription>
            Upload an XLSX file from playlist-farm to import playlists in batch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={importing}
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Update Existing Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="updateExisting"
              checked={updateExisting}
              onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
              disabled={importing}
            />
            <Label htmlFor="updateExisting" className="text-sm cursor-pointer">
              Update existing playlists (by default, existing playlists will be skipped to preserve manual edits)
            </Label>
          </div>

          {/* Expected Format Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Expected Format</AlertTitle>
            <AlertDescription>
              The XLSX file should contain columns: Playlist ID, Playlist Name, Description, Curator Name,
              Curator Email, Curator Instagram, Curator Website, Image URL, Followers, Track Count, Genres,
              Moods, Active, Accepts Submissions, Submission Notes
            </AlertDescription>
          </Alert>

          {/* Import Results */}
          {result && (
            <div className="space-y-2">
              <Alert className={result.errors.length > 0 ? "border-yellow-500" : "border-green-500"}>
                {result.errors.length > 0 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertTitle>Import Complete</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1 mt-2">
                    <p>Total rows processed: {result.total}</p>
                    <p className="text-green-600">✓ Created: {result.created}</p>
                    <p className="text-blue-600">↻ Updated: {result.updated}</p>
                    <p className="text-gray-600">⊝ Skipped: {result.skipped}</p>
                    {result.errors.length > 0 && (
                      <p className="text-yellow-600">⚠ Errors: {result.errors.length}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Error Details */}
              {result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded p-3 bg-yellow-50 dark:bg-yellow-950/20">
                  <p className="text-sm font-semibold mb-2">Error Details:</p>
                  <ul className="text-sm space-y-1">
                    {result.errors.slice(0, 10).map((error, i) => (
                      <li key={i} className="text-yellow-800 dark:text-yellow-200">
                        • {error}
                      </li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="text-yellow-600">
                        ... and {result.errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={importing}>
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <Button onClick={handleImport} disabled={!file || importing} className="gap-2">
                <Upload className="h-4 w-4" />
                {importing ? "Importing..." : "Import Playlists"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
