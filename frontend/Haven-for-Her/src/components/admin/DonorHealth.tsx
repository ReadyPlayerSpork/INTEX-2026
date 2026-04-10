/**
 * components/admin/DonorHealth.tsx
 * Donor health indicators — Bloom palette.
 *
 * Colours:
 *   Active  → sage (primary)
 *   Lapsed  → plum (accent)
 *   Churned → warm-red (destructive)
 */

import { memo } from 'react';
import { Users, TrendingDown, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DonorHealthProps {
  active: number;
  lapsed: number;
  churned: number;
}

export const DonorHealth = memo(function DonorHealth({ active, lapsed, churned }: DonorHealthProps) {
  const items = [
    {
      label: 'Active',
      value: active,
      icon: Users,
      bg: 'bg-primary/10',
      iconColor: 'text-primary',
      note: 'Gift in last 6 mo.',
      valueColor: 'text-primary',
    },
    {
      label: 'Lapsing',
      value: lapsed,
      icon: TrendingDown,
      bg: 'bg-accent/10',
      iconColor: 'text-accent',
      note: 'Last gift 6–12 mo.',
      valueColor: 'text-accent',
    },
    {
      label: 'Churned',
      value: churned,
      icon: AlertTriangle,
      bg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      note: 'No gift 12+ mo.',
      valueColor: 'text-destructive',
    },
  ];

  return (
    <div className="h-[300px] flex flex-col rounded-2xl bg-card border border-border p-6 shadow-bloom">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="font-heading font-semibold text-base text-card-foreground">
            Donor Health
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Retention overview</p>
        </div>
        <Link
          to="/financial/donors"
          className="text-xs font-semibold text-primary hover:text-accent transition-colors duration-150"
        >
          Full insights →
        </Link>
      </div>

      {/* Three panels */}
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ label, value, icon: Icon, bg, iconColor, note, valueColor }) => (
          <div key={label} className={`rounded-2xl p-3 text-center ${bg}`}>
            {/* Icon */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 bg-card ${iconColor}`}
            >
              <Icon size={14} />
            </div>

            {/* Stat — Fraunces per style guide */}
            <p className="font-heading font-semibold text-xl text-card-foreground tabular-nums">
              {value}
            </p>
            <p className={`text-xs font-semibold mt-0.5 ${valueColor}`}>{label}</p>
            <p className="text-xs mt-1 text-muted-foreground leading-tight">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
})
