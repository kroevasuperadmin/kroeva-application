"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconTrash, IconEdit, IconAlertCircle } from "@tabler/icons-react"

interface SubscriptionCardProps {
  subscription: {
    id: string
    displayName: string
    amount: number
    currency: string
    billingCycle: string
    category: string | null
    isUnused: boolean
    detectedVia: string
  }
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      ENTERTAINMENT: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      PRODUCTIVITY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      DEVELOPMENT: "bg-green-500/10 text-green-500 border-green-500/20",
      CLOUD: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      COMMUNICATION: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    }
    return category ? colors[category] || "bg-gray-500/10 text-gray-500" : "bg-gray-500/10 text-gray-500"
  }

  const getBillingCycleDisplay = (cycle: string) => {
    return cycle === "MONTHLY" ? "/mo" : cycle === "YEARLY" ? "/yr" : ""
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{subscription.displayName}</h3>
            {subscription.isUnused && (
              <Badge variant="destructive" className="text-xs">
                <IconAlertCircle className="w-3 h-3 mr-1" />
                Unused
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold">
              {subscription.currency} {parseFloat(subscription.amount.toString()).toFixed(2)}
            </span>
            <span className="text-muted-foreground text-sm">
              {getBillingCycleDisplay(subscription.billingCycle)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {subscription.category && (
              <Badge variant="outline" className={getCategoryColor(subscription.category)}>
                {subscription.category}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {subscription.detectedVia === "GMAIL" ? "📧 Auto-detected" : "✏️ Manual"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <IconEdit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <IconTrash className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  )
}