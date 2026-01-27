// app/api/subscriptions/scan/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { scanGmailForSubscriptions } from '@/lib/services/gmail-scanner';

export async function POST() {
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

    // Check if Gmail is connected
    const integration = await prisma.integration.findUnique({
      where: {
        workspaceId_type: {
          workspaceId: user.workspaceId,
          type: 'GMAIL',
        },
      },
    });

    if (!integration || integration.status !== 'CONNECTED') {
      return NextResponse.json(
        { error: 'Gmail not connected. Please connect Gmail first.' },
        { status: 400 }
      );
    }

    // Run the scan
    const result = await scanGmailForSubscriptions(user.workspaceId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: error.message || 'Scan failed' },
      { status: 500 }
    );
  }
}