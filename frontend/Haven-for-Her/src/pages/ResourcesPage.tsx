import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'

interface SafehouseInfo {
  safehouseId: number
  name: string
  region: string
  city: string
  province: string
  country: string
}

export function ResourcesPage() {
  const [safehouses, setSafehouses] = useState<SafehouseInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<SafehouseInfo[]>('/api/public/safehouses')
      .then(setSafehouses)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Resources and support
          </p>
          <h1 className="font-heading mt-3 text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
            Immediate help and nearby safe options
          </h1>
          <p className="text-muted-foreground mt-4 leading-8 text-pretty">
            This page is designed to help people find trustworthy support
            quickly, whether they need emergency contact information or a view
            of currently active safe homes.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="font-heading mb-4 text-2xl font-semibold text-accent">
            Crisis Hotlines
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="National Crisis Hotline"
              detail="Dial 1553 (Philippines)"
              description="Free 24/7 crisis support and referral service."
            />
            <ResourceCard
              title="Child Protection Hotline"
              detail="Dial 163"
              description="Department of Social Welfare and Development (DSWD) child protection line."
            />
            <ResourceCard
              title="Women's Crisis Center"
              detail="(02) 8527-8001"
              description="Philippine Commission on Women crisis support."
            />
            <ResourceCard
              title="Legal Aid"
              detail="Public Attorney's Office"
              description="Free legal assistance for survivors of abuse."
            />
            <ResourceCard
              title="Mental Health Support"
              detail="NCMH: (02) 8989-8727"
              description="National Center for Mental Health 24/7 crisis line."
            />
          </div>
        </section>

        <section>
          <h2 className="font-heading mb-4 text-2xl font-semibold text-accent">
            Active Safe Homes
          </h2>
          {loading ? (
            <p className="text-muted-foreground animate-pulse">Loading...</p>
          ) : safehouses.length === 0 ? (
            <p className="text-muted-foreground">No active safe homes to display.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {safehouses.map((s) => (
                <Card key={s.safehouseId} className="border-border/70 bg-card/95">
                  <CardContent className="p-5">
                    <h3 className="font-heading text-xl font-semibold text-accent">
                      {s.name}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {s.city}, {s.province}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {s.region}, {s.country}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ResourceCard({
  title,
  detail,
  description,
}: {
  title: string
  detail: string
  description: string
}) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="p-5">
        <h3 className="font-heading text-xl font-semibold text-accent">{title}</h3>
        <p className="text-primary mt-2 text-sm font-semibold">{detail}</p>
        <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
      </CardContent>
    </Card>
  )
}
