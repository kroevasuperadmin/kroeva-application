import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { AddSubscriptionForm } from '@/components/add-subscription-form';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  const user = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Calculate total monthly spend
  const monthlySpend = user?.subscriptions
    .filter(sub => sub.billingCycle === 'monthly')
    .reduce((sum, sub) => sum + sub.amount, 0) || 0;

  const annualSpend = user?.subscriptions
    .filter(sub => sub.billingCycle === 'annual')
    .reduce((sum, sub) => sum + (sub.amount / 12), 0) || 0;

  const totalMonthly = monthlySpend + annualSpend;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {user?.firstName}!
        </h1>
        <AddSubscriptionForm />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Subscriptions
          </p>
          <p className="text-3xl font-bold mt-2">
            {user?.subscriptions.length || 0}
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Monthly Spend
          </p>
          <p className="text-3xl font-bold mt-2">
            ${totalMonthly.toFixed(2)}
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Annual Spend
          </p>
          <p className="text-3xl font-bold mt-2">
            ${(totalMonthly * 12).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="border rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Subscriptions</h2>
          
          {user?.subscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No subscriptions yet</p>
              <p className="text-sm">
                Add your first subscription or connect your email to auto-detect them
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {user?.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{sub.serviceName}</h3>
                    {sub.planName && (
                      <p className="text-sm text-muted-foreground">{sub.planName}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Added: {new Date(sub.createdAt).toLocaleDateString()}</span>
                      {sub.nextBillingDate && (
                        <span>Next billing: {new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {sub.currency} {sub.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {sub.billingCycle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}