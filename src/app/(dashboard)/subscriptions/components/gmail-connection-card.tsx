// app/(dashboard)/subscriptions/components/gmail-connection-card.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconBrandGmail, IconPlus } from "@tabler/icons-react"

interface GmailConnectionCardProps {
  onConnected?: () => void
}

export function GmailConnectionCard({ onConnected }: GmailConnectionCardProps) {
  return (
    <div className="px-4 lg:px-6">
      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <IconBrandGmail className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Connect Gmail to Get Started</CardTitle>
          <CardDescription className="text-base max-w-2xl mx-auto">
            We&apos;ll scan your emails for subscription receipts and automatically detect 
            services you&apos;re paying for. Your emails are never stored.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-1">🔍 Auto-Detection</div>
              <p className="text-muted-foreground text-xs">
                Find subscriptions you forgot about
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-1">💰 Save Money</div>
              <p className="text-muted-foreground text-xs">
                Identify unused services
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-1">🔒 Secure</div>
              <p className="text-muted-foreground text-xs">
                Read-only access, emails never stored
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center flex-wrap">
            {/* Gmail Connect Button - Just a link! */}
            <Button size="lg" className="gap-2" asChild>
              <a href="/api/integrations/gmail/auth">
                <IconBrandGmail className="w-5 h-5" />
                Connect Gmail
              </a>
            </Button>

            {/* Manual Entry Button */}
            <Button size="lg" variant="outline" className="gap-2" onClick={() => {
              // This will trigger the AddSubscriptionDialog from parent
              // You can emit an event or pass a callback
            }}>
              <IconPlus className="w-5 h-5" />
              Add Manually Instead
            </Button>
          </div>

          {/* Privacy Notice */}
          <p className="text-center text-xs text-muted-foreground">
            🔒 We only read subscription receipts. Your emails are never stored.
            <br />
            You can disconnect anytime from Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}