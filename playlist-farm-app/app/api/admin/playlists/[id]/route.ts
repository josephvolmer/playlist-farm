import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { isAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = await params

    // Update the playlist
    const updated = await prisma.curatedPlaylist.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        curatorName: body.curatorName,
        curatorEmail: body.curatorEmail || null,
        curatorInstagram: body.curatorInstagram || null,
        curatorWebsite: body.curatorWebsite || null,
        imageUrl: body.imageUrl || null,
        followers: body.followers,
        genres: body.genres,
        moods: body.moods,
        isActive: body.isActive,
        acceptsSubmissions: body.acceptsSubmissions,
        submissionNotes: body.submissionNotes || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating playlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
