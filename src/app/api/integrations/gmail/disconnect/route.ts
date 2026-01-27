// app/api/integrations/gmail/disconnect/route.ts

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const { userId } = await auth();
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { workspaceId: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.integration.delete({
      where: {
        workspaceId_type: {
          workspaceId: user.workspaceId,
          type: 'GMAIL',
        },
      },
    });

    return Response.json({ success: true, message: 'Gmail disconnected' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return Response.json({ success: true, message: 'Already disconnected' });
    }
    
    return Response.json({ 
      error: 'Failed to disconnect',
      details: error.message 
    }, { status: 500 });
  }
}