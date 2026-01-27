// app/api/subscriptions/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getSubscriptionStats } from '@/lib/queries/subscription';

// GET /api/subscriptions/stats
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { workspaceId: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stats = await getSubscriptionStats(user.workspaceId);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('GET /api/subscriptions/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}