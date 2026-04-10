/**
 * components/admin/FinancialSnapshot.tsx
 * Financial overview panel — Bloom palette.
 *
 * Displays:
 *   - This month vs last month with % change
 *   - Donations by type (styled horizontal bars)
 *   - Top campaigns
 *   - Recurring vs one-time split
 */

import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrencyAmount } from '@/features/public/donate/donationCurrencies';

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

interface FinancialSnapshotProps {
  totalDonationsThisMonth: number;
  totalDonationsLastMonth: number;
  percentChange: number;
  donationsByType: DonationByType[];
  topCampaigns: TopCampaign[];
  recurringVsOneTime: { recurring: number; oneTime: number };
}

function usd(amount: number): string {
  return formatCurrencyAmount('USD', amount);
}

function pct(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export const FinancialSnapshot = memo(function FinancialSnapshot({
  totalDonationsThisMonth,
  totalDonationsLastMonth,
  percentChange,
  donationsByType,
  topCampaigns,
  recurringVsOneTime,
}: FinancialSnapshotProps) {
  const maxByType = Math.max(...donationsByType.map((d) => d.total), 1);
  const totalTypeTotal = donationsByType.reduce((s, d) => s + d.total, 0);

  const TrendIcon =
    percentChange > 0 ? TrendingUp : percentChange < 0 ? TrendingDown : Minus;
  const trendColor =
    percentChange > 0
      ? 'text-primary'
      : percentChange < 0
        ? 'text-destructive'
        : 'text-muted-foreground';

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-bloom">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-heading font-semibold text-base text-card-foreground">
            Financial Snapshot
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Donations overview · monetary gifts, last 30 days
          </p>
        </div>
        <Link
          to="/financial/dashboard"
          className="text-xs font-semibold text-primary hover:text-accent transition-colors duration-150"
        >
          Full report →
        </Link>
      </div>

      {/* Month comparison */}
      <div className="flex items-end gap-4 mb-5">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
            Last 30 days
          </p>
          <p className="font-heading font-semibold text-2xl text-card-foreground tabular-nums">
            {usd(totalDonationsThisMonth)}
          </p>
        </div>
        <div className="pb-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
            Prior 30 days
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">{usd(totalDonationsLastMonth)}</p>
        </div>
        <div className={`flex items-center gap-1 pb-1 ml-auto ${trendColor}`}>
          <TrendIcon size={14} />
          <span className="text-sm font-semibold tabular-nums">{pct(percentChange)}</span>
        </div>
      </div>

      {/* Recurring vs One-time pill */}
      <div className="flex gap-2 mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {recurringVsOneTime.recurring} recurring (monetary)
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          {recurringVsOneTime.oneTime} one-time (monetary)
        </span>
      </div>

      {/* Donations by type */}
      {donationsByType.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            By Type
          </h4>
          <div className="space-y-3">
            {donationsByType.map((d) => {
              const barPct = totalTypeTotal > 0 ? (d.total / maxByType) * 100 : 0;
              return (
                <div key={d.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-card-foreground">{d.type}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {usd(d.total)}{' '}
                      <span className="text-xs">({d.count})</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70 transition-all duration-700 ease-out"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top campaigns */}
      {topCampaigns.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
            Top Campaigns
          </h4>
          <ul className="space-y-1.5">
            {topCampaigns.slice(0, 4).map((c, i) => (
              <li key={c.campaign} className="flex items-center gap-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="truncate text-card-foreground font-medium flex-1">
                  {c.campaign}
                </span>
                <span className="tabular-nums text-muted-foreground shrink-0">
                  {usd(c.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
})
