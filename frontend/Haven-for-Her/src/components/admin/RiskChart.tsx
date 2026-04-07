/**
 * components/admin/RiskChart.tsx
 * Risk distribution — styled horizontal bars, Bloom palette.
 * No external chart library needed.
 *
 * Risk colours:
 *   Low      → sage (primary)
 *   Medium   → warm yellow (chart-3)
 *   High     → destructive/70
 *   Critical → destructive (full red) + pulse on banner
 */

import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RiskLevelItem {
  level: string;
  count: number;
}

interface RiskChartProps {
  riskDistribution: RiskLevelItem[];
}

const RISK_CONFIG: Record<
  string,
  { bar: string; label: string; dot: string }
> = {
  Low:      { bar: 'bg-primary',           label: 'text-primary',      dot: 'bg-primary' },
  Medium:   { bar: 'bg-[var(--chart-3)]',  label: 'text-[var(--chart-3)]', dot: 'bg-[var(--chart-3)]' },
  High:     { bar: 'bg-destructive/70',    label: 'text-destructive',  dot: 'bg-destructive/70' },
  Critical: { bar: 'bg-destructive',       label: 'text-destructive',  dot: 'bg-destructive' },
};

export function RiskChart({ riskDistribution }: RiskChartProps) {
  const total = riskDistribution.reduce((s, r) => s + r.count, 0);
  const criticalCount = riskDistribution.find((r) => r.level === 'Critical')?.count ?? 0;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-[0_4px_24px_rgba(74,44,94,0.03)]">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="font-heading font-semibold text-base text-card-foreground">
            Risk Distribution
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total} resident{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          to="/admin/caseload"
          className="text-xs font-semibold text-primary hover:text-accent transition-colors duration-150"
        >
          View caseload →
        </Link>
      </div>

      {/* Critical alert banner */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 mb-5 motion-safe:animate-pulse">
          <AlertTriangle size={13} className="text-destructive shrink-0" />
          <p className="text-xs font-semibold text-destructive">
            {criticalCount} resident{criticalCount !== 1 ? 's' : ''} at Critical risk — immediate attention needed
          </p>
        </div>
      )}

      {/* Horizontal bars */}
      <div className="space-y-4">
        {riskDistribution.map((r) => {
          const config = RISK_CONFIG[r.level] ?? {
            bar: 'bg-muted-foreground',
            label: 'text-muted-foreground',
            dot: 'bg-muted-foreground',
          };
          const pct = total > 0 ? (r.count / total) * 100 : 0;

          return (
            <div key={r.level}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-2 text-xs font-semibold text-card-foreground">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  {r.level}
                </span>
                <span className={`text-xs font-semibold tabular-nums ${config.label}`}>
                  {r.count}{' '}
                  <span className="text-muted-foreground font-normal">
                    ({pct.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${config.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total badge */}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total under care</span>
        <span className="font-heading font-semibold text-lg text-card-foreground tabular-nums">
          {total}
        </span>
      </div>
    </div>
  );
}
