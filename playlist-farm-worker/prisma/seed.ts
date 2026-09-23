import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Sample curated playlists
  const playlists = [
    {
      spotifyId: '37i9dQZF1DX0XUsuxWHRQd',
      name: 'RapCaviar',
      description: 'New music from Lil Baby, Drake, Lil Durk and more.',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a6',
      curatorName: 'Spotify',
      curatorEmail: 'playlist-submissions@spotify.com',
      followers: 14500000,
      genres: ['hip hop', 'rap', 'trap'],
      moods: ['energetic', 'upbeat', 'intense'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Looking for fresh hip-hop and rap tracks. Must have professional production quality.',
    },
    {
      spotifyId: '37i9dQZF1DWWEcRhUVtL8n',
      name: 'Indie Vibes',
      description: 'The best new indie music.',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002b60db5d1bcdd9c4fd1ebcffe',
      curatorName: 'Spotify',
      curatorEmail: 'indie-vibes@spotify.com',
      followers: 2800000,
      genres: ['indie', 'indie rock', 'indie pop', 'alternative'],
      moods: ['chill', 'mellow', 'upbeat'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Seeking unique indie sounds with authentic vocals and creative production.',
    },
    {
      spotifyId: '37i9dQZF1DX4dyzvuaRJ0n',
      name: 'Mint',
      description: 'The best new music.',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002767a6d0e4f0ced37db0d7e96',
      curatorName: 'Spotify',
      curatorEmail: 'mint-playlist@spotify.com',
      followers: 5600000,
      genres: ['pop', 'indie', 'electronic', 'alternative'],
      moods: ['upbeat', 'positive', 'energetic', 'danceable'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Curating the freshest tracks across multiple genres. High production quality required.',
    },
    {
      spotifyId: '37i9dQZF1DX1s9knjP51Oa',
      name: 'Chill Vibes',
      description: 'Kick back to the best new and recent chill hits.',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002b70e7b6b2070a3eb0681001d',
      curatorName: 'Spotify',
      curatorEmail: 'chill-vibes@spotify.com',
      followers: 3400000,
      genres: ['chill', 'indie', 'electronic', 'lo-fi'],
      moods: ['relaxing', 'calm', 'chill', 'mellow'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Perfect for laid-back listening. Looking for smooth, atmospheric tracks.',
    },
    {
      spotifyId: '37i9dQZF1DX0FOF1IUWK1W',
      name: 'Rock This',
      description: 'New music from rock\'s freshest faces.',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002e9c820ea4e94a48e87625dea',
      curatorName: 'Spotify',
      curatorEmail: 'rock-this@spotify.com',
      followers: 1200000,
      genres: ['rock', 'alternative rock', 'indie rock', 'garage rock'],
      moods: ['energetic', 'intense', 'upbeat'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Raw energy and authentic rock sound. Live instruments preferred.',
    },
    {
      spotifyId: '37i9dQZF1DWZd79rJ6a7lp',
      name: 'Happy Hits!',
      description: 'Hits to boost your mood and fill you with happiness!',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002ee4e8a630bc61bc3d87a8e3d',
      curatorName: 'Spotify',
      curatorEmail: 'happy-hits@spotify.com',
      followers: 6200000,
      genres: ['pop', 'dance pop', 'indie pop'],
      moods: ['happy', 'upbeat', 'positive', 'danceable', 'groovy'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Uplifting, feel-good tracks that make people smile and dance!',
    },
    {
      spotifyId: '37i9dQZF1DX4SBhb3fqCJd',
      name: 'Are & Be',
      description: 'The best R&B right now.',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002c035847b20c4a27f16e5c02a',
      curatorName: 'Spotify',
      curatorEmail: 'rnb-playlist@spotify.com',
      followers: 4100000,
      genres: ['r&b', 'soul', 'contemporary r&b'],
      moods: ['emotional', 'smooth', 'mellow'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Smooth R&B with soulful vocals. Looking for emotional depth and great melodies.',
    },
    {
      spotifyId: '37i9dQZF1DX3rxVfibe1L0',
      name: 'Mood Booster',
      description: 'Get happy with today\'s dose of feel-good songs!',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002e34da3e6f2b67b9fb120c0ff',
      curatorName: 'Spotify',
      curatorEmail: 'mood-booster@spotify.com',
      followers: 8900000,
      genres: ['pop', 'indie', 'dance', 'electronic'],
      moods: ['happy', 'positive', 'upbeat', 'energetic'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'High-energy, positive vibes only. Must make people want to move!',
    },
    {
      spotifyId: '37i9dQZF1DX4WYpdgoIcn6',
      name: 'Chill Hits',
      description: 'Kick back to the best new and recent chill hits.',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002a21e7d5c3c92ca5e9a0b734e',
      curatorName: 'Spotify',
      curatorEmail: 'chill-hits@spotify.com',
      followers: 7300000,
      genres: ['pop', 'indie', 'chill', 'acoustic'],
      moods: ['chill', 'mellow', 'relaxing', 'calm'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Laid-back, easy-listening tracks. Perfect for background music.',
    },
    {
      spotifyId: '37i9dQZF1DXa2PvUpywmrr',
      name: 'Sad Songs',
      description: 'Beautiful songs for when you feel like crying.',
      imageUrl: 'https://i.scdn.co/image/ab67706f00000002b1ab304c07e62bff1e9e3ba3',
      curatorName: 'Spotify',
      curatorEmail: 'sad-songs@spotify.com',
      followers: 3700000,
      genres: ['indie', 'alternative', 'singer-songwriter', 'acoustic'],
      moods: ['sad', 'melancholic', 'emotional'],
      isActive: true,
      acceptsSubmissions: true,
      submissionNotes: 'Emotional, heartfelt songs with powerful lyrics and intimate production.',
    },
  ]

  for (const playlist of playlists) {
    await prisma.curatedPlaylist.upsert({
      where: { spotifyId: playlist.spotifyId },
      update: playlist,
      create: playlist,
    })
    console.log(`✓ Created/updated playlist: ${playlist.name}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
