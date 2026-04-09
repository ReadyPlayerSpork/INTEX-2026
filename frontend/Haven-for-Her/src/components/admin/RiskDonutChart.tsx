/**
 * Risk distribution donut — conic gradient + legend (Bloom palette).
 */

import { memo } from 'react'
import { Link } from 'react-router-dom'

interface RiskLevel {
  level: string
  count: number
}

interface RiskDonutChartProps {
  riskDistribution: RiskLevel[]
  criticalCount: number
}

const ORDER = ['Low', 'Medium', 'High', 'Critical'] as const

// Hard-coded because conic-gradient in inline styles can't reference CSS custom properties.
// These must stay in sync with the Bloom palette in index.css (:root).
const COLORS: Record<string, string> = {
  Low: 'oklch(0.52 0.08 145)',       // ~--primary
  Medium: 'oklch(0.72 0.06 290)',    // lavender mid-tone
  High: 'oklch(0.48 0.12 290)',      // ~--accent (plum)
  Critical: 'oklch(0.55 0.22 25)',   // ~--destructive
}

export const RiskDonutChart = memo(function RiskDonutChart({ riskDistribution, criticalCount }: RiskDonutChartProps) {
  const map = Object.fromEntries(riskDistribution.map((r) => [r.level, r.count]))
  const ordered = ORDER.map((level) => ({ level, count: map[level] ?? 0 }))
  const total = ordered.reduce((s, r) => s + r.count, 0)

  let acc = 0
  const segments = ordered
    .filter((r) => r.count > 0)
    .map((r) => {
      const start = total > 0 ? (acc / total) * 360 : 0
      acc += r.count
      const end = total > 0 ? (acc / total) * 360 : 0
      return { ...r, start, sweep: end - start }
    })

  const gradient =
    total === 0
      ? 'oklch(0.92 0.02 290)'
      : segments
          .map((s) => {
            const c = COLORS[s.level] ?? 'oklch(0.8 0.02 290)'
            return `${c} ${s.start}deg ${s.start + s.sweep}deg`
          })
          .join(', ')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
      <h2 className="font-heading mb-1 text-base font-semibold text-card-foreground">
        Active residents by risk
      </h2>
      {criticalCount > 0 && (
        <p className="text-destructive mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold">
          {criticalCount} resident{criticalCount !== 1 ? 's' : ''} at CRITICAL level
        </p>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
        <div
          className="size-36 shrink-0 rounded-full shadow-inner ring-4 ring-border/40"
          style={{
            background: total === 0 ? gradient : `conic-gradient(from -90deg, ${gradient})`,
          }}
          role="img"
          aria-label={`Risk distribution, ${total} residents`}
        >
          <div className="bg-card m-[18%] flex size-[64%] flex-col items-center justify-center rounded-full shadow-sm">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
              Total
            </span>
            <span className="font-heading text-2xl font-bold tabular-nums text-accent">{total}</span>
          </div>
        </div>

        <ul className="grid w-full max-w-[14rem] gap-2 text-sm">
          {ordered.map((r) => (
            <li key={r.level} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: COLORS[r.level] ?? '#999' }}
                />
                <span className="text-card-foreground font-medium">{r.level}</span>
              </span>
              <span className="text-muted-foreground tabular-nums">{r.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        <Link to="/admin/caseload" className="text-primary font-semibold hover:underline">
          Review caseload →
        </Link>
      </p>
    </div>
  )
})
