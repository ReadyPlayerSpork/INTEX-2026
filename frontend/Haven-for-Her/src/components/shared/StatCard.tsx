import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  change?: number | null
  className?: string
}

export function StatCard({ label, value, change, className }: StatCardProps) {
  return (
    <Card className={cn('border-border/70 bg-card/95', className)}>
      <CardContent className="flex flex-col items-center justify-center gap-2 p-5 text-center">
        <p className="font-heading text-primary text-2xl font-semibold tabular-nums">
          {value}
        </p>
        <p className="text-muted-foreground text-xs">{label}</p>
        {change != null && (
          <p
            className={cn(
              'text-xs font-semibold',
              change >= 0 ? 'text-primary' : 'text-destructive',
            )}
          >
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}% MoM
          </p>
        )}
      </CardContent>
    </Card>
  )
}
