import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scanGmailForSubscriptions } from '@/lib/services/gmail-scanner';

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Allow if no secret configured (development)
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - allowing request');
    return true;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron/sync - Called by Vercel Cron
export async function GET(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting subscription sync...');

    // Find workspaces with connected Gmail that need sync
    const integrations = await prisma.integration.findMany({
      where: {
        type: 'GMAIL',
        status: 'CONNECTED',
        OR: [
          { nextSyncAt: null },
          { nextSyncAt: { lte: new Date() } },
        ],
      },
      select: {
        workspaceId: true,
        lastSyncAt: true,
      },
    });

    console.log(`[Cron] Found ${integrations.length} workspaces to sync`);

    const results: Array<{
      workspaceId: string;
      success: boolean;
      scanned?: number;
      detected?: number;
      saved?: number;
      error?: string;
    }> = [];

    for (const integration of integrations) {
      try {
        console.log(`[Cron] Syncing workspace: ${integration.workspaceId}`);

        const result = await scanGmailForSubscriptions(integration.workspaceId);

        results.push({
          workspaceId: integration.workspaceId,
          success: true,
          ...result,
        });

        console.log(
          `[Cron] Workspace ${integration.workspaceId}: ` +
          `scanned=${result.scanned}, detected=${result.detected}, saved=${result.saved}`
        );
      } catch (error) {
        console.error(`[Cron] Error syncing workspace ${integration.workspaceId}:`, error);

        results.push({
          workspaceId: integration.workspaceId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Update integration status to ERROR
        await prisma.integration.updateMany({
          where: { workspaceId: integration.workspaceId, type: 'GMAIL' },
          data: { status: 'ERROR' },
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(`[Cron] Sync complete: ${successCount} success, ${failCount} failed`);

    return NextResponse.json({
      message: 'Sync complete',
      processed: integrations.length,
      success: successCount,
      failed: failCount,
      results,
    });
  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}