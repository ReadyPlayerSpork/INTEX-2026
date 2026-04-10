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
      <div className="rounded-2xl bg-cream p-6">
        <h3 className="font-heading text-lg font-semibold text-plum">
          {title}
        </h3>
        <p className="mt-4 text-sm text-soft-purple/70">No data available.</p>
      </div>
    )
  }

  const maxPrimary = Math.max(...data.map((d) => d.value), 1)
  const maxSecondary = Math.max(
    ...data.map((d) => (d.secondaryValue !== undefined ? d.secondaryValue : 0)),
    1,
  )

  return (
    <div className="rounded-2xl bg-cream p-6">
      <h3 className="font-heading text-lg font-semibold text-plum">{title}</h3>

      <div className="mt-2 flex items-center gap-4 text-xs text-soft-purple/70">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sage" />
          {valueLabel}
        </span>
        {secondaryLabel && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-plum/40" />
            {secondaryLabel}
          </span>
        )}
      </div>
      {secondaryLabel ? (
        <p className="mt-1 text-[11px] leading-snug text-soft-purple/60">
          Bar heights are scaled independently per series so monetary and in-kind trends are both
          visible. Use each bar&apos;s tooltip for exact amounts.
        </p>
      ) : null}

      <div
        className="mt-4 flex items-end gap-1"
        style={{ height }}
        role="img"
        aria-label={`${title} bar chart`}
      >
        {data.map((point, i) => {
          const primaryHeight = (point.value / maxPrimary) * 100
          const secondaryHeight =
            point.secondaryValue !== undefined
              ? (point.secondaryValue / maxSecondary) * 100
              : 0

          return (
            <div
              key={i}
              className="group flex flex-1 flex-col items-center gap-0.5"
            >
              <div className="relative flex w-full items-end justify-center gap-0.5" style={{ height: `${height - 24}px` }}>
                <div
                  className="w-full max-w-[24px] rounded-t-md bg-sage transition-colors duration-150 hover:bg-sage/80"
                  style={{ height: `${primaryHeight}%`, minHeight: point.value > 0 ? '4px' : '0' }}
                  title={`${point.label}: ${valueLabel} ${point.value.toLocaleString()}`}
                />
                {point.secondaryValue !== undefined && (
                  <div
                    className="w-full max-w-[24px] rounded-t-md bg-plum/40 transition-colors duration-150 hover:bg-plum/60"
                    style={{ height: `${secondaryHeight}%`, minHeight: point.secondaryValue > 0 ? '4px' : '0' }}
                    title={`${point.label}: ${secondaryLabel} ${point.secondaryValue.toLocaleString()}`}
                  />
                )}
              </div>
              <span className="text-[10px] leading-tight text-soft-purple/60 truncate w-full text-center">
                {point.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
