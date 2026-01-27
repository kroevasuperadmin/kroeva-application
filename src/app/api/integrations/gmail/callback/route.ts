// app/api/integrations/gmail/callback/route.ts

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOAuth2Client } from '@/lib/google-oauth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    redirect('/subscriptions?error=gmail_permission_denied');
  }

  if (!code || !state) {
    redirect('/subscriptions?error=invalid_callback');
  }

  const workspaceId = state;
  const oauth2Client = getOAuth2Client();

  // Verify workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    redirect('/subscriptions?error=workspace_not_found');
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      redirect('/subscriptions?error=no_access_token');
    }

    // Save integration
    await prisma.integration.upsert({
      where: {
        workspaceId_type: {
          workspaceId: workspaceId,
          type: 'GMAIL',
        },
      },
      create: {
        workspaceId: workspaceId,
        type: 'GMAIL',
        status: 'CONNECTED',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        accessTokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
      update: {
        status: 'CONNECTED',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        accessTokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
    });
  } catch (err: any) {
    console.error('Gmail OAuth error:', err);
    redirect('/subscriptions?error=token_exchange_failed');
  }

  redirect('/subscriptions?gmail=connected');
}