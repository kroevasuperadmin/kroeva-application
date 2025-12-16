import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const data = await request.json();

  try {
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        serviceName: data.serviceName,
        planName: data.planName || null,
        amount: data.amount,
        currency: data.currency || 'USD',
        billingCycle: data.billingCycle,
        nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : null,
        status: 'active',
        detectedFrom: 'manual',
      },
    });

    return Response.json({ success: true, subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return Response.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}