'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AddSubscriptionForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      serviceName: formData.get('serviceName'),
      planName: formData.get('planName'),
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency'),
      billingCycle: formData.get('billingCycle'),
      nextBillingDate: formData.get('nextBillingDate'),
    };

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        window.location.reload(); // Refresh to show new subscription
      } else {
        alert('Failed to add subscription');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Subscription</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>
            Manually add a subscription you want to track.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              name="serviceName"
              placeholder="e.g., Slack, Zoom, Netflix"
              required
            />
          </div>

          <div>
            <Label htmlFor="planName">Plan Name</Label>
            <Input
              id="planName"
              name="planName"
              placeholder="e.g., Pro, Business"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="49.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="MYR">MYR</SelectItem>
                  <SelectItem value="SGD">SGD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="billingCycle">Billing Cycle *</Label>
            <Select name="billingCycle" defaultValue="monthly" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nextBillingDate">Next Billing Date</Label>
            <Input
              id="nextBillingDate"
              name="nextBillingDate"
              type="date"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Subscription'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}