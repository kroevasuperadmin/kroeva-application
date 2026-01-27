// components/subscriptions/subscription-stats.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';

interface SubscriptionStatsProps {
  stats: {
    totalMonthlySpend: number;
    totalYearlySpend: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    unconfirmedCount: number;
    byCategory: { category: string; count: number; spend: number }[];
  } | null;
  isLoading?: boolean;
}

export function SubscriptionStats({ stats, isLoading }: SubscriptionStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
              <Skeleton className="mt-1 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: 'Monthly Spend',
      value: `RM ${stats.totalMonthlySpend.toLocaleString('en-MY', {
        minimumFractionDigits: 2,
      })}`,
      description: `RM ${stats.totalYearlySpend.toLocaleString('en-MY')} per year`,
      icon: DollarSign,
      iconColor: 'text-green-600',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toString(),
      description: `${stats.totalSubscriptions} total tracked`,
      icon: CreditCard,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Needs Review',
      value: stats.unconfirmedCount.toString(),
      description: 'Unconfirmed detections',
      icon: AlertCircle,
      iconColor: stats.unconfirmedCount > 0 ? 'text-amber-600' : 'text-muted-foreground',
    },
    {
      title: 'Top Category',
      value: stats.byCategory[0]?.category || 'N/A',
      description: stats.byCategory[0]
        ? `RM ${stats.byCategory[0].spend.toFixed(2)}/month`
        : 'No subscriptions',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}