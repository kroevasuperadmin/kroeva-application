"use client"

import { use } from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ExternalLink, Phone, Mail, AlertCircle } from "lucide-react"

const mockApps = [
  { 
    id: 'slack', 
    name: 'Slack', 
    logo: '💬', 
    cost: 725, 
    licenses: 100, 
    unusedLicenses: 25,
    category: 'Communication',
    cancellationMethod: 'online',
    difficulty: 'easy'
  },
  { 
    id: 'github', 
    name: 'GitHub', 
    logo: '🐙', 
    cost: 400, 
    licenses: 100, 
    unusedLicenses: 30,
    category: 'Development',
    cancellationMethod: 'online',
    difficulty: 'easy'
  },
]

// Cancellation guides database
const cancellationGuides: Record<string, any> = {
  slack: {
    method: 'online',
    difficulty: 'Easy',
    estimatedTime: '5 minutes',
    steps: [
      {
        step: 1,
        title: 'Go to Workspace Admin',
        description: 'Navigate to your Slack workspace settings',
        link: 'https://slack.com/admin',
        details: 'Click on your workspace name in the top left, then select "Settings & administration" → "Workspace settings"'
      },
      {
        step: 2,
        title: 'Manage Members',
        description: 'Access the members management section',
        details: 'In the left sidebar, click on "Manage members" to see all active users'
      },
      {
        step: 3,
        title: 'Deactivate Unused Accounts',
        description: 'Remove inactive members',
        details: 'Select the 25 inactive users and click "Deactivate". This will immediately free up those licenses.'
      },
      {
        step: 4,
        title: 'Adjust Billing',
        description: 'Update your subscription plan',
        link: 'https://slack.com/billing',
        details: 'Go to Billing → Change plan → Reduce seats from 100 to 75. Savings will apply on next billing cycle.'
      }
    ],
    tips: [
      'You can export a list of inactive users before deactivating',
      'Deactivated users can be reactivated later if needed',
      'Billing changes take effect at the next renewal date',
      'Keep at least 5% buffer for new hires'
    ],
    support: {
      email: 'feedback@slack.com',
      phone: null,
      chat: 'https://slack.com/help'
    }
  },
  github: {
    method: 'online',
    difficulty: 'Easy',
    estimatedTime: '3 minutes',
    steps: [
      {
        step: 1,
        title: 'Access Organization Settings',
        description: 'Go to your GitHub organization',
        link: 'https://github.com/organizations/YOUR_ORG/settings/billing',
        details: 'Navigate to your organization page and click "Settings" in the top menu'
      },
      {
        step: 2,
        title: 'Go to Billing',
        description: 'Open billing and plans section',
        details: 'In the left sidebar, click "Billing and plans" to see your current subscription'
      },
      {
        step: 3,
        title: 'Remove Unused Seats',
        description: 'Adjust your seat count',
        details: 'Click "Edit" next to your plan, reduce seats from 100 to 70. This removes the 30 unused seats.'
      },
      {
        step: 4,
        title: 'Confirm Changes',
        description: 'Review and save',
        details: 'Review the new pricing, confirm changes. Prorated refund will be applied automatically.'
      }
    ],
    tips: [
      'GitHub provides prorated refunds for unused time',
      'You can add seats back anytime',
      'Outside collaborators don\'t count toward seat limit',
      'Consider GitHub Teams ($4/user) vs Enterprise ($21/user)'
    ],
    support: {
      email: 'support@github.com',
      phone: null,
      chat: 'https://support.github.com'
    }
  }
}

export default function CancelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [step, setStep] = useState<'options' | 'diy' | 'assisted' | 'success'>('options')
  const [selectedOption, setSelectedOption] = useState<'diy' | 'assisted' | null>(null)

  const app = mockApps.find(a => a.id === id)
  const guide = cancellationGuides[id]

  if (!app || !guide) {
    return <div className="p-8">App not found</div>
  }

  const savings = (app.cost / app.licenses) * app.unusedLicenses

  // Step 1: Choose cancellation method
  if (step === 'options') {
    return (
      <div className="px-4 lg:px-6 max-w-4xl mx-auto space-y-6">
        <Link href={`/applications/${id}`}>
          <Button variant="ghost">← Back to {app.name}</Button>
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Cancel {app.name} Subscription</h1>
          <p className="text-xl text-muted-foreground">
            Save ${savings.toFixed(2)}/month by removing {app.unusedLicenses} unused licenses
          </p>
        </div>

        {/* Cancellation Options */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Option 1: DIY Guide */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">DIY Guide</CardTitle>
                <Badge variant="secondary">FREE</Badge>
              </div>
              <CardDescription>Cancel it yourself with our step-by-step guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Free cancellation guide</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Direct links to cancel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Estimated time: {guide.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Difficulty: {guide.difficulty}</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  setSelectedOption('diy')
                  setStep('diy')
                }}
              >
                Show Me How
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: We Do It For You */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">We'll Do It</CardTitle>
                <Badge>$49.99</Badge>
              </div>
              <CardDescription>Our team cancels for you - 100% hassle-free</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">We handle everything</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Done in 24-48 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Email confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Money-back guarantee</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                size="lg" 
                variant="default"
                onClick={() => {
                  setSelectedOption('assisted')
                  setStep('assisted')
                }}
              >
                Cancel For Me
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Comparison */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Why choose assisted cancellation?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Save time - no navigating confusing websites</li>
              <li>✓ Avoid retention tactics and upsell attempts</li>
              <li>✓ Get it done right the first time</li>
              <li>✓ ROI: Pay $49.99 once, save ${savings.toFixed(2)}/month = Break even in {Math.ceil(49.99 / savings)} days</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: DIY Guide
  if (step === 'diy') {
    return (
      <div className="px-4 lg:px-6 max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setStep('options')}>
          ← Back to options
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">How to Cancel {app.name}</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{guide.difficulty} Difficulty</Badge>
            <Badge variant="outline">⏱️ {guide.estimatedTime}</Badge>
            <Badge variant="outline">💰 Save ${savings.toFixed(2)}/month</Badge>
          </div>
        </div>

        {/* Step-by-step guide */}
        <div className="space-y-4">
          {guide.steps.map((s: any, idx: number) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {s.step}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{s.title}</CardTitle>
                      <CardDescription>{s.description}</CardDescription>
                    </div>
                  </div>
                  {s.link && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={s.link} target="_blank" rel="noopener noreferrer">
                        Open <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{s.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pro Tips */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guide.tips.map((tip: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">💡</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Support Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact {app.name} support if you run into issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {guide.support.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${guide.support.email}`} className="text-primary hover:underline">
                  {guide.support.email}
                </a>
              </div>
            )}
            {guide.support.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${guide.support.phone}`} className="text-primary hover:underline">
                  {guide.support.phone}
                </a>
              </div>
            )}
            {guide.support.chat && (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a href={guide.support.chat} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Live Chat Support
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('options')} className="flex-1">
            ← Choose Different Method
          </Button>
          <Button onClick={() => setStep('success')} className="flex-1">
            I've Completed Cancellation
          </Button>
        </div>

        {/* Still need help? */}
        <Card className="bg-muted/50 text-center">
          <CardContent className="pt-6">
            <p className="mb-4">Too complicated? Let us handle it for you.</p>
            <Button onClick={() => setStep('assisted')}>
              Switch to Assisted Cancellation ($49.99)
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 3: Assisted Cancellation
  if (step === 'assisted') {
    return (
      <div className="px-4 lg:px-6 max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setStep('options')}>
          ← Back to options
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">We'll Cancel {app.name} For You</h1>
          <p className="text-muted-foreground">
            Sit back and relax - we'll handle everything
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold">Grant Access</p>
                  <p className="text-sm text-muted-foreground">
                    You'll securely provide us with access to your {app.name} account
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold">We Cancel</p>
                  <p className="text-sm text-muted-foreground">
                    Our team removes the {app.unusedLicenses} unused licenses within 24-48 hours
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold">Get Confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email confirmation with screenshots proving cancellation
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-semibold">Start Saving</p>
                  <p className="text-sm text-muted-foreground">
                    Save ${savings.toFixed(2)}/month starting next billing cycle
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">One-time service fee</span>
                <span className="font-semibold">$49.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly savings</span>
                <span className="font-semibold text-green-600">-${savings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Break even in</span>
                <span className="font-bold">{Math.ceil(49.99 / savings)} days</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">First year savings</span>
                <span className="font-bold text-green-600">
                  ${((savings * 12) - 49.99).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guarantee */}
        <Card className="bg-green-50 dark:bg-green-950 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  100% Money-Back Guarantee
                </p>
                <p className="text-sm text-green-700 dark:text-green-200">
                  If we can't successfully cancel your subscription, you don't pay. No questions asked.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('options')} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => setStep('success')} size="lg" className="flex-1">
            Proceed to Payment ($49.99)
          </Button>
        </div>

        {/* Alternative */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Prefer to do it yourself? <button onClick={() => setStep('diy')} className="text-primary hover:underline">View DIY guide</button></p>
        </div>
      </div>
    )
  }

  // Step 4: Success
  return (
    <div className="px-4 lg:px-6 max-w-3xl mx-auto space-y-6">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">
            {selectedOption === 'diy' ? 'Cancellation Confirmed!' : 'Request Received!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {selectedOption === 'diy' 
              ? 'Great job completing the cancellation yourself!' 
              : 'Our team will cancel your subscription within 24-48 hours'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-5xl font-bold text-green-600 mb-2">
              ${savings.toFixed(2)}
            </p>
            <p className="text-muted-foreground">Saved per month</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application</span>
              <span className="font-semibold">{app.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Licenses Canceled</span>
              <span className="font-semibold">{app.unusedLicenses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Previous Cost</span>
              <span className="font-semibold">${app.cost.toFixed(2)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New Cost</span>
              <span className="font-semibold">${(app.cost - savings).toFixed(2)}/mo</span>
            </div>
          </div>

          {selectedOption === 'assisted' && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <CardContent className="pt-6 space-y-2 text-sm">
                <p className="font-semibold">What's next?</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Check your email for confirmation and next steps</li>
                  <li>• Our team will contact you within 1 hour</li>
                  <li>• Cancellation completed in 24-48 hours</li>
                  <li>• You'll receive proof of cancellation via email</li>
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/applications">View All Apps</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/insights">Go to Dashboard</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Questions? Contact support@kroeva.com
          </p>
        </CardContent>
      </Card>
    </div>
  )
}