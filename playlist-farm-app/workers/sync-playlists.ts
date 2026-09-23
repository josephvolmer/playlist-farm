#!/usr/bin/env tsx
/**
 * Playlist Sync Worker
 *
 * This worker runs on a schedule and fetches playlists from the playlist-farm API,
 * adding new playlists to the database while skipping existing ones to preserve manual edits.
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface PlaylistData {
  spotifyId: string
  name: string
  description?: string
  imageUrl?: string
  curatorName: string
  curatorEmail?: string
  curatorInstagram?: string
  curatorWebsite?: string
  followers?: number
  trackCount?: number
  genres?: string[]
  moods?: string[]
  isActive?: boolean
  acceptsSubmissions?: boolean
  submissionNotes?: string
}

async function syncPlaylists() {
  const startTime = Date.now()
  console.log(`[${new Date().toISOString()}] Starting playlist sync...`)

  const cronSecret = process.env.CRON_SECRET
  const appUrl = process.env.APP_URL || "http://app:3000"

  if (!cronSecret) {
    console.error("ERROR: CRON_SECRET environment variable is not set")
    process.exit(1)
  }

  try {
    // Call the Next.js API endpoint to sync playlists
    const apiUrl = `${appUrl}/api/cron/sync-playlists`
    console.log(`Calling sync API: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API returned ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n[${new Date().toISOString()}] Sync completed in ${duration}s`)
    console.log(`Total: ${result.total || 0}`)
    console.log(`✓ Created: ${result.created || 0}`)
    console.log(`⊝ Skipped: ${result.skipped || 0}`)
    if (result.errors && result.errors.length > 0) {
      console.log(`⚠ Errors: ${result.errors.length}`)
      result.errors.forEach((error: string) => console.error(`  - ${error}`))
    }

    process.exit(0)
  } catch (error) {
    console.error(`\n[${new Date().toISOString()}] Sync failed:`, error)
    process.exit(1)
  }
}

// Run the sync
syncPlaylists()
