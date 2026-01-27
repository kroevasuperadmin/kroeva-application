import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getSubscriptions, SubscriptionFilters } from '@/lib/queries/subscription';
import { BillingCycle, SubscriptionStatus, DetectionMethod } from '@prisma/client';

// GET /api/subscriptions
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const filters: SubscriptionFilters = {};

    const status = searchParams.get('status');
    if (status && ['ACTIVE', 'CANCELLED', 'UNKNOWN', 'PENDING'].includes(status)) {
      filters.status = status as SubscriptionStatus;
    }

    const category = searchParams.get('category');
    if (category) {
      filters.category = category;
    }

    const billingCycle = searchParams.get('billingCycle');
    if (billingCycle && ['MONTHLY', 'YEARLY', 'ONE_TIME'].includes(billingCycle)) {
      filters.billingCycle = billingCycle as BillingCycle;
    }

    const detectedVia = searchParams.get('detectedVia');
    if (detectedVia && ['GMAIL', 'MANUAL'].includes(detectedVia)) {
      filters.detectedVia = detectedVia as DetectionMethod;
    }

    const isConfirmed = searchParams.get('isConfirmed');
    if (isConfirmed !== null) {
      filters.isConfirmed = isConfirmed === 'true';
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    const subscriptions = await getSubscriptions(user.workspaceId, filters);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('GET /api/subscriptions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/subscriptions
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    if (!body.displayName || !body.amount) {
      return NextResponse.json(
        { error: 'displayName and amount are required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        workspaceId: user.workspaceId,
        displayName: body.displayName,
        amount: body.amount,
        currency: body.currency || 'MYR',
        billingCycle: body.billingCycle || 'MONTHLY',
        category: body.category || null,
        status: 'ACTIVE',
        detectedVia: 'MANUAL',
        lastDetectedAt: new Date(),
        isConfirmed: true,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('POST /api/subscriptions error:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A subscription with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}