interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: { value: number; label: string }
}

export function MetricCard({ label, value, subtitle, trend }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-cream p-6">
      <p className="text-sm font-medium text-soft-purple">{label}</p>
      <p className="mt-1 font-heading text-3xl font-semibold text-plum">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm text-soft-purple/70">{subtitle}</p>
      )}
      {trend && (
        <p
          className={`mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-sage' : 'text-destructive'}`}
        >
          {trend.value >= 0 ? '+' : ''}
          {trend.value}% {trend.label}
        </p>
      )}
    </div>
  )
}
