import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import {
  getTrackByIdWithUserToken,
  getAudioFeatures,
  getArtistGenres,
} from "@/lib/spotify"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.accessToken) {
      console.error("No session or access token:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasAccessToken: !!session?.user?.accessToken
      })
      return NextResponse.json(
        { error: "Unauthorized - please log in with Spotify" },
        { status: 401 }
      )
    }

    console.log("User access token exists:", !!session.user.accessToken)

    const { trackUrl, trackId } = await req.json()

    console.log("Received trackUrl:", trackUrl)
    console.log("Received trackId:", trackId)

    // Extract track ID from URL if provided
    let finalTrackId = trackId
    if (trackUrl && !trackId) {
      const trackIdMatch = trackUrl.match(/track\/([a-zA-Z0-9]+)/)
      if (!trackIdMatch) {
        console.error("Failed to extract track ID from URL:", trackUrl)
        return NextResponse.json(
          { error: "Invalid Spotify track URL" },
          { status: 400 }
        )
      }
      finalTrackId = trackIdMatch[1]
      console.log("Extracted track ID:", finalTrackId)
    }

    if (!finalTrackId) {
      return NextResponse.json(
        { error: "Track ID or URL is required" },
        { status: 400 }
      )
    }

    console.log("Final track ID to fetch:", finalTrackId)

    // Fetch track details first
    const track = await getTrackByIdWithUserToken(finalTrackId, session.user.accessToken)

    // Try to fetch audio features, but continue without them if it fails
    let audioFeatures
    try {
      audioFeatures = await getAudioFeatures(finalTrackId)
    } catch (error) {
      console.warn("Audio features unavailable, using defaults:", error)
      // Provide default values if audio features aren't available
      audioFeatures = {
        danceability: 0.5,
        energy: 0.5,
        valence: 0.5,
        tempo: 120,
        acousticness: 0.5,
        instrumentalness: 0.5,
        speechiness: 0.5,
        loudness: -10,
        key: 0,
        mode: 1,
      }
    }

    // Then fetch genres for all artists
    const artistGenres = await Promise.all(
      track.artists.map((artist) => getArtistGenres(artist.id))
    )

    // Combine all genres from all artists
    const allGenres = artistGenres.flat()

    // Return enriched track data
    return NextResponse.json({
      track: {
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        duration_ms: track.duration_ms,
        preview_url: track.preview_url,
      },
      audioFeatures: {
        danceability: audioFeatures.danceability,
        energy: audioFeatures.energy,
        valence: audioFeatures.valence,
        tempo: audioFeatures.tempo,
        acousticness: audioFeatures.acousticness,
        instrumentalness: audioFeatures.instrumentalness,
        speechiness: audioFeatures.speechiness,
        loudness: audioFeatures.loudness,
        key: audioFeatures.key,
        mode: audioFeatures.mode,
      },
      genres: allGenres,
    })
  } catch (error) {
    console.error("Track analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze track" },
      { status: 500 }
    )
  }
}
