#!/usr/bin/env tsx
/**
 * Playlist Sync Worker
 *
 * This worker runs the playlist-farm CLI tool to scrape Spotify for playlists
 * and save them directly to the PostgreSQL database.
 */

import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function syncPlaylists() {
  const startTime = Date.now()

  console.log(`[${new Date().toISOString()}] Starting playlist sync...`)

  try {
    // Run the playlist-farm CLI tool in non-interactive mode
    console.log("Running playlist-farm CLI tool to scrape Spotify...")

    const { stdout, stderr } = await execAsync("playlist-farm --auto --quick", {
      cwd: "/playlist-farm-tool",
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    })

    if (stdout) {
      console.log(stdout)
    }
    if (stderr) {
      console.error(stderr)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n[${new Date().toISOString()}] Sync completed in ${duration}s`)

    process.exit(0)
  } catch (error) {
    console.error(`\n[${new Date().toISOString()}] Sync failed:`, error)
    if (error instanceof Error && 'stdout' in error) {
      console.error("stdout:", (error as any).stdout)
      console.error("stderr:", (error as any).stderr)
    }
    process.exit(1)
  }
}

// Run the sync
syncPlaylists()
