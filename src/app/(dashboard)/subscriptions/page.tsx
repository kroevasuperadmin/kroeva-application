'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SubscriptionStats } from '@/components/subscriptions/subscription-stats';
import { SubscriptionTable } from '@/components/subscriptions/subscription-table';
import {
  SubscriptionFilters,
  FilterValues,
  defaultFilters,
} from '@/components/subscriptions/subscription-filters';
import { EditSubscriptionDialog } from '@/components/subscriptions/edit-subscription-dialog';
import { AddSubscriptionDialog } from '@/components/subscriptions/add-subscription-dialog';
import { Subscription } from '@/components/subscriptions/subscription-columns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GmailConnectionCard } from './components/gmail-connection-card';

interface Stats {
  totalMonthlySpend: number;
  totalYearlySpend: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  unconfirmedCount: number;
  byCategory: { category: string; count: number; spend: number }[];
}

export default function SubscriptionsPage() {
  // Data state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [hasGmailConnected, setHasGmailConnected] = useState<boolean | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);

  // Dialog state
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deleteSubscription, setDeleteSubscription] = useState<Subscription | null>(null);

  // Check Gmail connection
  const checkGmailConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/gmail/status');
      if (!res.ok) throw new Error('Failed to check Gmail status');
      
      const data = await res.json();
      setHasGmailConnected(data.connected);
    } catch (error) {
      console.error('Gmail status check error:', error);
      setHasGmailConnected(false);
    }
  }, []);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.billingCycle !== 'all') params.set('billingCycle', filters.billingCycle);
      if (filters.detectedVia !== 'all') params.set('detectedVia', filters.detectedVia);

      const res = await fetch(`/api/subscriptions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setSubscriptions(data.subscriptions);

      const cats = [...new Set(
        data.subscriptions
          .map((s: Subscription) => s.category)
          .filter(Boolean)
      )] as string[];
      setCategories(cats.sort());
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load subscriptions');
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/subscriptions/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');

      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Stats error:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        checkGmailConnection(),
        fetchSubscriptions(), 
        fetchStats()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [checkGmailConnection, fetchSubscriptions, fetchStats]);

  // Sync Gmail
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/subscriptions/scan', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Sync failed');
      }

      const data = await res.json();
      toast.success(`Sync complete! Found ${data.detected} subscriptions`);

      await Promise.all([fetchSubscriptions(), fetchStats()]);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Add subscription
  const handleAdd = async (data: {
    displayName: string;
    amount: number;
    currency: string;
    billingCycle: string;
    category: string | null;
  }) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add');
      }

      toast.success('Subscription added');
      await Promise.all([fetchSubscriptions(), fetchStats()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add');
      throw error;
    }
  };

  // Edit subscription
  const handleEdit = async (id: string, data: Partial<Subscription>) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Subscription updated');
      await Promise.all([fetchSubscriptions(), fetchStats()]);
    } catch (error) {
      toast.error('Failed to update subscription');
      throw error;
    }
  };

  // Confirm subscription
  const handleConfirm = async (subscription: Subscription) => {
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isConfirmed: true, status: 'ACTIVE' }),
      });

      if (!res.ok) throw new Error('Failed to confirm');

      toast.success(`${subscription.displayName} confirmed`);
      await Promise.all([fetchSubscriptions(), fetchStats()]);
    } catch (error) {
      toast.error('Failed to confirm subscription');
    }
  };

  // Cancel subscription
  const handleCancel = async (subscription: Subscription) => {
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!res.ok) throw new Error('Failed to cancel');

      toast.success(`${subscription.displayName} marked as cancelled`);
      await Promise.all([fetchSubscriptions(), fetchStats()]);
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  // Delete subscription
  const handleDelete = async () => {
    if (!deleteSubscription) return;

    try {
      const res = await fetch(`/api/subscriptions/${deleteSubscription.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Subscription deleted');
      setDeleteSubscription(null);
      await Promise.all([fetchSubscriptions(), fetchStats()]);
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  // Bulk confirm
  const handleBulkConfirm = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/subscriptions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isConfirmed: true, status: 'ACTIVE' }),
          })
        )
      );

      toast.success(`${ids.length} subscriptions confirmed`);
      await Promise.all([fetchSubscriptions(), fetchStats()]);
    } catch (error) {
      toast.error('Failed to confirm subscriptions');
    }
  };

  // Bulk delete
  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/subscriptions/${id}`, { method: 'DELETE' }))
      );

      toast.success(`${ids.length} subscriptions deleted`);
      await Promise.all([fetchSubscriptions(), fetchStats()]);
    } catch (error) {
      toast.error('Failed to delete subscriptions');
    }
  };

  // If Gmail not connected, show connection card
  if (hasGmailConnected === false) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Track and manage your SaaS subscriptions
            </p>
          </div>
          <AddSubscriptionDialog onAdd={handleAdd} />
        </div>

        <GmailConnectionCard onConnected={checkGmailConnection} />
      </div>
    );
  }

  // If Gmail connected, show normal page
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Track and manage your SaaS subscriptions
          </p>
        </div>
        <AddSubscriptionDialog onAdd={handleAdd} />
      </div>

      {/* Stats */}
      <SubscriptionStats stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <SubscriptionFilters
        categories={categories}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Table */}
      <SubscriptionTable
        data={subscriptions}
        isLoading={isLoading}
        onEdit={setEditingSubscription}
        onDelete={setDeleteSubscription}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onBulkConfirm={handleBulkConfirm}
        onBulkDelete={handleBulkDelete}
      />

      {/* Edit Dialog */}
      <EditSubscriptionDialog
        subscription={editingSubscription}
        open={!!editingSubscription}
        onOpenChange={(open) => !open && setEditingSubscription(null)}
        onSave={handleEdit}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteSubscription}
        onOpenChange={(open: any) => !open && setDeleteSubscription(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteSubscription?.displayName}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}