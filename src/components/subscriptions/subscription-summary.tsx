import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconTrendingUp, IconCalendar, IconListCheck } from "@tabler/icons-react"

interface SubscriptionSummaryProps {
  monthlyTotal: string
  yearlyTotal: string
  count: number
}

export function SubscriptionSummary({ monthlyTotal, yearlyTotal, count }: SubscriptionSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">RM {monthlyTotal}</div>
          <p className="text-xs text-muted-foreground">per month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yearly Spend</CardTitle>
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">RM {yearlyTotal}</div>
          <p className="text-xs text-muted-foreground">per year</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <IconListCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count}</div>
          <p className="text-xs text-muted-foreground">subscriptions</p>
        </CardContent>
      </Card>
    </div>
  )
}