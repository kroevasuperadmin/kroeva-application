// components/subscriptions/subscription-filters.tsx

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, RefreshCw } from 'lucide-react';

export interface FilterValues {
  search: string;
  status: string;
  category: string;
  billingCycle: string;
  detectedVia: string;
}

interface SubscriptionFiltersProps {
  categories: string[];
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onReset: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const defaultFilters: FilterValues = {
  search: '',
  status: 'all',
  category: 'all',
  billingCycle: 'all',
  detectedVia: 'all',
};

export function SubscriptionFilters({
  categories,
  filters,
  onFilterChange,
  onReset,
  onSync,
  isSyncing,
}: SubscriptionFiltersProps) {
  const updateFilter = (key: keyof FilterValues, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.billingCycle !== 'all' ||
    filters.detectedVia !== 'all';

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Search and sync button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {onSync && (
          <Button
            variant="outline"
            onClick={onSync}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Gmail'}
          </Button>
        )}
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter('status', value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="UNKNOWN">Unknown</SelectItem>
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={filters.category}
          onValueChange={(value) => updateFilter('category', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Billing cycle */}
        <Select
          value={filters.billingCycle}
          onValueChange={(value) => updateFilter('billingCycle', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Billing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Billing</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
            <SelectItem value="ONE_TIME">One-time</SelectItem>
          </SelectContent>
        </Select>

        {/* Source */}
        <Select
          value={filters.detectedVia}
          onValueChange={(value) => updateFilter('detectedVia', value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="GMAIL">Gmail</SelectItem>
            <SelectItem value="MANUAL">Manual</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}