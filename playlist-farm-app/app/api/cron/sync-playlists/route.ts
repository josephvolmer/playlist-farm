import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This endpoint can be called by a cron service (like Vercel Cron, cron-job.org, etc.)
// Protected by a secret token to prevent unauthorized access
export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const playlistFarmApiUrl = process.env.PLAYLIST_FARM_API_URL

    if (!playlistFarmApiUrl) {
      return NextResponse.json(
        { error: "PLAYLIST_FARM_API_URL not configured" },
        { status: 500 }
      )
    }

    // Fetch playlists from playlist-farm API
    const response = await fetch(playlistFarmApiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch from playlist-farm: ${response.statusText}`)
    }

    const playlists = await response.json()

    const results = {
      total: Array.isArray(playlists) ? playlists.length : 0,
      created: 0,
      skipped: 0,
      errors: [] as string[],
    }

    if (!Array.isArray(playlists)) {
      return NextResponse.json(
        { error: "Invalid response from playlist-farm API" },
        { status: 500 }
      )
    }

    // Process each playlist
    for (const playlist of playlists) {
      try {
        // Validate required fields
        if (!playlist.spotifyId || !playlist.name || !playlist.curatorName) {
          results.errors.push(`Playlist missing required fields: ${playlist.spotifyId}`)
          continue
        }

        // Check if playlist already exists
        const existing = await prisma.curatedPlaylist.findUnique({
          where: { spotifyId: playlist.spotifyId },
        })

        if (existing) {
          // Skip existing playlists to preserve manual edits
          results.skipped++
        } else {
          // Create new playlist
          await prisma.curatedPlaylist.create({
            data: {
              spotifyId: playlist.spotifyId,
              name: playlist.name,
              description: playlist.description || null,
              imageUrl: playlist.imageUrl || null,
              curatorName: playlist.curatorName,
              curatorEmail: playlist.curatorEmail || null,
              curatorInstagram: playlist.curatorInstagram || null,
              curatorWebsite: playlist.curatorWebsite || null,
              followers: playlist.followers || 0,
              genres: Array.isArray(playlist.genres) ? playlist.genres : [],
              moods: Array.isArray(playlist.moods) ? playlist.moods : [],
              isActive: playlist.isActive !== false, // Default to true
              acceptsSubmissions: playlist.acceptsSubmissions === true,
              submissionNotes: playlist.submissionNotes || null,
            },
          })
          results.created++
        }
      } catch (error) {
        results.errors.push(
          `Error processing playlist ${playlist.spotifyId}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }

    // Log the sync result
    console.log(`Playlist sync completed:`, results)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    })
  } catch (error) {
    console.error("Playlist sync error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
