/**
 * components/admin/SafehouseOccupancy.tsx
 * Safehouse occupancy progress bars — Bloom palette.
 *
 * Color logic:
 *   < 75 % → sage (primary)   — healthy
 *   75–89 % → plum (accent)   — approaching full
 *   ≥ 90 % → warm-red (destructive) — critical
 */

import { memo } from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SafehouseOccupancyItem {
  safehouseName: string;
  activeCount: number;
  capacity: number;
}

interface SafehouseOccupancyProps {
  safehouses: SafehouseOccupancyItem[];
}

function fillClass(pct: number): string {
  if (pct >= 0.9) return 'bg-destructive';
  if (pct >= 0.75) return 'bg-accent';
  return 'bg-primary';
}

function labelClass(pct: number): string {
  if (pct >= 0.9) return 'text-destructive';
  if (pct >= 0.75) return 'text-accent';
  return 'text-primary';
}

export const SafehouseOccupancy = memo(function SafehouseOccupancy({ safehouses }: SafehouseOccupancyProps) {
  const totalActive = safehouses.reduce((s, h) => s + h.activeCount, 0);
  const totalCapacity = safehouses.reduce((s, h) => s + h.capacity, 0);

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-bloom">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-heading font-semibold text-base text-card-foreground">
            Safehouse Occupancy
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalActive} residents across {safehouses.length} location
            {safehouses.length !== 1 ? 's' : ''} · {totalCapacity} total beds
          </p>
        </div>
        <Link
          to="/admin/safehouses"
          className="text-xs font-semibold text-primary hover:text-accent transition-colors duration-150"
        >
          Manage →
        </Link>
      </div>

      {/* Progress bars — scrollable so the card stays a fixed height */}
      <div className="space-y-5 max-h-[340px] overflow-y-auto pr-0.5">
        {safehouses.map((s) => {
          const pct = s.capacity > 0 ? s.activeCount / s.capacity : 0;
          const openBeds = s.capacity - s.activeCount;
          return (
            <div key={s.safehouseName}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
                  <Home size={11} className="text-muted-foreground shrink-0" />
                  {s.safehouseName}
                </span>
                <span className={`text-xs font-semibold tabular-nums ${labelClass(pct)}`}>
                  {s.activeCount} / {s.capacity}
                </span>
              </div>

              {/* Track */}
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${fillClass(pct)}`}
                  style={{ width: `${Math.min(pct * 100, 100)}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(pct * 100)}% capacity ·{' '}
                <span className={pct >= 0.9 ? 'font-semibold text-destructive' : ''}>
                  {openBeds} open bed{openBeds !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
})
