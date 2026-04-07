import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'

/* ---------- Types matching AdminDashboardController response ---------- */

interface DonationByType {
  type: string
  total: number
  count: number
}

interface TopCampaign {
  campaign: string
  total: number
  count: number
}

interface RiskLevel {
  level: string
  count: number
}

interface EscalatingRiskAlert {
  residentId: number
  currentRiskLevel: string
  initialRiskLevel: string
  safehouse: string
}

interface ConcernAlert {
  recordingId: number
  residentId: number
  sessionDate: string
}

interface IncidentAlert {
  incidentId: number
  residentId: number
  safehouseId: number
  incidentDate: string
  severity: string
}

interface MissedSessionAlert {
  residentId: number
  safehouse: string
}

interface FollowUpAlert {
  residentId: number
  reintegrationStatus: string
  dateClosed: string | null
}

interface SafehouseOccupancy {
  safehouseName: string
  activeCount: number
  capacity: number
}

interface TopPost {
  postId: number
  platform: string
  contentTopic: string
  engagementRate: number
  impressions: number
}

interface DashboardData {
  quickStats: {
    totalActiveResidents: number
    activeSafehouses: number
    donationsThisMonth: number
    activeDonors: number
    unresolvedIncidents: number
    engagementRateThisMonth: number
  }
  financial: {
    totalDonationsThisMonth: number
    totalDonationsLastMonth: number
    percentChange: number
    donationsByType: DonationByType[]
    topCampaigns: TopCampaign[]
    recurringVsOneTime: { recurring: number; oneTime: number }
    donorHealth: { active: number; lapsed: number; churned: number }
  }
  residents: {
    totalActive: number
    bySafehouse: SafehouseOccupancy[]
    riskDistribution: RiskLevel[]
    alerts: {
      escalatingRisk: EscalatingRiskAlert[]
      recentConcerns: ConcernAlert[]
      unresolvedIncidents: IncidentAlert[]
      missedSessions: MissedSessionAlert[]
      followUpNeeded: FollowUpAlert[]
    }
  }
  social: {
    totalImpressions: number
    totalReach: number
    avgEngagementRate: number
    topPost: TopPost | null
    activeCampaigns: string[]
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

function AlertCount({ title, count, children }: { title: string; count: number; children?: React.ReactNode }) {
  if (count === 0) return null
  return (
    <div className="mb-3">
      <h4 className="text-sm font-medium mb-1">{title} ({count})</h4>
      {children}
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
  if (error) return <p className="text-destructive p-8">{error}</p>
  if (!data) return null

  const { financial: fin, residents: res, social: soc, quickStats: qs } = data

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="mb-6">
        <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
          Admin dashboard
        </p>
        <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
          Admin Dashboard
        </h1>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Active Residents" value={qs.totalActiveResidents} href="/admin/caseload" />
        <StatCard label="Active Safehouses" value={qs.activeSafehouses} href="/admin/safehouses" />
        <StatCard label="Donations (Month)" value={php(qs.donationsThisMonth)} href="/financial/donations" />
        <StatCard label="Active Donors" value={qs.activeDonors} href="/financial/donors" />
        <StatCard label="Unresolved Incidents" value={qs.unresolvedIncidents} href="/admin/incidents" />
        <StatCard label="Engagement Rate" value={`${(qs.engagementRateThisMonth * 100).toFixed(1)}%`} href="/social/dashboard" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Financial section */}
        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">
              <a href="/financial/dashboard" className="underline">Financial</a>
            </h2>

            <div className="flex gap-4 mb-3 text-sm">
              <div>
                <span className="text-muted-foreground">This month:</span> {php(fin.totalDonationsThisMonth)}
              </div>
              <div>
                <span className="text-muted-foreground">Last month:</span> {php(fin.totalDonationsLastMonth)}
              </div>
              <div className={fin.percentChange >= 0 ? 'text-primary' : 'text-destructive'}>
                {pct(fin.percentChange)}
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
                <li key={c.campaign}>
                  {c.campaign}: {php(c.total)} — {c.count} donations
                </li>
              ))}
            </ul>

            <div className="text-sm space-y-1">
              <div>Recurring: {fin.recurringVsOneTime.recurring} | One-time: {fin.recurringVsOneTime.oneTime}</div>
              <div>
                Donor Health — Active: {fin.donorHealth.active}, Lapsed: {fin.donorHealth.lapsed}, Churned: {fin.donorHealth.churned}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residents section */}
        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">
              <a href="/admin/caseload" className="underline">Residents</a>
            </h2>

            <p className="text-sm mb-3">Active: {res.totalActive}</p>

            {res.bySafehouse.length > 0 && (
              <>
                <h3 className="text-sm font-medium mb-1">By Safehouse</h3>
                <ul className="text-sm mb-3 ml-4 list-disc">
                  {res.bySafehouse.map((s) => (
                    <li key={s.safehouseName}>
                      {s.safehouseName}: {s.activeCount} / {s.capacity}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="text-sm font-medium mb-1">Risk Distribution</h3>
            <ul className="text-sm mb-3 ml-4 list-disc">
              {res.riskDistribution.map((r) => (
                <li key={r.level} className={r.level === 'Critical' ? 'text-destructive font-semibold' : ''}>
                  {r.level}: {r.count}
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-medium mb-2">Alerts</h3>
            <AlertCount title="Escalating Risk" count={res.alerts.escalatingRisk.length}>
              <ul className="text-sm ml-4 list-disc">
                {res.alerts.escalatingRisk.map((r) => (
                  <li key={r.residentId}>
                    <a href={`/admin/caseload/${r.residentId}`} className="underline">
                      #{r.residentId}
                    </a>{' '}
                    {r.initialRiskLevel} → {r.currentRiskLevel} ({r.safehouse})
                  </li>
                ))}
              </ul>
            </AlertCount>
            <AlertCount title="Concerns Flagged" count={res.alerts.recentConcerns.length}>
              <ul className="text-sm ml-4 list-disc">
                {res.alerts.recentConcerns.map((c) => (
                  <li key={c.recordingId}>
                    <a href={`/admin/caseload/${c.residentId}`} className="underline">
                      Resident #{c.residentId}
                    </a>{' '}
                    — {c.sessionDate}
                  </li>
                ))}
              </ul>
            </AlertCount>
            <AlertCount title="Unresolved Incidents" count={res.alerts.unresolvedIncidents.length}>
              <ul className="text-sm ml-4 list-disc">
                {res.alerts.unresolvedIncidents.map((i) => (
                  <li key={i.incidentId}>
                    <a href={`/admin/caseload/${i.residentId}`} className="underline">
                      Resident #{i.residentId}
                    </a>{' '}
                    — {i.severity} ({i.incidentDate})
                  </li>
                ))}
              </ul>
            </AlertCount>
            <AlertCount title="Missed Sessions (30d)" count={res.alerts.missedSessions.length}>
              <ul className="text-sm ml-4 list-disc">
                {res.alerts.missedSessions.map((m) => (
                  <li key={m.residentId}>
                    <a href={`/admin/caseload/${m.residentId}`} className="underline">
                      #{m.residentId}
                    </a>{' '}
                    ({m.safehouse})
                  </li>
                ))}
              </ul>
            </AlertCount>
            <AlertCount title="Follow-up Needed" count={res.alerts.followUpNeeded.length}>
              <ul className="text-sm ml-4 list-disc">
                {res.alerts.followUpNeeded.map((f) => (
                  <li key={f.residentId}>
                    <a href={`/admin/caseload/${f.residentId}`} className="underline">
                      #{f.residentId}
                    </a>{' '}
                    — {f.reintegrationStatus}
                  </li>
                ))}
              </ul>
            </AlertCount>
          </CardContent>
        </Card>

        {/* Social section */}
        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">
              <a href="/social/dashboard" className="underline">Social</a>
            </h2>

            <div className="text-sm space-y-1 mb-3">
              <div>Impressions: {soc.totalImpressions.toLocaleString()}</div>
              <div>Reach: {soc.totalReach.toLocaleString()}</div>
              <div>Avg Engagement: {(soc.avgEngagementRate * 100).toFixed(2)}%</div>
              <div>Active Campaigns: {soc.activeCampaigns.length}</div>
            </div>

            {soc.topPost && (
              <div className="text-sm">
                <h3 className="font-medium mb-1">Top Post This Month</h3>
                <p>{soc.topPost.contentTopic} ({soc.topPost.platform})</p>
                <p className="text-muted-foreground">
                  {soc.topPost.impressions.toLocaleString()} impressions,{' '}
                  {(soc.topPost.engagementRate * 100).toFixed(2)}% engagement
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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
    <a href={href} className="border-border/70 bg-card/95 hover:bg-secondary/55 block rounded-2xl border p-4 transition-colors">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </a>
  )
}
