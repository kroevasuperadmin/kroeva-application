const mockApps = [
  { id: 'slack', name: 'Slack', logo: '💬', cost: 725, licenses: 100, unusedLicenses: 25 },
  { id: 'github', name: 'GitHub', logo: '🐙', cost: 400, licenses: 100, unusedLicenses: 30 },
]

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // AWAIT the params in Next.js 15
  const { id } = await params
  
  const app = mockApps.find(a => a.id === id)

  if (!app) {
    return <div className="p-8">App not found. ID: {id}</div>
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-4xl font-bold">{app.logo} {app.name}</h1>
      <p className="text-xl">Cost: ${app.cost}/month</p>
      <p>Licenses: {app.licenses}</p>
      <p>Unused: {app.unusedLicenses}</p>
    </div>
  )
}