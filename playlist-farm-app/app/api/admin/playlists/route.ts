import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { isAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const playlists = await prisma.curatedPlaylist.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json(playlists)
  } catch (error) {
    console.error("Error fetching playlists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
