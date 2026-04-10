import { Card, CardContent } from '@/components/ui/card'
import { CRISIS_HOTLINES } from '@/features/resources/crisisHotlinesData'

export function CrisisHotlines() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CRISIS_HOTLINES.map((h, idx) => (
        <Card key={idx} className="border-border/70 bg-card/95">
          <CardContent className="p-5">
            <h3 className="font-heading text-xl font-semibold text-accent">
              {h.title}
            </h3>
            <p className="text-primary mt-2 text-sm font-medium">{h.detail}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {h.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
