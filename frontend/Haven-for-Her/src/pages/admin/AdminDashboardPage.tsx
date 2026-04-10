/**
 * Admin executive dashboard — portal layout + mockup-aligned sections.
 * Data: GET /api/admin/dashboard (PostgreSQL via EF Core).
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingUp, Brain, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/api/client'
import { getResidentAlerts, retrainModels, getMLStatus, type IncidentRiskAlert, type MLStatus } from '@/api/mlApi'
import { SafehouseOccupancy } from '@/components/admin/SafehouseOccupancy'
import { DonorHealth } from '@/components/admin/DonorHealth'
import { FinancialSnapshot } from '@/components/admin/FinancialSnapshot'
import { DonationsTrendChart } from '@/components/admin/DonationsTrendChart'
import { RiskDonutChart } from '@/components/admin/RiskDonutChart'
import { NarrativeAlertsPanel } from '@/components/admin/NarrativeAlertsPanel'
import { CaseloadPreviewTable, type CaseloadRow } from '@/components/admin/CaseloadPreviewTable'
import { formatCurrencyAmount } from '@/features/public/donate/donationCurrencies'

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

function usd(amount: number): string {
  return formatCurrencyAmount('USD', amount)
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
      className="border-border bg-card hover:bg-secondary/50 block rounded-2xl border p-4 shadow-bloom transition-colors duration-150 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none focus-visible:ring-2"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
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
        <p className="text-muted-foreground mt-1 text-xs leading-snug">{sub}</p>
      ) : null}
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-8 px-0">
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
        <div className="bg-muted h-56 rounded-2xl" />
        <div className="bg-muted h-56 rounded-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-muted h-52 rounded-2xl" />
        <div className="bg-muted h-52 rounded-2xl" />
        <div className="bg-muted h-52 rounded-2xl" />
      </div>
      <div className="bg-muted h-64 rounded-2xl" />
      <div className="bg-muted h-20 rounded-2xl" />
      <div className="bg-muted h-72 rounded-2xl" />
    </div>
  )
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mlAlerts, setMlAlerts] = useState<IncidentRiskAlert[] | null>(null)
  const [mlStatus, setMlStatus] = useState<MLStatus | null>(null)
  const [isRetraining, setIsRetraining] = useState(false)
  const [retrainError, setRetrainError] = useState('')

  const handleRetrain = async () => {
    setIsRetraining(true)
    setRetrainError('')
    try {
      const res = await retrainModels()
      if (res && res.status === 'success') {
        const [updatedAlerts, updatedStatus] = await Promise.all([
          getResidentAlerts(),
          getMLStatus()
        ])
        setMlAlerts(updatedAlerts)
        setMlStatus(updatedStatus)
      } else {
        setRetrainError('Model retraining failed. Please try again.')
      }
    } catch {
      setRetrainError('Could not connect to the ML service.')
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
    getMLStatus().then(setMlStatus).catch(() => { /* No metadata yet */ })
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
            Organization Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Organizational overview</p>
        </div>
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
          value={usd(qs.donationsThisMonth)}
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

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-bloom">
        {isRetraining && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-background/80">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-primary size-5 animate-spin" />
              <p className="text-sm font-semibold text-card-foreground">
                Retraining models&hellip;
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Brain className="text-primary size-5" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-card-foreground">
                Intelligence Governance
              </h2>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Model Status: {mlStatus?.lastTrained ? (
                  <span className="text-primary">Dynamic (Live Data)</span>
                ) : (
                  <span className="text-[var(--chart-3)]">Static (Initialization)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-tight">
                Last Trained
              </p>
              <p className="text-card-foreground text-xs font-semibold">
                {mlStatus?.lastTrained 
                  ? new Date(mlStatus.lastTrained).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })
                  : 'Never (Run Initial Train)'}
              </p>
            </div>
            <Button
              onClick={handleRetrain}
              disabled={isRetraining}
              size="sm"
              className="group gap-2"
            >
              <RefreshCw className={`size-3.5 ${isRetraining ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isRetraining ? 'Processing...' : 'Retrain Models'}
            </Button>
          </div>
        </div>
        {retrainError && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive" role="alert">
            {retrainError}
          </p>
        )}
      </div>

      {mlAlerts && mlAlerts.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-bloom">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="text-primary size-5" />
            <h2 className="font-heading text-base font-semibold text-card-foreground">
              ML Risk Alerts
            </h2>
            <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
              {mlAlerts.length} flagged
            </span>
          </div>
          <p className="text-muted-foreground mb-3 text-xs">
            Residents predicted to have elevated incident escalation risk by the ML model.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="ML risk alerts">
              <thead>
                <tr className="border-border border-b text-left">
                  <th scope="col" className="px-3 py-2 font-medium">Resident</th>
                  <th scope="col" className="px-3 py-2 font-medium">Current Risk</th>
                  <th scope="col" className="px-3 py-2 font-medium">ML Escalation Prob.</th>
                  <th scope="col" className="px-3 py-2 font-medium">ML Risk</th>
                </tr>
              </thead>
              <tbody>
                {mlAlerts.slice(0, 8).map((a) => (
                  <tr key={a.residentId} className="border-border border-b">
                    <td className="px-3 py-2">
                      {a.internalCode}
                    </td>
                    <td className="px-3 py-2">{a.currentRiskLevel}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {(a.escalationProbability * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.riskLevel === 'High'
                            ? 'bg-destructive/10 text-destructive'
                            : a.riskLevel === 'Medium'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {a.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <DonationsTrendChart
          months={months}
          formatMoney={usd}
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

      <CaseloadPreviewTable rows={res.caseloadPreview ?? []} />

      {(soc.totalImpressions > 0 || soc.activeCampaigns.length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-card-foreground">
              Social media
            </h2>
            <Link
              to="/social/dashboard"
              className="text-primary text-xs font-semibold hover:underline"
            >
              Full analytics →
            </Link>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-muted-foreground mb-0.5 text-xs font-bold uppercase tracking-wide">
                Impressions
              </p>
              <p className="font-heading text-card-foreground text-lg font-semibold tabular-nums">
                {soc.totalImpressions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-xs font-bold uppercase tracking-wide">
                Reach
              </p>
              <p className="font-heading text-card-foreground text-lg font-semibold tabular-nums">
                {soc.totalReach.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-xs font-bold uppercase tracking-wide">
                Avg engagement
              </p>
              <p className="font-heading text-card-foreground text-lg font-semibold tabular-nums">
                {(soc.avgEngagementRate * 100).toFixed(2)}%
              </p>
            </div>
            {soc.topPost && (
              <div className="ml-auto text-right">
                <p className="text-muted-foreground mb-0.5 text-xs font-bold uppercase tracking-wide">
                  Top post
                </p>
                <p className="text-card-foreground text-xs font-semibold">{soc.topPost.contentTopic}</p>
                <p className="text-muted-foreground text-xs">
                  {soc.topPost.platform} · {soc.topPost.impressions.toLocaleString()} impressions
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
