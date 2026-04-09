import { Card, CardContent } from '@/components/ui/card'

export const CRISIS_HOTLINES = [
  {
    title: 'National Crisis Hotline',
    detail: 'Dial 1553 (Philippines)',
    description: 'Free 24/7 crisis support and referral service.',
  },
  {
    title: 'Child Protection Hotline',
    detail: 'Dial 163',
    description:
      'Department of Social Welfare and Development (DSWD) child protection line.',
  },
  {
    title: "Women's Crisis Center",
    detail: '(02) 8527-8001',
    description: 'Philippine Commission on Women crisis support.',
  },
  {
    title: 'Legal Aid',
    detail: "Public Attorney's Office",
    description: 'Free legal assistance for survivors of abuse.',
  },
  {
    title: 'Mental Health Support',
    detail: 'NCMH: (02) 8989-8727',
    description: 'National Center for Mental Health 24/7 crisis line.',
  },
]

export function CrisisHotlines() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CRISIS_HOTLINES.map((h, idx) => (
        <Card key={idx} className="border-border/70 bg-card/95">
          <CardContent className="p-5">
            <h3 className="font-heading text-xl font-semibold text-accent">
              {h.title}
            </h3>
            <p className="text-primary mt-2 text-sm font-semibold">
              {h.detail}
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {h.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
