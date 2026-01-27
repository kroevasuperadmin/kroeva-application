// lib/actions/subscriptions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { BillingCycle, SubscriptionStatus } from '@prisma/client';

// ============================================
// HELPER: Get current workspace
// ============================================

async function getCurrentWorkspace() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { workspaceId: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.workspaceId;
}

// ============================================
// ACTIONS
// ============================================

/**
 * Create a new subscription (manual entry)
 */
export async function createSubscription(data: {
  displayName: string;
  amount: number;
  currency?: string;
  billingCycle?: BillingCycle;
  category?: string;
}) {
  try {
    const workspaceId = await getCurrentWorkspace();

    const subscription = await prisma.subscription.create({
      data: {
        workspaceId,
        displayName: data.displayName,
        amount: data.amount,
        currency: data.currency || 'MYR',
        billingCycle: data.billingCycle || 'MONTHLY',
        category: data.category || null,
        status: 'ACTIVE',
        detectedVia: 'MANUAL',
        lastDetectedAt: new Date(),
        isConfirmed: true,
      },
    });

    revalidatePath('/subscriptions');
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Create subscription error:', error);
    return { success: false, error: 'Failed to create subscription' };
  }
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  id: string,
  data: {
    displayName?: string;
    amount?: number;
    currency?: string;
    billingCycle?: BillingCycle;
    category?: string | null;
    status?: SubscriptionStatus;
    isConfirmed?: boolean;
  }
) {
  try {
    const workspaceId = await getCurrentWorkspace();

    // Verify ownership
    const existing = await prisma.subscription.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      return { success: false, error: 'Subscription not found' };
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data,
    });

    revalidatePath('/subscriptions');
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Update subscription error:', error);
    return { success: false, error: 'Failed to update subscription' };
  }
}

/**
 * Confirm a detected subscription
 */
export async function confirmSubscription(id: string) {
  return updateSubscription(id, {
    isConfirmed: true,
    status: 'ACTIVE',
  });
}

/**
 * Cancel a subscription (soft delete)
 */
export async function cancelSubscription(id: string) {
  return updateSubscription(id, {
    status: 'CANCELLED',
  });
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: string) {
  try {
    const workspaceId = await getCurrentWorkspace();

    const existing = await prisma.subscription.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      return { success: false, error: 'Subscription not found' };
    }

    await prisma.subscription.delete({
      where: { id },
    });

    revalidatePath('/subscriptions');
    return { success: true };
  } catch (error) {
    console.error('Delete subscription error:', error);
    return { success: false, error: 'Failed to delete subscription' };
  }
}

/**
 * Bulk confirm subscriptions
 */
export async function bulkConfirmSubscriptions(ids: string[]) {
  try {
    const workspaceId = await getCurrentWorkspace();

    const result = await prisma.subscription.updateMany({
      where: {
        id: { in: ids },
        workspaceId,
      },
      data: {
        isConfirmed: true,
        status: 'ACTIVE',
      },
    });

    revalidatePath('/subscriptions');
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Bulk confirm error:', error);
    return { success: false, error: 'Failed to confirm subscriptions' };
  }
}

/**
 * Bulk delete subscriptions
 */
export async function bulkDeleteSubscriptions(ids: string[]) {
  try {
    const workspaceId = await getCurrentWorkspace();

    const result = await prisma.subscription.deleteMany({
      where: {
        id: { in: ids },
        workspaceId,
      },
    });

    revalidatePath('/subscriptions');
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Bulk delete error:', error);
    return { success: false, error: 'Failed to delete subscriptions' };
  }
}