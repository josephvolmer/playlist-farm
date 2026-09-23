interface TrackData {
  audioFeatures: {
    danceability: number
    energy: number
    valence: number
    tempo: number
    acousticness: number
    instrumentalness: number
    speechiness: number
    loudness: number
  }
  genres: string[]
}

interface PlaylistData {
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
}

export interface PlaylistMatch {
  playlist: PlaylistData
  score: number
  matchReasons: string[]
}

// Helper function to calculate similarity between two values (0-1)
function similarity(a: number, b: number, maxDiff: number = 1): number {
  return 1 - Math.min(Math.abs(a - b) / maxDiff, 1)
}

// Helper function to calculate genre overlap
function genreOverlap(trackGenres: string[], playlistGenres: string[]): number {
  if (trackGenres.length === 0 || playlistGenres.length === 0) {
    return 0
  }

  const trackGenresLower = trackGenres.map((g) => g.toLowerCase())
  const playlistGenresLower = playlistGenres.map((g) => g.toLowerCase())

  let matches = 0
  for (const trackGenre of trackGenresLower) {
    for (const playlistGenre of playlistGenresLower) {
      // Exact match
      if (trackGenre === playlistGenre) {
        matches += 1
        break
      }
      // Partial match (e.g., "indie rock" contains "indie")
      if (trackGenre.includes(playlistGenre) || playlistGenre.includes(trackGenre)) {
        matches += 0.5
        break
      }
    }
  }

  return matches / Math.max(trackGenresLower.length, playlistGenresLower.length)
}

// Helper function to map audio features to moods
function getMoodsFromAudioFeatures(audioFeatures: TrackData["audioFeatures"]): string[] {
  const moods: string[] = []

  // High valence = happy, positive
  if (audioFeatures.valence > 0.6) {
    moods.push("happy", "upbeat", "positive")
  } else if (audioFeatures.valence < 0.4) {
    moods.push("sad", "melancholic", "emotional")
  }

  // High energy = energetic
  if (audioFeatures.energy > 0.7) {
    moods.push("energetic", "intense")
  } else if (audioFeatures.energy < 0.4) {
    moods.push("calm", "relaxing")
  }

  // High danceability
  if (audioFeatures.danceability > 0.7) {
    moods.push("danceable", "groovy")
  }

  // Acoustic
  if (audioFeatures.acousticness > 0.6) {
    moods.push("acoustic", "organic")
  }

  // Chill = low energy + mid-high valence
  if (audioFeatures.energy < 0.5 && audioFeatures.valence > 0.4 && audioFeatures.valence < 0.7) {
    moods.push("chill", "mellow")
  }

  return moods
}

// Helper function to check mood overlap
function moodOverlap(trackMoods: string[], playlistMoods: string[]): number {
  if (trackMoods.length === 0 || playlistMoods.length === 0) {
    return 0
  }

  const trackMoodsLower = trackMoods.map((m) => m.toLowerCase())
  const playlistMoodsLower = playlistMoods.map((m) => m.toLowerCase())

  let matches = 0
  for (const trackMood of trackMoodsLower) {
    for (const playlistMood of playlistMoodsLower) {
      if (trackMood === playlistMood || trackMood.includes(playlistMood) || playlistMood.includes(trackMood)) {
        matches += 1
        break
      }
    }
  }

  return matches / Math.max(trackMoodsLower.length, playlistMoodsLower.length)
}

/**
 * Matches a track against curated playlists and returns the top matches
 * @param trackData - Enriched track data with audio features and genres
 * @param playlists - Array of curated playlists to match against
 * @param limit - Maximum number of matches to return (default 5)
 * @returns Array of playlist matches sorted by score (highest first)
 */
export function matchTrackToPlaylists(
  trackData: TrackData,
  playlists: PlaylistData[],
  limit: number = 5
): PlaylistMatch[] {
  const matches: PlaylistMatch[] = []

  // Get moods from track audio features
  const trackMoods = getMoodsFromAudioFeatures(trackData.audioFeatures)

  for (const playlist of playlists) {
    // Skip inactive playlists or those not accepting submissions
    if (!playlist.isActive || !playlist.acceptsSubmissions) {
      continue
    }

    let score = 0
    const matchReasons: string[] = []

    // 1. Genre matching (40% of score)
    const genreScore = genreOverlap(trackData.genres, playlist.genres)
    score += genreScore * 0.4
    if (genreScore > 0.3) {
      matchReasons.push(`Genre match (${Math.round(genreScore * 100)}%)`)
    }

    // 2. Mood matching (30% of score)
    const moodScore = moodOverlap(trackMoods, playlist.moods)
    score += moodScore * 0.3
    if (moodScore > 0.3) {
      matchReasons.push(`Mood match (${Math.round(moodScore * 100)}%)`)
    }

    // 3. Audio features similarity (30% of score)
    // We'll compare energy, valence, and danceability as they're most perceptually relevant
    const energySim = similarity(trackData.audioFeatures.energy, 0.5) // Assume playlists prefer mid-energy
    const valenceSim = similarity(trackData.audioFeatures.valence, 0.5)
    const danceabilitySim = similarity(trackData.audioFeatures.danceability, 0.5)

    const audioScore = (energySim + valenceSim + danceabilitySim) / 3
    score += audioScore * 0.3

    // Bonus: Playlist popularity (followers)
    // Higher followers = slightly better match (can lead to more exposure)
    if (playlist.followers > 10000) {
      matchReasons.push(`Popular playlist (${playlist.followers.toLocaleString()} followers)`)
    }

    // Only include playlists with a score above threshold
    if (score > 0.2) {
      matches.push({
        playlist,
        score,
        matchReasons: matchReasons.length > 0 ? matchReasons : ["Potential match"],
      })
    }
  }

  // Sort by score (highest first) and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
