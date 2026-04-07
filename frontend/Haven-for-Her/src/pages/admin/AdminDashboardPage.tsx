/**
 * pages/admin/AdminDashboardPage.tsx
 * Admin overview dashboard — Bloom palette.
 *
 * Data flow:
 *   Fetches GET /api/admin/dashboard once on mount.
 *   Passes typed slices down to purpose-built components.
 *   All type definitions mirror the AdminDashboardController response exactly.
 *
 * Layout (top → bottom):
 *   1. Page header + QuickActions
 *   2. Six stat cards (links to sub-pages)
 *   3. Three-column: SafehouseOccupancy | RiskChart | DonorHealth
 *   4. Two-column:   FinancialSnapshot (wider) | AlertsSection (narrower)
 */

import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { QuickActions }        from '@/components/admin/QuickActions';
import { SafehouseOccupancy }  from '@/components/admin/SafehouseOccupancy';
import { RiskChart }           from '@/components/admin/RiskChart';
import { DonorHealth }         from '@/components/admin/DonorHealth';
import { FinancialSnapshot }   from '@/components/admin/FinancialSnapshot';
import { AlertsSection }       from '@/components/admin/AlertsSection';

/* ─────────────────────────────────────────────────────────────────────────
 * Types — must stay in sync with AdminDashboardController response shape
 * ───────────────────────────────────────────────────────────────────────── */

interface DonationByType {
  type: string;
  total: number;
  count: number;
}

interface TopCampaign {
  campaign: string;
  total: number;
  count: number;
}

interface RiskLevel {
  level: string;
  count: number;
}

interface EscalatingRiskAlert {
  residentId: number;
  currentRiskLevel: string;
  initialRiskLevel: string;
  safehouse: string;
}

interface ConcernAlert {
  recordingId: number;
  residentId: number;
  sessionDate: string;
}

interface IncidentAlert {
  incidentId: number;
  residentId: number;
  safehouseId: number;
  incidentDate: string;
  severity: string;
}

interface MissedSessionAlert {
  residentId: number;
  safehouse: string;
}

interface FollowUpAlert {
  residentId: number;
  reintegrationStatus: string;
  dateClosed: string | null;
}

interface SafehouseOccupancyItem {
  safehouseName: string;
  activeCount: number;
  capacity: number;
}

interface TopPost {
  postId: number;
  platform: string;
  contentTopic: string;
  engagementRate: number;
  impressions: number;
}

interface DashboardData {
  quickStats: {
    totalActiveResidents: number;
    activeSafehouses: number;
    donationsThisMonth: number;
    activeDonors: number;
    unresolvedIncidents: number;
    engagementRateThisMonth: number;
  };
  financial: {
    totalDonationsThisMonth: number;
    totalDonationsLastMonth: number;
    percentChange: number;
    donationsByType: DonationByType[];
    topCampaigns: TopCampaign[];
    recurringVsOneTime: { recurring: number; oneTime: number };
    donorHealth: { active: number; lapsed: number; churned: number };
  };
  residents: {
    totalActive: number;
    bySafehouse: SafehouseOccupancyItem[];
    riskDistribution: RiskLevel[];
    alerts: {
      escalatingRisk: EscalatingRiskAlert[];
      recentConcerns: ConcernAlert[];
      unresolvedIncidents: IncidentAlert[];
      missedSessions: MissedSessionAlert[];
      followUpNeeded: FollowUpAlert[];
    };
  };
  social: {
    totalImpressions: number;
    totalReach: number;
    avgEngagementRate: number;
    topPost: TopPost | null;
    activeCampaigns: string[];
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────────────────── */

function php(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Stat card (top row)
 * ───────────────────────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string | number;
  href: string;
  /** Optional: 'destructive' tints the value red (e.g. unresolved incidents) */
  variant?: 'default' | 'destructive';
}

function StatCard({ label, value, href, variant = 'default' }: StatCardProps) {
  return (
    <a
      href={href}
      className="block rounded-2xl border border-border bg-card hover:bg-secondary/55 p-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </p>
      <p
        className={[
          'font-heading font-semibold text-xl tabular-nums',
          variant === 'destructive' ? 'text-destructive' : 'text-card-foreground',
        ].join(' ')}
      >
        {value}
      </p>
    </a>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Loading skeleton
 * ───────────────────────────────────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-full bg-muted" />
        <div className="h-8 w-64 rounded-xl bg-muted" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted" />
        ))}
      </div>
      {/* Three-column row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-muted" />
        ))}
      </div>
      {/* Two-column row */}
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <div className="h-80 rounded-2xl bg-muted" />
        <div className="h-80 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Page
 * ───────────────────────────────────────────────────────────────────────── */

export function AdminDashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api
      .get<DashboardData>('/api/admin/dashboard')
      .then(setData)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error)   return <p className="text-destructive p-8 text-sm">{error}</p>;
  if (!data)   return null;

  const { financial: fin, residents: res, social: soc, quickStats: qs } = data;

  const totalAlerts =
    res.alerts.escalatingRisk.length +
    res.alerts.recentConcerns.length +
    res.alerts.unresolvedIncidents.length +
    res.alerts.missedSessions.length +
    res.alerts.followUpNeeded.length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20 space-y-8">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Admin Dashboard
          </p>
          <h1 className="font-heading font-semibold text-4xl text-accent mt-1">
            Overview
          </h1>
        </div>
        <QuickActions />
      </div>

      {/* ── Six stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Active Residents"
          value={qs.totalActiveResidents}
          href="/admin/caseload"
        />
        <StatCard
          label="Safehouses"
          value={qs.activeSafehouses}
          href="/admin/safehouses"
        />
        <StatCard
          label="Donations (mo.)"
          value={php(qs.donationsThisMonth)}
          href="/financial/donations"
        />
        <StatCard
          label="Active Donors"
          value={qs.activeDonors}
          href="/financial/donors"
        />
        <StatCard
          label="Unresolved Incidents"
          value={qs.unresolvedIncidents}
          href="/admin/incidents"
          variant={qs.unresolvedIncidents > 0 ? 'destructive' : 'default'}
        />
        <StatCard
          label="Engagement Rate"
          value={`${(qs.engagementRateThisMonth * 100).toFixed(1)}%`}
          href="/social/dashboard"
        />
      </div>

      {/* ── Row 1: Residents overview ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <SafehouseOccupancy safehouses={res.bySafehouse} />
        <RiskChart riskDistribution={res.riskDistribution} />
        <DonorHealth
          active={fin.donorHealth.active}
          lapsed={fin.donorHealth.lapsed}
          churned={fin.donorHealth.churned}
        />
      </div>

      {/* ── Row 2: Financial + Alerts ──────────────────────── */}
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <FinancialSnapshot
          totalDonationsThisMonth={fin.totalDonationsThisMonth}
          totalDonationsLastMonth={fin.totalDonationsLastMonth}
          percentChange={fin.percentChange}
          donationsByType={fin.donationsByType}
          topCampaigns={fin.topCampaigns}
          recurringVsOneTime={fin.recurringVsOneTime}
        />
        <AlertsSection
          escalatingRisk={res.alerts.escalatingRisk}
          recentConcerns={res.alerts.recentConcerns}
          unresolvedIncidents={res.alerts.unresolvedIncidents}
          missedSessions={res.alerts.missedSessions}
          followUpNeeded={res.alerts.followUpNeeded}
        />
      </div>

      {/* ── Social media strip ─────────────────────────────── */}
      {(soc.totalImpressions > 0 || soc.activeCampaigns.length > 0) && (
        <div className="rounded-2xl bg-card border border-border p-5 shadow-[0_4px_24px_rgba(74,44,94,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-base text-card-foreground">
              Social Media
            </h3>
            <a
              href="/social/dashboard"
              className="text-xs font-semibold text-primary hover:text-accent transition-colors duration-150"
            >
              Full analytics →
            </a>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">
                Impressions
              </p>
              <p className="font-heading font-semibold text-lg text-card-foreground tabular-nums">
                {soc.totalImpressions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">
                Reach
              </p>
              <p className="font-heading font-semibold text-lg text-card-foreground tabular-nums">
                {soc.totalReach.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">
                Avg Engagement
              </p>
              <p className="font-heading font-semibold text-lg text-card-foreground tabular-nums">
                {(soc.avgEngagementRate * 100).toFixed(2)}%
              </p>
            </div>
            {soc.activeCampaigns.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">
                  Active Campaigns
                </p>
                <p className="font-heading font-semibold text-lg text-card-foreground tabular-nums">
                  {soc.activeCampaigns.length}
                </p>
              </div>
            )}
            {soc.topPost && (
              <div className="ml-auto text-right">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">
                  Top Post
                </p>
                <p className="text-xs font-semibold text-card-foreground">
                  {soc.topPost.contentTopic}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {soc.topPost.platform} · {soc.topPost.impressions.toLocaleString()} impressions
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer meta ────────────────────────────────────── */}
      <p className="text-[10px] text-muted-foreground text-center pb-4">
        {totalAlerts > 0
          ? `${totalAlerts} active alert${totalAlerts !== 1 ? 's' : ''} require attention · `
          : ''}
        Data from <span className="font-semibold">/api/admin/dashboard</span>
      </p>
    </div>
  );
}
