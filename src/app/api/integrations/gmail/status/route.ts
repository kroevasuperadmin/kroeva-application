import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's workspace
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { workspaceId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if Gmail integration exists
    const gmailIntegration = await prisma.integration.findFirst({
      where: {
        workspaceId: user.workspaceId,
        type: "GMAIL",
        status: "CONNECTED"
      },
    })

    return NextResponse.json({
      connected: !!gmailIntegration,
      integration: gmailIntegration ? {
        id: gmailIntegration.id,
        lastSyncAt: gmailIntegration.lastSyncAt,
        status: gmailIntegration.status,
      } : null
    })

  } catch (error) {
    console.error("Error checking Gmail status:", error)
    return NextResponse.json(
      { error: "Failed to check Gmail status" },
      { status: 500 }
    )
  }
}