/**
 * Last 6 months of monetary donation totals — SVG sparkline (no chart library).
 */

import { memo } from 'react'

interface MonthPoint {
  label: string
  year: number
  month: number
  total: number
}

interface DonationsTrendChartProps {
  months: MonthPoint[]
  formatMoney: (n: number) => string
  recurringPct: number
  oneTimePct: number
}

export const DonationsTrendChart = memo(function DonationsTrendChart({
  months,
  formatMoney,
  recurringPct,
  oneTimePct,
}: DonationsTrendChartProps) {
  const w = 320
  const h = 120
  const pad = { t: 8, r: 8, b: 28, l: 8 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b

  const max = Math.max(...months.map((m) => m.total), 1)
  const pts = months.map((m, i) => {
    const x = pad.l + (innerW * i) / Math.max(months.length - 1, 1)
    const y = pad.t + innerH - (innerH * m.total) / max
    return { x, y, ...m }
  })

  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = `${lineD} L ${pts[pts.length - 1]?.x ?? pad.l} ${pad.t + innerH} L ${pad.l} ${pad.t + innerH} Z`

  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-bloom">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-semibold text-card-foreground">
            Donations overview
          </h2>
          <p className="text-muted-foreground text-xs">
            Monthly monetary donations (last 6 months)
          </p>
        </div>
        <div className="text-right text-xs">
          <span className="text-primary font-semibold">{recurringPct}%</span>
          <span className="text-muted-foreground"> recurring · </span>
          <span className="font-semibold text-accent">{oneTimePct}%</span>
          <span className="text-muted-foreground"> one-time</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="text-primary h-auto w-full max-h-40"
        role="img"
        aria-label="Donation totals by month"
      >
        {/* Gradient stops are hard-coded because SVG stopColor can't reference CSS custom properties.
            These values must match --primary in index.css (oklch(0.528 0.094 139)). */}
        <defs>
          <linearGradient id="donFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.52 0.08 145 / 0.35)" />
            <stop offset="100%" stopColor="oklch(0.52 0.08 145 / 0)" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#donFill)" className="motion-safe:transition-opacity" />
        <path
          d={lineD}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {pts.map((p) => (
          <circle key={`${p.year}-${p.month}`} cx={p.x} cy={p.y} r={3.5} className="fill-primary" />
        ))}
        {pts.map((p) => (
          <text
            key={`l-${p.year}-${p.month}`}
            x={p.x}
            y={h - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-xs font-semibold"
          >
            {p.label}
          </text>
        ))}
      </svg>

      <p className="text-muted-foreground mt-2 text-center text-xs">
        Peak this window:{' '}
        <span className="text-card-foreground font-semibold tabular-nums">
          {formatMoney(Math.max(...months.map((m) => m.total), 0))}
        </span>
      </p>
    </div>
  )
})
