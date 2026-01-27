// components/subscriptions/subscription-columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Mail,
  User,
} from 'lucide-react';

// Type matching your Prisma schema
export interface Subscription {
  id: string;
  displayName: string;
  amount: string | number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
  category: string | null;
  status: 'ACTIVE' | 'CANCELLED' | 'UNKNOWN' | 'PENDING';
  detectedVia: 'GMAIL' | 'MANUAL';
  lastDetectedAt: string | Date;
  confidence: number | null;
  sourceEmail: string | null;
  isConfirmed: boolean;
  saasApplication?: {
    logoUrl: string | null;
  } | null;
}

interface ColumnActions {
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  onConfirm: (subscription: Subscription) => void;
  onCancel: (subscription: Subscription) => void;
}

export function createColumns(actions: ColumnActions): ColumnDef<Subscription>[] {
  return [
    // Checkbox
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Service name
    {
      accessorKey: 'displayName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Service
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue('displayName') as string;
        const logo = row.original.saasApplication?.logoUrl;
        const isConfirmed = row.original.isConfirmed;

        return (
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={name}
                className="h-8 w-8 rounded object-contain"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-medium">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{name}</div>
              {!isConfirmed && (
                <span className="text-xs text-amber-600">Needs confirmation</span>
              )}
            </div>
          </div>
        );
      },
    },

    // Amount
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount') as string);
        const currency = row.original.currency;
        const billingCycle = row.original.billingCycle;

        const formatted = new Intl.NumberFormat('en-MY', {
          style: 'currency',
          currency: currency,
        }).format(amount);

        const cycleLabel =
          billingCycle === 'YEARLY'
            ? '/year'
            : billingCycle === 'MONTHLY'
            ? '/month'
            : '';

        return (
          <div className="font-medium">
            {formatted}
            <span className="text-muted-foreground">{cycleLabel}</span>
          </div>
        );
      },
    },

    // Category
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as string | null;
        return category || <span className="text-muted-foreground">—</span>;
      },
    },

    // Status
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;

        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          ACTIVE: 'default',
          PENDING: 'secondary',
          CANCELLED: 'destructive',
          UNKNOWN: 'outline',
        };

        return (
          <Badge variant={variants[status] || 'outline'} className="capitalize">
            {status.toLowerCase()}
          </Badge>
        );
      },
    },

    // Source
    {
      accessorKey: 'detectedVia',
      header: 'Source',
      cell: ({ row }) => {
        const source = row.getValue('detectedVia') as string;
        const confidence = row.original.confidence;

        return (
          <div className="flex items-center gap-1">
            {source === 'GMAIL' ? (
              <Mail className="h-4 w-4 text-red-500" />
            ) : (
              <User className="h-4 w-4 text-blue-500" />
            )}
            <span className="text-sm">
              {source === 'GMAIL' ? 'Gmail' : 'Manual'}
            </span>
            {confidence && (
              <span className="text-xs text-muted-foreground">
                ({confidence}%)
              </span>
            )}
          </div>
        );
      },
    },

    // Actions
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const subscription = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {!subscription.isConfirmed && (
                <DropdownMenuItem onClick={() => actions.onConfirm(subscription)}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Confirm
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => actions.onEdit(subscription)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              {subscription.status === 'ACTIVE' && (
                <DropdownMenuItem onClick={() => actions.onCancel(subscription)}>
                  <XCircle className="mr-2 h-4 w-4 text-amber-600" />
                  Mark Cancelled
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => actions.onDelete(subscription)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}