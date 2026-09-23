import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { getSpotifyAccessToken } from "@/lib/spotify"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - please log in with Spotify" },
        { status: 401 }
      )
    }

    const { id: albumId } = await params

    if (!albumId) {
      return NextResponse.json(
        { error: "Album ID is required" },
        { status: 400 }
      )
    }

    // Get Spotify access token
    const accessToken = await getSpotifyAccessToken()

    // Get album tracks from Spotify
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch album tracks from Spotify")
    }

    const data = await response.json()

    return NextResponse.json({
      tracks: data.items,
    })
  } catch (error) {
    console.error("Album tracks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch album tracks" },
      { status: 500 }
    )
  }
}
