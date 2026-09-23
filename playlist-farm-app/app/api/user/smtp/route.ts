import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpFromEmail, smtpFromName } = body

    // Update user's SMTP settings
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword, // Note: In production, encrypt this!
        smtpFromEmail,
        smtpFromName,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving SMTP settings:", error)
    return NextResponse.json(
      { error: "Failed to save SMTP settings" },
      { status: 500 }
    )
  }
}
