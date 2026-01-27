import { prisma } from '@/lib/prisma';
import { BillingCycle, SubscriptionStatus, DetectionMethod, Prisma } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  category?: string;
  billingCycle?: BillingCycle;
  detectedVia?: DetectionMethod;
  isConfirmed?: boolean;
  search?: string;
}

export interface SubscriptionStats {
  totalMonthlySpend: number;
  totalYearlySpend: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  unconfirmedCount: number;
  byCategory: { category: string; count: number; spend: number }[];
}

// ============================================
// QUERIES
// ============================================

/**
 * Get all subscriptions for a workspace with optional filters
 */
export async function getSubscriptions(
  workspaceId: string,
  filters?: SubscriptionFilters
) {
  const where: Prisma.SubscriptionWhereInput = {
    workspaceId,
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.billingCycle) {
    where.billingCycle = filters.billingCycle;
  }

  if (filters?.detectedVia) {
    where.detectedVia = filters.detectedVia;
  }

  if (filters?.isConfirmed !== undefined) {
    where.isConfirmed = filters.isConfirmed;
  }

  if (filters?.search) {
    where.displayName = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  return prisma.subscription.findMany({
    where,
    include: {
      saasApplication: true,
    },
    orderBy: [
      { status: 'asc' },
      { lastDetectedAt: 'desc' },
    ],
  });
}

/**
 * Get a single subscription by ID
 */
export async function getSubscriptionById(id: string, workspaceId: string) {
  return prisma.subscription.findFirst({
    where: {
      id,
      workspaceId,
    },
    include: {
      saasApplication: true,
    },
  });
}

/**
 * Get subscription statistics for a workspace
 */
export async function getSubscriptionStats(
  workspaceId: string
): Promise<SubscriptionStats> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      workspaceId,
      status: 'ACTIVE',
    },
    select: {
      amount: true,
      billingCycle: true,
      category: true,
      isConfirmed: true,
    },
  });

  let totalMonthlySpend = 0;
  const categoryMap = new Map<string, { count: number; spend: number }>();

  for (const sub of subscriptions) {
    const amount = Number(sub.amount);
    const monthlyAmount = sub.billingCycle === 'YEARLY' ? amount / 12 : amount;

    totalMonthlySpend += monthlyAmount;

    const category = sub.category || 'Uncategorized';
    const existing = categoryMap.get(category) || { count: 0, spend: 0 };
    categoryMap.set(category, {
      count: existing.count + 1,
      spend: existing.spend + monthlyAmount,
    });
  }

  const totalSubscriptions = await prisma.subscription.count({
    where: { workspaceId },
  });

  const unconfirmedCount = await prisma.subscription.count({
    where: { workspaceId, isConfirmed: false },
  });

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      spend: Math.round(data.spend * 100) / 100,
    }))
    .sort((a, b) => b.spend - a.spend);

  return {
    totalMonthlySpend: Math.round(totalMonthlySpend * 100) / 100,
    totalYearlySpend: Math.round(totalMonthlySpend * 12 * 100) / 100,
    totalSubscriptions,
    activeSubscriptions: subscriptions.length,
    unconfirmedCount,
    byCategory,
  };
}