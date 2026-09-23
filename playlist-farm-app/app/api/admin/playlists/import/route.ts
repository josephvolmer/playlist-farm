import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { isAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const updateExisting = formData.get("updateExisting") === "true"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read the file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse XLSX
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)

    const results = {
      total: data.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Process each row
    for (const row of data as any[]) {
      try {
        // Map playlist-farm column names to our schema
        const playlistData = {
          spotifyId: row["Playlist ID"] || row["playlistId"] || "",
          name: row["Playlist Name"] || row["name"] || "",
          description: row["Description"] || row["description"] || null,
          imageUrl: row["Image URL"] || row["imageUrl"] || null,
          curatorName: row["Curator Name"] || row["curatorName"] || "",
          curatorEmail: row["Curator Email"] || row["curatorEmail"] || null,
          curatorInstagram: row["Curator Instagram"] || row["curatorInstagram"] || null,
          curatorWebsite: row["Curator Website"] || row["curatorWebsite"] || null,
          followers: parseInt(row["Followers"] || row["followers"] || "0"),
          trackCount: parseInt(row["Track Count"] || row["trackCount"] || "0") || null,
          genres: parseArrayField(row["Genres"] || row["genres"]),
          moods: parseArrayField(row["Moods"] || row["moods"]),
          isActive: parseBooleanField(row["Active"] || row["isActive"]),
          acceptsSubmissions: parseBooleanField(row["Accepts Submissions"] || row["acceptsSubmissions"]),
          submissionNotes: row["Submission Notes"] || row["submissionNotes"] || null,
        }

        if (!playlistData.spotifyId || !playlistData.name || !playlistData.curatorName) {
          results.errors.push(`Row missing required fields: ${JSON.stringify(row)}`)
          continue
        }

        // Check if playlist already exists
        const existing = await prisma.curatedPlaylist.findUnique({
          where: { spotifyId: playlistData.spotifyId },
        })

        if (existing) {
          if (updateExisting) {
            // Update existing playlist
            await prisma.curatedPlaylist.update({
              where: { spotifyId: playlistData.spotifyId },
              data: playlistData,
            })
            results.updated++
          } else {
            // Skip existing playlist to preserve manual edits
            results.skipped++
          }
        } else {
          // Create new playlist
          await prisma.curatedPlaylist.create({
            data: playlistData,
          })
          results.created++
        }
      } catch (error) {
        results.errors.push(`Error processing row: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error importing playlists:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Helper functions
function parseArrayField(value: any): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    // Handle comma-separated or JSON array strings
    if (value.startsWith("[")) {
      try {
        return JSON.parse(value)
      } catch {
        return []
      }
    }
    return value.split(",").map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function parseBooleanField(value: any): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const lower = value.toLowerCase()
    return lower === "true" || lower === "yes" || lower === "1"
  }
  if (typeof value === "number") return value === 1
  return false
}
