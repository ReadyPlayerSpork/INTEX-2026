import { useEffect, useState } from 'react'
import { api } from '@/api/client'

/* ---------- Types ---------- */

interface DonationByType {
  type: string
  total: number
  count: number
}

interface TopCampaign {
  name: string
  raised: number
  donorCount: number
}

interface RiskLevel {
  level: string
  count: number
}

interface ResidentAlert {
  residentId: number
  name: string
}

interface TopPost {
  title: string
  impressions: number
  engagement: number
}

interface DashboardData {
  /* quick stats */
  activeResidents: number
  activeSafehouses: number
  donationsThisMonth: number
  activeDonors: number
  unresolvedIncidents: number
  engagementRate: number

  /* financial */
  financial: {
    thisMonth: number
    lastMonth: number
    changePercent: number
    donationsByType: DonationByType[]
    topCampaigns: TopCampaign[]
    recurringCount: number
    oneTimeCount: number
    activeDonors: number
    lapsedDonors: number
    churnedDonors: number
  }

  /* residents */
  residents: {
    activeCount: number
    riskDistribution: RiskLevel[]
    escalatingRisk: ResidentAlert[]
    concernsFlagged: ResidentAlert[]
    unresolvedIncidents: ResidentAlert[]
    missedSessions: ResidentAlert[]
    followUpNeeded: ResidentAlert[]
  }

  /* social */
  social: {
    impressions: number
    reach: number
    engagement: number
    topPost: TopPost | null
    activeCampaigns: number
  }
}

/* ---------- Helpers ---------- */

function php(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

function pct(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/* ---------- Sub-components ---------- */

function AlertList({ title, items }: { title: string; items: ResidentAlert[] }) {
  if (items.length === 0) return null
  return (
    <div className="mb-3">
      <h4 className="text-sm font-medium mb-1">{title} ({items.length})</h4>
      <ul className="text-sm ml-4 list-disc">
        {items.map((r) => (
          <li key={r.residentId}>
            <a href={`/admin/residents/${r.residentId}`} className="underline">
              #{r.residentId} {r.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Page ---------- */

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<DashboardData>('/api/admin/dashboard')
      .then(setData)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-8 animate-pulse">Loading dashboard...</p>
  if (error) return <p className="p-8 text-red-600">{error}</p>
  if (!data) return null

  const { financial: fin, residents: res, social: soc } = data

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Active Residents" value={data.activeResidents} href="/admin/residents" />
        <StatCard label="Active Safehouses" value={data.activeSafehouses} href="/admin/safehouses" />
        <StatCard label="Donations (Month)" value={php(data.donationsThisMonth)} href="/admin/donations" />
        <StatCard label="Active Donors" value={data.activeDonors} href="/admin/donors" />
        <StatCard label="Unresolved Incidents" value={data.unresolvedIncidents} href="/admin/incidents" />
        <StatCard label="Engagement Rate" value={`${(data.engagementRate * 100).toFixed(1)}%`} href="/admin/social" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Financial section */}
        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">
            <a href="/admin/donations" className="underline">Financial</a>
          </h2>

          <div className="flex gap-4 mb-3 text-sm">
            <div>
              <span className="text-gray-500">This month:</span> {php(fin.thisMonth)}
            </div>
            <div>
              <span className="text-gray-500">Last month:</span> {php(fin.lastMonth)}
            </div>
            <div className={fin.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
              {pct(fin.changePercent)}
            </div>
          </div>

          <h3 className="text-sm font-medium mb-1">Donations by Type</h3>
          <ul className="text-sm mb-3 ml-4 list-disc">
            {fin.donationsByType.map((d) => (
              <li key={d.type}>
                {d.type}: {php(d.total)} ({d.count})
              </li>
            ))}
          </ul>

          <h3 className="text-sm font-medium mb-1">Top Campaigns</h3>
          <ul className="text-sm mb-3 ml-4 list-disc">
            {fin.topCampaigns.map((c) => (
              <li key={c.name}>
                {c.name}: {php(c.raised)} — {c.donorCount} donors
              </li>
            ))}
          </ul>

          <div className="text-sm space-y-1">
            <div>Recurring: {fin.recurringCount} | One-time: {fin.oneTimeCount}</div>
            <div>
              Donor Health — Active: {fin.activeDonors}, Lapsed: {fin.lapsedDonors}, Churned: {fin.churnedDonors}
            </div>
          </div>
        </section>

        {/* Residents section */}
        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">
            <a href="/admin/residents" className="underline">Residents</a>
          </h2>

          <p className="text-sm mb-3">Active: {res.activeCount}</p>

          <h3 className="text-sm font-medium mb-1">Risk Distribution</h3>
          <ul className="text-sm mb-3 ml-4 list-disc">
            {res.riskDistribution.map((r) => (
              <li key={r.level} className={r.level === 'Critical' ? 'text-red-600 font-semibold' : ''}>
                {r.level}: {r.count}
              </li>
            ))}
          </ul>

          <h3 className="text-sm font-medium mb-2">Alerts</h3>
          <AlertList title="Escalating Risk" items={res.escalatingRisk} />
          <AlertList title="Concerns Flagged" items={res.concernsFlagged} />
          <AlertList title="Unresolved Incidents" items={res.unresolvedIncidents} />
          <AlertList title="Missed Sessions" items={res.missedSessions} />
          <AlertList title="Follow-up Needed" items={res.followUpNeeded} />
        </section>

        {/* Social section */}
        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">
            <a href="/admin/social" className="underline">Social</a>
          </h2>

          <div className="text-sm space-y-1 mb-3">
            <div>Impressions: {soc.impressions.toLocaleString()}</div>
            <div>Reach: {soc.reach.toLocaleString()}</div>
            <div>Engagement: {soc.engagement.toLocaleString()}</div>
            <div>Active Campaigns: {soc.activeCampaigns}</div>
          </div>

          {soc.topPost && (
            <div className="text-sm">
              <h3 className="font-medium mb-1">Top Post</h3>
              <p>{soc.topPost.title}</p>
              <p className="text-gray-500">
                {soc.topPost.impressions.toLocaleString()} impressions,{' '}
                {soc.topPost.engagement.toLocaleString()} engagements
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/* ---------- Stat card ---------- */

function StatCard({
  label,
  value,
  href,
}: {
  label: string
  value: string | number
  href: string
}) {
  return (
    <a href={href} className="border rounded p-3 hover:bg-gray-50 block">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </a>
  )
}
