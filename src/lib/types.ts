import { Subscription, SaasApplication, Integration } from '@prisma/client'

export type SubscriptionWithApp = Subscription & {
  saasApplication: SaasApplication | null
}

export type UserSubscriptions = {
  active: Subscription[]
  cancelled: Subscription[]
  trial: Subscription[]
}

export type WasteAnalysis = {
  totalMonthlySpend: number
  totalAnnualSpend: number
  unusedSubscriptions: number
  potentialMonthlySavings: number
  potentialAnnualSavings: number
  wastePercentage: number
}

export type IntegrationStatus = {
  gmail: boolean
  plaid: boolean
  lastSynced: Date | null
}