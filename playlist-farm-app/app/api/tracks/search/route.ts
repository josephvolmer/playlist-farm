import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { getSpotifyAccessToken } from "@/lib/spotify"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - please log in with Spotify" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const types = searchParams.get("types") || "track"

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    // Get Spotify access token (using app credentials, not user token)
    const accessToken = await getSpotifyAccessToken()

    // Search for tracks/artists/albums on Spotify
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${types}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!searchResponse.ok) {
      throw new Error("Failed to search Spotify")
    }

    const searchData = await searchResponse.json()

    return NextResponse.json({
      tracks: searchData.tracks?.items || [],
      artists: searchData.artists?.items || [],
      albums: searchData.albums?.items || [],
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    )
  }
}
