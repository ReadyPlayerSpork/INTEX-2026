/**
 * Admin executive dashboard — portal layout + mockup-aligned sections.
 * Data: GET /api/admin/dashboard (SQLite via EF Core).
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingUp, Brain, RefreshCw } from 'lucide-react'
import { api } from '@/api/client'
import { getResidentAlerts, retrainModels, type IncidentRiskAlert } from '@/api/mlApi'
import { QuickActions } from '@/components/admin/QuickActions'
import { SafehouseOccupancy } from '@/components/admin/SafehouseOccupancy'
import { DonorHealth } from '@/components/admin/DonorHealth'
import { FinancialSnapshot } from '@/components/admin/FinancialSnapshot'
import { DonationsTrendChart } from '@/components/admin/DonationsTrendChart'
import { RiskDonutChart } from '@/components/admin/RiskDonutChart'
import { NarrativeAlertsPanel } from '@/components/admin/NarrativeAlertsPanel'
import { CaseloadPreviewTable, type CaseloadRow } from '@/components/admin/CaseloadPreviewTable'

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
  caseControlNo: string
  currentRiskLevel: string
  initialRiskLevel: string
  safehouse: string
  referenceAt: string
}

interface ConcernAlert {
  recordingId: number
  residentId: number
  sessionDate: string
  caseControlNo: string
  referenceAt: string
}

interface IncidentAlert {
  incidentId: number
  residentId: number
  safehouseId: number
  incidentDate: string
  severity: string
  caseControlNo: string
  safehouseName: string
  referenceAt: string
}

interface MissedSessionAlert {
  residentId: number
  caseControlNo: string
  safehouse: string
  referenceAt: string
}

interface FollowUpAlert {
  residentId: number
  caseControlNo: string
  reintegrationStatus: string
  dateClosed: string | null
  referenceAt: string
}

interface SafehouseOccupancyItem {
  safehouseName: string
  activeCount: number
  capacity: number
}

interface DonationMonthPoint {
  label: string
  year: number
  month: number
  total: number
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
    criticalRiskResidents: number
    highRiskCases: number
    upcomingVisitationsNext7Days: number
  }
  financial: {
    totalDonationsThisMonth: number
    totalDonationsLastMonth: number
    percentChange: number
    donationsByType: DonationByType[]
    topCampaigns: TopCampaign[]
    recurringVsOneTime: { recurring: number; oneTime: number }
    donorHealth: { active: number; lapsed: number; churned: number }
    donationsByMonth: DonationMonthPoint[]
  }
  residents: {
    totalActive: number
    bySafehouse: SafehouseOccupancyItem[]
    riskDistribution: RiskLevel[]
    caseloadPreview: CaseloadRow[]
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

function php(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function pctChange(p: number): string {
  const sign = p > 0 ? '+' : ''
  return `${sign}${p.toFixed(1)}%`
}

function SummaryCard({
  label,
  value,
  sub,
  href,
  variant = 'default',
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  href: string
  variant?: 'default' | 'destructive'
  icon?: React.ReactNode
}) {
  return (
    <Link
      to={href}
      className="border-border bg-card hover:bg-secondary/50 block rounded-2xl border p-4 shadow-[0_4px_24px_rgba(74,44,94,0.03)] transition-colors duration-150 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none focus-visible:ring-2"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
          {label}
        </p>
        {icon}
      </div>
      <p
        className={[
          'font-heading mt-1 text-2xl font-bold tabular-nums',
          variant === 'destructive' ? 'text-destructive' : 'text-card-foreground',
        ].join(' ')}
      >
        {value}
      </p>
      {sub ? (
        <p className="text-muted-foreground mt-1 text-[11px] leading-snug">{sub}</p>
      ) : null}
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6 px-0">
      <div className="space-y-2">
        <div className="bg-muted h-3 w-40 rounded-full" />
        <div className="bg-muted h-9 w-72 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-muted h-72 rounded-2xl" />
        <div className="bg-muted h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mlAlerts, setMlAlerts] = useState<IncidentRiskAlert[] | null>(null)
  const [isRetraining, setIsRetraining] = useState(false)

  const handleRetrain = async () => {
    setIsRetraining(true)
    try {
      const res = await retrainModels()
      if (res && res.status === 'success') {
        alert('Models retrained successfully!')
        // Optionally refresh alerts
        const updatedAlerts = await getResidentAlerts()
        setMlAlerts(updatedAlerts)
      } else {
        alert('Failed to retrain models.')
      }
    } catch (err) {
      alert('Error during model retraining.')
    } finally {
      setIsRetraining(false)
    }
  }

  useEffect(() => {
    api
      .get<DashboardData>('/api/admin/dashboard')
      .then(setData)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))

    getResidentAlerts().then(setMlAlerts).catch(() => { /* ML service unavailable */ })
  }, [])

  if (loading) return <DashboardSkeleton />
  if (error) return <p className="text-destructive p-8 text-sm">{error}</p>
  if (!data) return null

  const { financial: fin, residents: res, social: soc, quickStats: qs } = data

  const rec = fin.recurringVsOneTime.recurring + fin.recurringVsOneTime.oneTime
  const recurringPct =
    rec > 0 ? Math.round((fin.recurringVsOneTime.recurring / rec) * 100) : 0
  const oneTimePct =
    rec > 0 ? Math.round((fin.recurringVsOneTime.oneTime / rec) * 100) : 0

  const months = fin.donationsByMonth?.length
    ? fin.donationsByMonth
    : Array.from({ length: 6 }).map((_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return {
          label: d.toLocaleString('en', { month: 'short' }),
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          total: 0,
        }
      })

  const critical = qs.criticalRiskResidents ?? 0

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-0 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.18em]">
            Admin Dashboard
          </p>
          <h1 className="font-heading text-accent mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Haven for Her
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Organizational overview</p>
        </div>
        <QuickActions />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Active residents"
          value={qs.totalActiveResidents}
          sub={
            critical > 0
              ? `${critical} critical`
              : 'No critical cases flagged'
          }
          href="/admin/caseload"
        />
        <SummaryCard
          label="High-risk cases"
          value={qs.highRiskCases ?? 0}
          sub="High + critical (active)"
          href="/admin/caseload"
          variant={(qs.highRiskCases ?? 0) > 0 ? 'destructive' : 'default'}
          icon={<AlertTriangle className="text-destructive size-4 shrink-0 opacity-80" />}
        />
        <SummaryCard
          label="Donations (month)"
          value={php(qs.donationsThisMonth)}
          sub={`${pctChange(fin.percentChange)} vs last month`}
          href="/financial/donations"
          icon={<TrendingUp className="text-primary size-4 shrink-0 opacity-80" />}
        />
        <SummaryCard
          label="Upcoming visitations"
          value={qs.upcomingVisitationsNext7Days ?? 0}
          sub="Home visits in the next 7 days (all residents)"
          href="/admin/caseload"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <DonationsTrendChart
          months={months}
          formatMoney={php}
          recurringPct={recurringPct}
          oneTimePct={oneTimePct}
        />
        <NarrativeAlertsPanel
          escalatingRisk={res.alerts.escalatingRisk}
          recentConcerns={res.alerts.recentConcerns}
          missedSessions={res.alerts.missedSessions}
          unresolvedIncidents={res.alerts.unresolvedIncidents}
          followUpNeeded={res.alerts.followUpNeeded}
          maxItems={6}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SafehouseOccupancy safehouses={res.bySafehouse} />
        <RiskDonutChart
          riskDistribution={res.riskDistribution}
          criticalCount={critical}
        />
        <DonorHealth
          active={fin.donorHealth.active}
          lapsed={fin.donorHealth.lapsed}
          churned={fin.donorHealth.churned}
        />
      </div>

      <FinancialSnapshot
        totalDonationsThisMonth={fin.totalDonationsThisMonth}
        totalDonationsLastMonth={fin.totalDonationsLastMonth}
        percentChange={fin.percentChange}
        donationsByType={fin.donationsByType}
        topCampaigns={fin.topCampaigns}
        recurringVsOneTime={fin.recurringVsOneTime}
      />

      {mlAlerts && mlAlerts.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_4px_24px_rgba(74,44,94,0.03)]">
          {isRetraining && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
              <div className="relative flex flex-col items-center gap-6 rounded-3xl border border-white/20 bg-card/40 p-10 text-center shadow-2xl backdrop-blur-xl max-w-sm overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
                
                <div className="relative">
                  <RefreshCw className="text-primary size-12 animate-spin transition-all duration-1000" />
                  <div className="absolute inset-0 size-12 rounded-full border-4 border-primary/20" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    Calibrating Intelligence
                  </h3>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Connecting to the live PostgreSQL cluster to process the latest resident and donor data.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                      Training 5 Predictive Engines
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground mt-1">
                      ESTIMATED TIME: ~120 SECONDS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="mb-4 flex items-center gap-2">
            <Brain className="text-primary size-5" />
            <h3 className="font-heading text-base font-semibold text-card-foreground">
              ML Risk Alerts
            </h3>
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              {mlAlerts.length} flagged
            </span>
            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`size-3 ${isRetraining ? 'animate-spin' : ''}`} />
              {isRetraining ? 'Retraining...' : 'Retrain Models'}
            </button>
          </div>
          <p className="text-muted-foreground mb-3 text-xs">
            Residents predicted to have elevated incident escalation risk by the ML model.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Resident</th>
                  <th className="px-3 py-2 font-medium">Current Risk</th>
                  <th className="px-3 py-2 font-medium">ML Escalation Prob.</th>
                  <th className="px-3 py-2 font-medium">ML Risk</th>
                </tr>
              </thead>
              <tbody>
                {mlAlerts.slice(0, 8).map((a) => (
                  <tr key={a.resident_id} className="border-border border-b">
                    <td className="px-3 py-2">
                      {a.first_name} {a.last_name}
                    </td>
                    <td className="px-3 py-2">{a.current_risk_level}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {(a.escalation_probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.risk_level === 'High'
                            ? 'bg-red-100 text-red-800'
                            : a.risk_level === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {a.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CaseloadPreviewTable rows={res.caseloadPreview ?? []} />

      {(soc.totalImpressions > 0 || soc.activeCampaigns.length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_24px_rgba(74,44,94,0.03)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold text-card-foreground">
              Social media
            </h3>
            <Link
              to="/social/dashboard"
              className="text-primary text-xs font-semibold hover:underline"
            >
              Full analytics →
            </Link>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold uppercase tracking-wide">
                Impressions
              </p>
              <p className="font-heading text-card-foreground text-lg font-semibold tabular-nums">
                {soc.totalImpressions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold uppercase tracking-wide">
                Reach
              </p>
              <p className="font-heading text-card-foreground text-lg font-semibold tabular-nums">
                {soc.totalReach.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold uppercase tracking-wide">
                Avg engagement
              </p>
              <p className="font-heading text-card-foreground text-lg font-semibold tabular-nums">
                {(soc.avgEngagementRate * 100).toFixed(2)}%
              </p>
            </div>
            {soc.topPost && (
              <div className="ml-auto text-right">
                <p className="text-muted-foreground mb-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Top post
                </p>
                <p className="text-card-foreground text-xs font-semibold">{soc.topPost.contentTopic}</p>
                <p className="text-muted-foreground text-[10px]">
                  {soc.topPost.platform} · {soc.topPost.impressions.toLocaleString()} impressions
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-muted-foreground pb-4 text-center text-[10px]">
        Live data from SQLite via{' '}
        <span className="font-semibold">/api/admin/dashboard</span>
      </p>
    </div>
  )
}
