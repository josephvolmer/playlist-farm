import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { matchTrackToPlaylists } from "@/lib/matching"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - please log in with Spotify" },
        { status: 401 }
      )
    }

    const { audioFeatures, genres } = await req.json()

    if (!audioFeatures || !genres) {
      return NextResponse.json(
        { error: "Audio features and genres are required" },
        { status: 400 }
      )
    }

    // Fetch all active curated playlists
    const playlists = await prisma.curatedPlaylist.findMany({
      where: {
        isActive: true,
        acceptsSubmissions: true,
      },
    })

    // Use the matching algorithm to find the best matches
    const matches = matchTrackToPlaylists(
      {
        audioFeatures,
        genres,
      },
      playlists,
      5 // Return top 5 matches
    )

    return NextResponse.json({
      matches,
    })
  } catch (error) {
    console.error("Playlist matching error:", error)
    return NextResponse.json(
      { error: "Failed to match playlists" },
      { status: 500 }
    )
  }
}
