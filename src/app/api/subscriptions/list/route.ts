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

    // Get all subscriptions for this workspace
    const subscriptions = await prisma.subscription.findMany({
      where: { 
        workspaceId: user.workspaceId,
        status: "ACTIVE" // Only show active subscriptions
      },
      include: {
        saasApplication: true, // Include app details if linked
      },
      orderBy: {
        amount: 'desc' // Most expensive first
      }
    })

    // Calculate totals
    const monthlyTotal = subscriptions.reduce((sum, sub) => {
      const amount = parseFloat(sub.amount.toString())
      if (sub.billingCycle === "MONTHLY") {
        return sum + amount
      } else if (sub.billingCycle === "YEARLY") {
        return sum + (amount / 12)
      }
      return sum
    }, 0)

    const yearlyTotal = monthlyTotal * 12

    return NextResponse.json({
      subscriptions,
      summary: {
        count: subscriptions.length,
        monthlyTotal: monthlyTotal.toFixed(2),
        yearlyTotal: yearlyTotal.toFixed(2),
      }
    })

  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    )
  }
}