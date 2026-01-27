// app/api/integrations/gmail/auth/route.ts

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOAuth2Client, GMAIL_SCOPES } from '@/lib/google-oauth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's workspaceId
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { workspaceId: true },
  });

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    state: user.workspaceId, // Pass workspaceId instead of clerkId
    prompt: 'consent',
  });

  redirect(authUrl);
}