import { useEffect, useState } from 'react'
import { api } from '@/api/client'

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
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Resources & Support</h1>

      {/* Crisis resources */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Crisis Hotlines</h2>
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

      {/* Safe homes */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Active Safe Homes
        </h2>
        {loading ? (
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        ) : safehouses.length === 0 ? (
          <p className="text-muted-foreground">
            No active safe homes to display.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {safehouses.map((s) => (
              <div
                key={s.safehouseId}
                className="bg-card border-border rounded-lg border p-4"
              >
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {s.city}, {s.province}
                </p>
                <p className="text-muted-foreground text-sm">
                  {s.region}, {s.country}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
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
    <div className="bg-card border-border rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-primary text-sm font-medium">{detail}</p>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  )
}
