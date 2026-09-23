import * as XLSX from 'xlsx'
import { PrismaClient } from '@prisma/client'
import * as path from 'path'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Common mood keywords to extract from descriptions
const MOOD_KEYWORDS = {
  chill: ['chill', 'relax', 'calm', 'peaceful', 'mellow', 'laid back', 'lofi'],
  upbeat: ['upbeat', 'energetic', 'happy', 'positive', 'cheerful', 'fun'],
  workout: ['workout', 'gym', 'exercise', 'fitness', 'running', 'training'],
  study: ['study', 'focus', 'concentration', 'work', 'productivity'],
  party: ['party', 'dance', 'club', 'night out', 'celebration'],
  sad: ['sad', 'melancholy', 'emotional', 'heartbreak', 'lonely'],
  romantic: ['romantic', 'love', 'romance', 'date night', 'intimate'],
  sleep: ['sleep', 'bedtime', 'night', 'sleepy', 'insomnia'],
  driving: ['driving', 'road trip', 'car', 'highway'],
  gaming: ['gaming', 'game', 'video game', 'esports'],
}

/**
 * Extract moods from playlist description and name
 */
function extractMoods(text: string): string[] {
  const lowerText = text.toLowerCase()
  const moods: string[] = []

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      moods.push(mood)
    }
  }

  return [...new Set(moods)] // Remove duplicates
}

/**
 * Parse Spotify playlist URL to extract playlist ID
 */
function extractSpotifyId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

/**
 * Clean and normalize genre strings
 */
function normalizeGenre(genre: string): string {
  return genre.toLowerCase().trim()
}

/**
 * Import playlists from an Excel file exported by playlist-farm
 */
async function importPlaylistsFromExcel(filePath: string) {
  console.log(`📖 Reading Excel file: ${filePath}`)

  // Read the Excel file
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet)

  console.log(`📊 Found ${data.length} playlists in the file`)

  let imported = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const row of data as any[]) {
    try {
      // Extract Spotify ID from URL
      const spotifyId = extractSpotifyId(row['Playlist URL'] || '')

      if (!spotifyId) {
        console.warn(`⚠️  Skipping playlist "${row['Playlist Name']}" - invalid URL`)
        skipped++
        continue
      }

      // Extract moods from description and name
      const combinedText = `${row['Playlist Name'] || ''} ${row['Description'] || ''}`
      const moods = extractMoods(combinedText)

      // Normalize genre
      const genreSearched = row['Genre Searched'] ? normalizeGenre(row['Genre Searched']) : null
      const genres = genreSearched ? [genreSearched] : []

      // Prepare playlist data
      const playlistData = {
        spotifyId,
        name: row['Playlist Name'] || 'Untitled Playlist',
        description: row['Description'] || null,
        imageUrl: null, // playlist-farm doesn't export image URLs
        curatorName: row['Curator Name'] || 'Unknown Curator',
        curatorEmail: row['Email'] || null,
        curatorInstagram: row['Instagram'] || null,
        curatorWebsite: row['Twitter'] || null, // Store Twitter in website field for now
        followers: parseInt(row['Followers'] || '0', 10),
        genres,
        moods,
        isActive: true,
        acceptsSubmissions: !!row['Email'], // If they have an email, assume they accept submissions
        submissionNotes: null,
      }

      // Check if playlist already exists
      const existing = await prisma.curatedPlaylist.findUnique({
        where: { spotifyId },
      })

      if (existing) {
        // Update existing playlist
        await prisma.curatedPlaylist.update({
          where: { spotifyId },
          data: {
            ...playlistData,
            updatedAt: new Date(),
          },
        })
        console.log(`✅ Updated: ${playlistData.name}`)
        updated++
      } else {
        // Create new playlist
        await prisma.curatedPlaylist.create({
          data: playlistData,
        })
        console.log(`✨ Imported: ${playlistData.name}`)
        imported++
      }
    } catch (error) {
      console.error(`❌ Error processing playlist:`, error)
      errors++
    }
  }

  console.log('\n📊 Import Summary:')
  console.log(`   ✨ New playlists imported: ${imported}`)
  console.log(`   ✅ Existing playlists updated: ${updated}`)
  console.log(`   ⚠️  Playlists skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   📈 Total processed: ${data.length}`)
}

/**
 * Import all Excel files from a directory
 */
async function importFromDirectory(dirPath: string) {
  const files = fs.readdirSync(dirPath)
  const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))

  console.log(`🔍 Found ${excelFiles.length} Excel file(s) in ${dirPath}\n`)

  for (const file of excelFiles) {
    const filePath = path.join(dirPath, file)
    console.log(`\n📁 Processing: ${file}`)
    console.log('─'.repeat(50))
    await importPlaylistsFromExcel(filePath)
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage:')
    console.log('  npm run import-playlists <file-or-directory>')
    console.log('')
    console.log('Examples:')
    console.log('  npm run import-playlists ../playlist-farm/spotify_playlists_database.xlsx')
    console.log('  npm run import-playlists ../playlist-farm/')
    process.exit(1)
  }

  const inputPath = args[0]

  // Check if path exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Path does not exist: ${inputPath}`)
    process.exit(1)
  }

  const stats = fs.statSync(inputPath)

  if (stats.isDirectory()) {
    await importFromDirectory(inputPath)
  } else if (stats.isFile()) {
    await importPlaylistsFromExcel(inputPath)
  } else {
    console.error('❌ Error: Invalid path (not a file or directory)')
    process.exit(1)
  }

  await prisma.$disconnect()
  console.log('\n✅ Import complete!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  prisma.$disconnect()
  process.exit(1)
})
