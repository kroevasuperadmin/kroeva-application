// lib/mock-data.ts
export interface Application {
  id: string
  name: string
  logo: string
  category: string
  cost: number
  billingCycle: 'monthly' | 'yearly'
  licenses: number
  unusedLicenses: number
  lastUsed: string
  status: 'active' | 'inactive' | 'cancelled'
}

export const mockApplications: Application[] = [
  {
    id: 'slack',
    name: 'Slack',
    logo: '💬',
    category: 'Communication',
    cost: 725,
    billingCycle: 'monthly',
    licenses: 100,
    unusedLicenses: 25,
    lastUsed: '2025-11-28',
    status: 'active',
  },
  {
    id: 'github',
    name: 'GitHub',
    logo: '🐙',
    category: 'Development',
    cost: 400,
    billingCycle: 'monthly',
    licenses: 100,
    unusedLicenses: 30,
    lastUsed: '2025-11-30',
    status: 'active',
  },
]

export function getApplicationById(id: string): Application | undefined {
  return mockApplications.find(app => app.id === id)
}

export function calculatePotentialSavings(app: Application): number {
  const costPerLicense = app.cost / app.licenses
  return costPerLicense * app.unusedLicenses
}