/**
 * Last 6 months of monetary donation totals — SVG sparkline.
 *
 * Layout: no flex-col tricks. Card sizes naturally to content.
 * Chart area is a fixed-height relative container; SVG stretches inside it
 * with preserveAspectRatio="none" (safe: only fill + line, no text/circles).
 * Dots and month labels are HTML elements so they stay crisp.
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
  // SVG coordinate space — only area fill + trend line live here.
  // Generous horizontal padding so first/last labels stay inside the card.
  const w = 320
  const h = 100
  const pad = { t: 8, r: 20, b: 8, l: 20 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b

  const max = Math.max(...months.map((m) => m.total), 1)

  const pts = months.map((m, i) => {
    const x = pad.l + (innerW * i) / Math.max(months.length - 1, 1)
    const y = pad.t + innerH - (innerH * m.total) / max
    // % positions for HTML overlays — must mirror the SVG coordinate math
    const xPct = (x / w) * 100
    const yPct = (y / h) * 100
    return { x, y, xPct, yPct, ...m }
  })

  const lineD = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
  const areaD = `${lineD} L ${(pts[pts.length - 1]?.x ?? pad.l).toFixed(2)} ${h} L ${pad.l} ${h} Z`

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
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

      {/* Chart — fixed height so the card never has dead space */}
      <div className="relative h-52 w-full">
        {/* SVG: fill + line only — stretches to any height without distortion */}
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="absolute inset-0 h-full w-full text-primary"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Hard-coded oklch: SVG stopColor cannot read CSS custom properties.
                Must match --primary in index.css (oklch(0.528 0.094 139)). */}
            <linearGradient id="donFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.52 0.08 145 / 0.30)" />
              <stop offset="100%" stopColor="oklch(0.52 0.08 145 / 0)" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#donFill)" />
          <path
            d={lineD}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Dots — HTML so they stay perfectly circular */}
        {pts.map((p) => (
          <div
            key={`dot-${p.year}-${p.month}`}
            className="absolute z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-card"
            style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Month labels — centered under each dot, never clipped */}
      <div className="relative mt-2 h-5">
        {pts.map((p) => (
          <span
            key={`lbl-${p.year}-${p.month}`}
            className="absolute -translate-x-1/2 text-xs font-semibold text-muted-foreground"
            style={{ left: `${p.xPct}%` }}
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <p className="text-muted-foreground mt-3 text-center text-xs">
        Peak this window:{' '}
        <span className="text-card-foreground font-semibold tabular-nums">
          {formatMoney(Math.max(...months.map((m) => m.total), 0))}
        </span>
      </p>
    </div>
  )
})
