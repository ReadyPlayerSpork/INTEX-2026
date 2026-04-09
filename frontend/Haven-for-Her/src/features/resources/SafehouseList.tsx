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

interface SafehouseListProps {
  showFilter?: boolean
}

export function SafehouseList({ showFilter = false }: SafehouseListProps) {
  const [safehouses, setSafehouses] = useState<SafehouseInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [regionFilter, setRegionFilter] = useState('')

  useEffect(() => {
    api
      .get<SafehouseInfo[]>('/api/public/safehouses')
      .then(setSafehouses)
      .catch((err) => console.error('Failed to load safehouses', err))
      .finally(() => setLoading(false))
  }, [])

  const regions = [...new Set(safehouses.map((s) => s.region))].sort()
  const filtered = regionFilter
    ? safehouses.filter((s) => s.region === regionFilter)
    : safehouses

  if (loading) {
    return <p className="text-muted-foreground animate-pulse">Loading...</p>
  }

  return (
    <>
      {showFilter && (
        <div className="mb-6">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          No active safe homes to display
          {regionFilter ? ` in ${regionFilter}` : ''}.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
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
    </>
  )
}
