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

export function FindHomePage() {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Find a Safe Home</h1>
      <p className="text-muted-foreground mb-8">
        Browse active safe homes by region. All information shown is limited to
        help you find the nearest available home.
      </p>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      ) : (
        <>
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

          {filtered.length === 0 ? (
            <p className="text-muted-foreground">
              No active safe homes found
              {regionFilter ? ` in ${regionFilter}` : ''}.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <div
                  key={s.safehouseId}
                  className="bg-card border-border rounded-lg border p-6"
                >
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {s.city}, {s.province}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {s.region}, {s.country}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
