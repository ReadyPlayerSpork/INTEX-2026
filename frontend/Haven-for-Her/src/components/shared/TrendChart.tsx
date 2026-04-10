interface TrendDataPoint {
  label: string
  value: number
  secondaryValue?: number
}

interface TrendChartProps {
  data: TrendDataPoint[]
  title: string
  valueLabel?: string
  secondaryLabel?: string
  height?: number
}

export function TrendChart({
  data,
  title,
  valueLabel = 'Value',
  secondaryLabel,
  height = 200,
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-accent">
          {title}
        </h3>
        <p className="mt-4 text-sm text-muted-foreground">No data available.</p>
      </div>
    )
  }

  const maxPrimary = Math.max(...data.map((d) => d.value), 1)
  const maxSecondary = Math.max(
    ...data.map((d) => (d.secondaryValue !== undefined ? d.secondaryValue : 0)),
    1,
  )

  // Pixel-based bar column height — avoids % height quirks in flex layouts and uses theme colors
  // (bg-sage / bg-cream etc. are not in @theme; primary/accent/card are).
  const labelBandPx = 28
  const plotHeightPx = Math.max(height - labelBandPx, 48)

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h3 className="font-heading text-lg font-semibold text-accent">{title}</h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 shrink-0 rounded-sm bg-primary"
            aria-hidden
          />
          {valueLabel}
        </span>
        {secondaryLabel && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 shrink-0 rounded-sm bg-accent/45"
              aria-hidden
            />
            {secondaryLabel}
          </span>
        )}
      </div>
      {secondaryLabel ? (
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          Bar heights are scaled independently per series so monetary and in-kind trends are both
          visible. Use each bar&apos;s tooltip for exact amounts.
        </p>
      ) : null}

      <div
        className="mt-4 flex min-h-0 items-end gap-1"
        role="img"
        aria-label={`${title} bar chart`}
      >
        {data.map((point, i) => {
          const primaryPx =
            maxPrimary > 0 ? (point.value / maxPrimary) * plotHeightPx : 0
          const secondaryPx =
            point.secondaryValue !== undefined && maxSecondary > 0
              ? (point.secondaryValue / maxSecondary) * plotHeightPx
              : 0
          const showPrimary = point.value > 0
          const showSecondary =
            point.secondaryValue !== undefined && point.secondaryValue > 0

          return (
            <div
              key={i}
              className="group flex min-w-0 flex-1 flex-col items-center gap-0.5"
            >
              <div
                className="flex w-full items-end justify-center gap-0.5"
                style={{ height: plotHeightPx }}
              >
                <div
                  className="w-full max-w-[24px] shrink-0 rounded-t-md bg-primary transition-colors duration-150 hover:bg-primary/85"
                  style={{
                    height: `${Math.max(primaryPx, showPrimary ? 3 : 0)}px`,
                  }}
                  title={`${point.label}: ${valueLabel} ${point.value.toLocaleString()}`}
                />
                {point.secondaryValue !== undefined && (
                  <div
                    className="w-full max-w-[24px] shrink-0 rounded-t-md bg-accent/45 transition-colors duration-150 hover:bg-accent/65"
                    style={{
                      height: `${Math.max(secondaryPx, showSecondary ? 3 : 0)}px`,
                    }}
                    title={`${point.label}: ${secondaryLabel} ${point.secondaryValue.toLocaleString()}`}
                  />
                )}
              </div>
              <span className="w-full truncate text-center text-[10px] leading-tight text-muted-foreground">
                {point.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
