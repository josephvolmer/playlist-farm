const SPOTIFY_API_BASE = "https://api.spotify.com/v1"

let accessToken: string | null = null
let tokenExpiry: number = 0

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured")
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token")
  }

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000

  if (!accessToken) {
    throw new Error("Failed to retrieve access token from Spotify")
  }

  return accessToken
}

// Export the access token function for use in API routes
export const getSpotifyAccessToken = getAccessToken

export interface SpotifyTrack {
  id: string
  name: string
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; height: number; width: number }[]
  }
  duration_ms: number
  preview_url: string | null
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string | null
  images: { url: string; height: number | null; width: number | null }[]
  followers: {
    total: number
  }
  owner: {
    id: string
    display_name: string | null
  }
  tracks: {
    total: number
  }
}

export interface SpotifyArtist {
  id: string
  name: string
  genres: string[]
  followers: {
    total: number
  }
  images: { url: string; height: number; width: number }[]
}

export async function getTrackById(trackId: string): Promise<SpotifyTrack> {
  const token = await getAccessToken()

  const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch track from Spotify")
  }

  return response.json()
}

export async function getTrackFromUrl(url: string): Promise<SpotifyTrack> {
  const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/)
  if (!trackIdMatch) {
    throw new Error("Invalid Spotify track URL")
  }

  return getTrackById(trackIdMatch[1])
}

export async function getArtistById(artistId: string): Promise<SpotifyArtist> {
  const token = await getAccessToken()

  const response = await fetch(`${SPOTIFY_API_BASE}/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch artist from Spotify")
  }

  return response.json()
}

export async function getPlaylistById(playlistId: string): Promise<SpotifyPlaylist> {
  const token = await getAccessToken()

  const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch playlist from Spotify")
  }

  return response.json()
}

export async function searchArtists(query: string): Promise<SpotifyArtist[]> {
  const token = await getAccessToken()

  const response = await fetch(
    `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to search artists on Spotify")
  }

  const data = await response.json()
  return data.artists.items
}

export async function getAudioFeatures(trackId: string, userAccessToken?: string) {
  const token = userAccessToken || await getAccessToken()

  const response = await fetch(`${SPOTIFY_API_BASE}/audio-features/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Failed to fetch audio features for track ${trackId}:`, response.status, errorText)
    throw new Error(`Failed to fetch audio features from Spotify: ${response.status} - ${errorText}`)
  }

  return response.json()
}

export async function getArtistGenres(artistId: string): Promise<string[]> {
  const artist = await getArtistById(artistId)
  return artist.genres
}

// User-specific functions (require user's access token from session)

export async function getUserSavedTracks(
  userAccessToken: string,
  limit: number = 50
): Promise<SpotifyTrack[]> {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/tracks?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch user's saved tracks")
  }

  const data = await response.json()
  return data.items.map((item: any) => item.track)
}

export async function getUserTopTracks(
  userAccessToken: string,
  limit: number = 20
): Promise<SpotifyTrack[]> {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/top/tracks?limit=${limit}&time_range=medium_term`,
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch user's top tracks")
  }

  const data = await response.json()
  return data.items
}

export async function getTrackByIdWithUserToken(
  trackId: string,
  userAccessToken: string
): Promise<SpotifyTrack> {
  const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Failed to fetch track ${trackId} from Spotify:`, response.status, errorText)
    throw new Error(`Failed to fetch track from Spotify: ${response.status} - ${errorText}`)
  }

  return response.json()
}
